// crawler/crawl.js
import { CheerioCrawler, Dataset } from 'crawlee';

export async function crawlSite(startUrl, maxPages = 200) {
  const pages = [];

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: maxPages,
    async requestHandler({ request, $, enqueueLinks }) {
      // Basic text extraction — improve with selectors for your site
      const title = $('title').text() || '';
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
      const url = request.url;
      pages.push({ url, title, text: (title + '\n\n' + bodyText).trim() });

      // enqueue internal links
      await enqueueLinks({
        globs: [new URL(startUrl).origin + '/**']
      });
    },
  });

  await crawler.run([startUrl]);
  return pages; // [{url, title, text}, ...]
}
