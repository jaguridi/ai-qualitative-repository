// File: fetch_json.js
const { Client } = require('@notionhq/client');
const fs = require('fs');

// Ensure all required environment variables are present
const requiredEnv = ['NOTION_API_KEY', 'NOTION_TOOLS_DB_ID', 'NOTION_LITERATURE_DB_ID', 'NOTION_TRAINING_DB_ID', 'NOTION_USE_CASES_DB_ID'];
for (const envVar of requiredEnv) {
    if (!process.env[envVar]) {
        console.error(`Error: Missing required environment variable ${envVar}`);
        process.exit(1);
    }
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const databases = {
  'tools.json': process.env.NOTION_TOOLS_DB_ID,
  'literature.json': process.env.NOTION_LITERATURE_DB_ID,
  'training.json': process.env.NOTION_TRAINING_DB_ID,
  'use_cases.json': process.env.NOTION_USE_CASES_DB_ID
};

async function fetchAllPages(databaseId) {
  let results = [];
  let hasMore = true;
  let startCursor = undefined;
  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
    });
    results = results.concat(response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }
  return results;
}

async function backup() {
  console.log('Starting Notion backup process...');
  for (const [fileName, dbId] of Object.entries(databases)) {
    if (dbId) {
      console.log(`Fetching data for ${fileName}...`);
      try {
        const pages = await fetchAllPages(dbId);
        fs.writeFileSync(fileName, JSON.stringify(pages, null, 2));
        console.log(`Successfully saved ${fileName}`);
      } catch (error) {
        console.error(`Failed to fetch database for ${fileName}. Error: ${error.message}`);
        process.exit(1);
      }
    }
  }
  console.log('Notion backup process completed successfully.');
}

backup();
