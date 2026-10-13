import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  INITIAL_BRANDS,
  INITIAL_COUPONS,
  INITIAL_USERS,
} from '../src/data/mockData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function writeIfNotExists(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf-8').trim() === '[]') {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[SEED] Pre-populated ${filename} (${data.length} records)`);
  }
}

export function seedDatabase() {
  try {
    writeIfNotExists('products.json', INITIAL_PRODUCTS);
    writeIfNotExists('categories.json', INITIAL_CATEGORIES);
    writeIfNotExists('banners.json', INITIAL_BANNERS);
    writeIfNotExists('brands.json', INITIAL_BRANDS);
    writeIfNotExists('coupons.json', INITIAL_COUPONS);
    writeIfNotExists('users.json', INITIAL_USERS);
    console.log('[SEED] Database seed check completed successfully.');
  } catch (err) {
    console.error('[SEED] Error seeding data:', err.message);
  }
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
