#!/usr/bin/env python3
"""
AI content ingestion pipeline for AI-Driven Nexus Blog.

It reads Markdown/MDX drafts, asks an OpenAI-compatible model for structured
editorial output, validates obvious code snippets locally, and writes enriched
content into Astro content collections.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
import time
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv
from openai import OpenAI


ROOT = Path(__file__).resolve().parents[1]
FENCE_RE = re.compile(r"```(?P<lang>[A-Za-z0-9_+.#-]*)\n(?P<code>.*?)```", re.DOTALL)


@dataclass
class Settings:
    input_dir: Path
    output_dir: Path
    base_url: str
    api_key: str
    model: str
    small_model: str
    max_retries: int
    rpm: int
    localize_langs: list[str]


def load_settings() -> Settings:
    load_dotenv(ROOT / ".env")
    return Settings(
        input_dir=ROOT / os.getenv("AI_INPUT_DIR", "drafts"),
        output_dir=ROOT / os.getenv("AI_OUTPUT_DIR", "src/content/blog"),
        base_url=os.getenv("LLM_BASE_URL", "https://api.openai.com/v1"),
        api_key=os.getenv("LLM_API_KEY", ""),
        model=os.getenv("LLM_MODEL", "gpt-5.2"),
        small_model=os.getenv("LLM_SMALL_MODEL", os.getenv("LLM_MODEL", "gpt-5.2")),
        max_retries=int(os.getenv("AI_MAX_RETRIES", "6")),
        rpm=max(1, int(os.getenv("AI_RATE_LIMIT_RPM", "30"))),
        localize_langs=[
            lang.strip()
            for lang in os.getenv("AI_LOCALIZE_LANGS", "en,zh,ja").split(",")
            if lang.strip()
        ],
    )


def split_frontmatter(markdown: str) -> tuple[dict[str, Any], str]:
    if not markdown.startswith("---\n"):
        return {}, markdown
    end = markdown.find("\n---", 4)
    if end == -1:
        return {}, markdown
    raw = markdown[4:end].strip()
    body = markdown[end + 4 :].lstrip()
    return yaml.safe_load(raw) or {}, body


def dump_frontmatter(data: dict[str, Any]) -> str:
    ordered = {
        key: data[key]
        for key in [
            "title",
            "description",
            "date",
            "updated",
            "tags",
            "category",
            "draft",
            "featured",
            "summary",
            "aiSummary",
            "aiGenerated",
            "language",
            "cover",
            "canonical",
            "jsonLd",
        ]
        if key in data and data[key] is not None
    }
    return "---\n" + yaml.safe_dump(ordered, allow_unicode=True, sort_keys=False).strip() + "\n---\n\n"


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", value, flags=re.UNICODE)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value or "untitled"


def extract_code_blocks(markdown: str) -> list[dict[str, str]]:
    return [
        {"language": match.group("lang").lower(), "code": match.group("code")}
        for match in FENCE_RE.finditer(markdown)
    ]


def validate_code_blocks(blocks: list[dict[str, str]]) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for index, block in enumerate(blocks, start=1):
        lang = block["language"]
        code = block["code"]
        if lang in {"py", "python"}:
            with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as tmp:
                tmp.write(code)
                tmp_path = tmp.name
            try:
                proc = subprocess.run(
                    [sys.executable, "-m", "py_compile", tmp_path],
                    capture_output=True,
                    text=True,
                    timeout=20,
                )
                status = "ok" if proc.returncode == 0 else "error"
                message = proc.stderr.strip() or "Python syntax ok"
            finally:
                Path(tmp_path).unlink(missing_ok=True)
            results.append({"block": str(index), "language": lang, "status": status, "message": message})
        elif lang == "go" and shutil.which("gofmt"):
            proc = subprocess.run(
                ["gofmt"],
                input=code,
                capture_output=True,
                text=True,
                timeout=20,
            )
            status = "ok" if proc.returncode == 0 else "error"
            message = proc.stderr.strip() or "Go syntax/format ok"
            results.append({"block": str(index), "language": lang, "status": status, "message": message})
        elif lang in {"java", "spring", "kotlin"}:
            results.append(
                {
                    "block": str(index),
                    "language": lang,
                    "status": "skipped",
                    "message": "JVM snippet validation requires a project context.",
                }
            )
    return results


def build_schema() -> dict[str, Any]:
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "processed_blog_post",
            "strict": True,
            "schema": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "summary": {"type": "string"},
                    "category": {"type": "string"},
                    "tags": {"type": "array", "items": {"type": "string"}},
                    "risk_level": {"type": "string", "enum": ["low", "medium", "high"]},
                    "issues": {"type": "array", "items": {"type": "string"}},
                    "fixes": {"type": "array", "items": {"type": "string"}},
                    "markdown": {"type": "string"},
                    "jsonLd": {"type": "object", "additionalProperties": True},
                    "translations": {
                        "type": "object",
                        "additionalProperties": {"type": "string"},
                    },
                    "og_prompt": {"type": "string"},
                },
                "required": [
                    "title",
                    "description",
                    "summary",
                    "category",
                    "tags",
                    "risk_level",
                    "issues",
                    "fixes",
                    "markdown",
                    "jsonLd",
                    "translations",
                    "og_prompt",
                ],
            },
        },
    }


class RateLimiter:
    def __init__(self, rpm: int) -> None:
        self.min_interval = 60.0 / rpm
        self.last_call = 0.0

    def wait(self) -> None:
        elapsed = time.monotonic() - self.last_call
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_call = time.monotonic()


def call_llm(
    client: OpenAI,
    settings: Settings,
    limiter: RateLimiter,
    frontmatter: dict[str, Any],
    body: str,
    code_report: list[dict[str, str]],
) -> dict[str, Any]:
    system = textwrap.dedent(
        """
        You are a senior technical editor, SEO architect, localization editor,
        and static-site content engineer. Do not reveal hidden reasoning.
        Return only schema-valid JSON. Preserve the author's voice. Fix obvious
        Markdown formatting. Use structured critique instead of chain-of-thought.
        """
    ).strip()
    user = {
        "frontmatter": frontmatter,
        "markdown": body,
        "localize_languages": settings.localize_langs,
        "local_code_validation": code_report,
        "requirements": [
            "Find logical gaps, unclear claims, broken code snippets, and SEO problems.",
            "Return final Markdown body without frontmatter.",
            "Generate compact tags and one category.",
            "Generate Article JSON-LD object.",
            "Translate the final Markdown to requested languages.",
            "Generate a visual prompt for an OG cover.",
        ],
    }

    for attempt in range(settings.max_retries):
        try:
            limiter.wait()
            response = client.chat.completions.create(
                model=settings.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": json.dumps(user, ensure_ascii=False)},
                ],
                temperature=0.2,
                response_format=build_schema(),
            )
            content = response.choices[0].message.content or "{}"
            return json.loads(content)
        except Exception as exc:  # noqa: BLE001 - this is a CLI boundary.
            if attempt == settings.max_retries - 1:
                raise RuntimeError(f"LLM processing failed after retries: {exc}") from exc
            sleep_for = min(60, 2**attempt)
            print(f"[retry] {exc} -> sleeping {sleep_for}s", file=sys.stderr)
            time.sleep(sleep_for)
    raise RuntimeError("unreachable")


def generate_svg_cover(title: str, subtitle: str, out_path: Path) -> str:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#111418"/>
  <rect x="70" y="70" width="1060" height="490" rx="28" fill="#181d24" stroke="#2dd4bf" stroke-opacity=".38"/>
  <text x="118" y="210" fill="#2dd4bf" font-family="Segoe UI, sans-serif" font-size="30" font-weight="700">AI-Driven Nexus Blog</text>
  <text x="118" y="314" fill="#edf1f7" font-family="Segoe UI, sans-serif" font-size="58" font-weight="700">{escape_svg(title[:34])}</text>
  <text x="118" y="386" fill="#9aa4b2" font-family="Segoe UI, sans-serif" font-size="28">{escape_svg(subtitle[:62])}</text>
</svg>"""
    out_path.write_text(svg, encoding="utf-8")
    return "/" + out_path.relative_to(ROOT / "public").as_posix()


def escape_svg(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def process_file(path: Path, settings: Settings, client: OpenAI | None, dry_run: bool) -> None:
    source = path.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(source)
    code_report = validate_code_blocks(extract_code_blocks(body))

    if client is None:
        title = frontmatter.get("title") or path.stem.replace("-", " ").title()
        processed = {
            "title": title,
            "description": frontmatter.get("description") or f"{title} 的整理稿。",
            "summary": frontmatter.get("summary") or frontmatter.get("description") or "",
            "category": frontmatter.get("category") or "General",
            "tags": frontmatter.get("tags") or ["draft"],
            "markdown": body,
            "jsonLd": {},
            "translations": {},
            "og_prompt": "",
            "issues": [],
            "fixes": [],
            "risk_level": "low",
        }
    else:
        processed = call_llm(
            client=client,
            settings=settings,
            limiter=RateLimiter(settings.rpm),
            frontmatter=frontmatter,
            body=body,
            code_report=code_report,
        )

    slug = slugify(frontmatter.get("slug") or processed["title"])
    cover = generate_svg_cover(
        processed["title"],
        processed["description"],
        ROOT / "public" / "og" / f"{slug}.svg",
    )
    final_frontmatter = {
        **frontmatter,
        "title": processed["title"],
        "description": processed["description"],
        "date": str(frontmatter.get("date") or date.today().isoformat()),
        "updated": str(date.today().isoformat()),
        "tags": processed["tags"],
        "category": processed["category"],
        "draft": False,
        "summary": processed["summary"],
        "aiSummary": processed["summary"],
        "aiGenerated": client is not None,
        "language": frontmatter.get("language", "zh"),
        "cover": cover,
        "jsonLd": processed["jsonLd"],
    }
    output = dump_frontmatter(final_frontmatter) + processed["markdown"].strip() + "\n"
    out_path = settings.output_dir / f"{slug}.mdx"

    if dry_run:
        print(f"[dry-run] would write {out_path}")
        print(json.dumps({k: processed[k] for k in ["risk_level", "issues", "fixes"]}, ensure_ascii=False, indent=2))
        return

    settings.output_dir.mkdir(parents=True, exist_ok=True)
    out_path.write_text(output, encoding="utf-8")
    print(f"[ok] wrote {out_path}")

    for lang, translated in processed.get("translations", {}).items():
        if lang == final_frontmatter["language"]:
            continue
        lang_path = settings.output_dir / f"{slug}.{lang}.mdx"
        localized_frontmatter = {**final_frontmatter, "language": lang, "canonical": f"/blog/{slug}"}
        lang_path.write_text(dump_frontmatter(localized_frontmatter) + translated.strip() + "\n", encoding="utf-8")
        print(f"[ok] wrote {lang_path}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-ai", action="store_true", help="Process drafts without calling the LLM.")
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    settings = load_settings()
    if args.input:
        settings.input_dir = args.input
    if args.output:
        settings.output_dir = args.output

    if not settings.input_dir.exists():
        print(f"[skip] input directory does not exist: {settings.input_dir}")
        return 0

    client = None
    if not args.no_ai:
        if not settings.api_key:
            raise SystemExit("LLM_API_KEY is required unless --no-ai is used.")
        client = OpenAI(api_key=settings.api_key, base_url=settings.base_url)

    drafts = sorted(settings.input_dir.glob("**/*.md*"))
    if not drafts:
        print(f"[skip] no drafts found in {settings.input_dir}")
        return 0

    for draft in drafts:
        process_file(draft, settings, client, args.dry_run)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
