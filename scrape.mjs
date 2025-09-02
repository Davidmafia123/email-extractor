import { extractData } from './parser.mjs';

// This will be the main entry point for the CLI tool.

function parseArgs() {
  const args = {};
  const rawArgs = process.argv.slice(2);

  for (const arg of rawArgs) {
    if (arg.startsWith('--')) {
      const parts = arg.substring(2).split('=');
      const key = parts[0];
      const value = parts.slice(1).join('=');
      // This is a simplified parser. It doesn't handle nested objects
      // like `collect` correctly yet. We'll treat them as flags for now.
      if (value === '') {
        // Handle boolean flags like --collect.emails
        const keys = key.split('.');
        if (keys.length === 2) {
          if (!args[keys[0]]) {
            args[keys[0]] = {};
          }
          args[keys[0]][keys[1]] = true;
        } else {
          args[key] = true;
        }
      } else {
        // Handle key-value pairs like --query="some query"
        args[key] = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      }
    }
  }

  // Set defaults
  if (!args.pageLimit) args.pageLimit = 10;
  if (!args.output) args.output = 'json';
  if (!args.collect) {
      args.collect = {
          emails: true,
          urls: true,
          domains: true,
          phones: true,
          socials: ['twitter', 'linkedin', 'instagram'],
      }
  }


  return args;
}

async function scrape(options) {
  const { cseUrl, query, pageLimit } = options;

  // Replace placeholders in the cseUrl
  const startUrl = cseUrl.replace('{query}', encodeURIComponent(query)).replace('{start}', '0');

  console.log(`Scraping URL: ${startUrl}`);

  try {
    const response = await fetch(startUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      console.error(`Error fetching page: ${response.status} ${response.statusText}`);
      return;
    }
    const html = await response.text();
    console.log('Successfully fetched page. Full HTML received:');
    console.log(html);

    console.log('\\n\\n--- PARSING ---');
    const results = extractData(html, options.collect);

    console.log('Parsing complete. Found results:');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('An error occurred during scraping:', error);
  }
}


async function main() {
    const argv = parseArgs();
    console.log('Scraper starting with the following options:');
    console.log(JSON.stringify(argv, null, 2));
    await scrape(argv);
}

main();
