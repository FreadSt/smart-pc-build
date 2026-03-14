import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PlaywrightCrawler } from "crawlee";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_*_KEY in environment.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const startUrl = process.env.SCRAPER_START_URL ?? "https://example.com";

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 10,
    requestHandler: async ({ page, request }) => {
      console.log(`Crawling: ${request.url}`);

      const title = await page.title();

      // TODO: replace with your own Supabase table & schema.
      const { error } = await supabase.from("pages").insert({
        url: request.url,
        title,
        crawled_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Failed to insert into Supabase", error);
      }
    },
  });

  await crawler.run([startUrl]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

