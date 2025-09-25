// File: convert_csv.js
const fs = require('fs');

const files = ['tools.json', 'literature.json', 'training.json', 'use_cases.json'];

function getPropertyValue(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':
      return prop.title[0]?.plain_text || '';
    case 'rich_text':
      return prop.rich_text.map(rt => rt.plain_text).join('');
    case 'number':
      return prop.number !== null ? String(prop.number) : '';
    case 'url':
      return prop.url || '';
    case 'select':
      return prop.select?.name || '';
    case 'multi_select':
      return prop.multi_select.map(s => s.name).join(', ');
    case 'email':
      return prop.email || '';
    case 'date':
      return prop.date?.start || '';
    case 'relation':
      return prop.relation.map(r => r.id).join(', ');
    default:
      return '';
  }
}

function toCsvCell(str) {
    str = String(str);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

console.log('Starting JSON to CSV conversion...');
for (const jsonFile of files) {
  if (!fs.existsSync(jsonFile)) {
    console.warn(`Warning: ${jsonFile} not found, skipping.`);
    continue;
  }
  
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const csvFile = jsonFile.replace('.json', '.csv');

  if (data.length === 0) {
    console.log(`${jsonFile} is empty, creating an empty ${csvFile}.`);
    fs.writeFileSync(csvFile, ""); // Create an empty file for empty databases
    continue;
  }

  const headers = Object.keys(data[0].properties);
  const csvHeaders = headers.map(toCsvCell).join(',');
  const csvRows = data.map(page => {
    return headers.map(header => {
      const value = getPropertyValue(page.properties[header]);
      return toCsvCell(value);
    }).join(',');
  });

  const csvContent = [csvHeaders, ...csvRows].join('\n');
  fs.writeFileSync(csvFile, csvContent);
  console.log(`Successfully converted ${jsonFile} to ${csvFile}`);
}
console.log('CSV conversion process completed.');
