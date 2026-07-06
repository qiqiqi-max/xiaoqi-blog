#!/usr/bin/env node
import { createServer } from "node:http";
import { createContentFile, buildContentFile } from "./content-utils.mjs";

const host = "127.0.0.1";
const port = Number(process.env.STUDIO_PORT || 8787);
const allowedOrigins = new Set(["http://127.0.0.1:4321", "http://localhost:4321"]);

function sendJson(request, response, status, payload) {
  const origin = request.headers.origin;
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "http://127.0.0.1:4321",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) {
    return {};
  }

  return JSON.parse(text);
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(request, response, 200, { ok: true });
    return;
  }

  if (request.url === "/health" && request.method === "GET") {
    sendJson(request, response, 200, { ok: true, service: "nexus-studio-writer" });
    return;
  }

  if (request.url === "/preview" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      const output = buildContentFile(payload);
      sendJson(request, response, 200, {
        ok: true,
        fileName: output.fileName,
        filePath: output.filePath,
        collection: output.collection,
        content: output.content
      });
    } catch (error) {
      sendJson(request, response, 400, {
        ok: false,
        message: error instanceof Error ? error.message : String(error)
      });
    }
    return;
  }

  if (request.url === "/content" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      const output = await createContentFile(payload);
      sendJson(request, response, 201, {
        ok: true,
        fileName: output.fileName,
        filePath: output.filePath,
        collection: output.collection
      });
    } catch (error) {
      sendJson(request, response, error?.code === "EEXIST" ? 409 : 400, {
        ok: false,
        message: error instanceof Error ? error.message : String(error)
      });
    }
    return;
  }

  sendJson(request, response, 404, { ok: false, message: "Not found." });
});

server.listen(port, host, () => {
  console.log(`Nexus Studio writer listening on http://${host}:${port}`);
});
