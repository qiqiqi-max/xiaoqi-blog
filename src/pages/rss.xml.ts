import rss from "@astrojs/rss";
import { getPublishedBlog } from "@/lib/content";
import { site } from "@/lib/site";

export async function GET() {
  const posts = await getPublishedBlog();
  return rss({
    title: site.name,
    description: site.description,
    site: site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}`
    }))
  });
}
