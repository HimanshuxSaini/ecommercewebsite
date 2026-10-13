import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';

// Ensure reliable SRV resolution on Windows environments with restricted router DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import { v2 as cloudinary } from 'cloudinary';
import {
  UserModel,
  ProductModel,
  CategoryModel,
  BannerModel,
  BrandModel,
  CouponModel,
} from '../config/mongodb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// 1. Initialize Cloudinary
const hasCloudinary =
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME &&
   process.env.CLOUDINARY_API_KEY &&
   process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function uploadToCloudinaryIfExternal(url, folder, publicIdPrefix) {
  if (!url || typeof url !== 'string') return url;
  // If already hosted on Cloudinary, don't re-upload
  if (url.includes('res.cloudinary.com')) return url;

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      public_id: `${publicIdPrefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      resource_type: 'image',
    });
    // Cloudinary dynamic URL transformation for WebP and auto quality optimization
    return result.secure_url.includes('/upload/')
      ? result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/')
      : result.secure_url;
  } catch (err) {
    console.warn(`[CLOUDINARY] Notice uploading ${url.substring(0, 50)}...:`, err.message);
    return url; // Keep original if error
  }
}

async function migrateImagesToCloudinary() {
  if (!hasCloudinary) {
    console.log('\n--------------------------------------------------------------');
    console.log('⚠️  CLOUDINARY CREDENTIALS NOT CONFIGURED IN .env');
    console.log('To migrate all images to Cloudinary, add the following to .env:');
    console.log('  CLOUDINARY_CLOUD_NAME="your_cloud_name"');
    console.log('  CLOUDINARY_API_KEY="your_api_key"');
    console.log('  CLOUDINARY_API_SECRET="your_api_secret"');
    console.log('Skipping image migration to Cloudinary CDN.');
    console.log('--------------------------------------------------------------\n');
    return;
  }

  console.log('\n[CLOUDINARY] Uploading images to Cloudinary CDN...');

  // 1. Products
  const products = readJson('products.json');
  let productUploaded = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.imageUrl && !p.imageUrl.includes('res.cloudinary.com')) {
      process.stdout.write(`  [${i + 1}/${products.length}] Uploading product: ${p.title.substring(0, 30)}...\r`);
      const newUrl = await uploadToCloudinaryIfExternal(p.imageUrl, 'velneer/products', `prod_${p.id}`);
      if (newUrl !== p.imageUrl) {
        p.imageUrl = newUrl;
        productUploaded++;
      }
    }
  }
  writeJson('products.json', products);
  console.log(`\n  ✅ Processed ${products.length} products (${productUploaded} newly uploaded to Cloudinary)`);

  // 2. Banners
  const banners = readJson('banners.json');
  let bannerUploaded = 0;
  for (let i = 0; i < banners.length; i++) {
    const b = banners[i];
    if (b.imageUrl && !b.imageUrl.includes('res.cloudinary.com')) {
      process.stdout.write(`  [${i + 1}/${banners.length}] Uploading banner: ${b.title.substring(0, 30)}...\r`);
      const newUrl = await uploadToCloudinaryIfExternal(b.imageUrl, 'velneer/banners', `banner_${b.id}`);
      if (newUrl !== b.imageUrl) {
        b.imageUrl = newUrl;
        bannerUploaded++;
      }
    }
  }
  writeJson('banners.json', banners);
  console.log(`\n  ✅ Processed ${banners.length} banners (${bannerUploaded} newly uploaded to Cloudinary)`);

  // 3. Brands
  const brands = readJson('brands.json');
  let brandUploaded = 0;
  for (let i = 0; i < brands.length; i++) {
    const br = brands[i];
    if (br.logoUrl && !br.logoUrl.includes('res.cloudinary.com')) {
      process.stdout.write(`  [${i + 1}/${brands.length}] Uploading brand logo: ${br.name}...\r`);
      const newUrl = await uploadToCloudinaryIfExternal(br.logoUrl, 'velneer/brands', `brand_${br.id}`);
      if (newUrl !== br.logoUrl) {
        br.logoUrl = newUrl;
        brandUploaded++;
      }
    }
  }
  writeJson('brands.json', brands);
  console.log(`\n  ✅ Processed ${brands.length} brands (${brandUploaded} newly uploaded to Cloudinary)`);
}

async function migrateDataToMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    console.log('\n--------------------------------------------------------------');
    console.log('⚠️  MONGODB_URI NOT CONFIGURED IN .env');
    console.log('To migrate all data to MongoDB Atlas, add your connection URI in .env:');
    console.log('  MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/velneer?retryWrites=true&w=majority"');
    console.log('Skipping data migration to MongoDB Atlas.');
    console.log('--------------------------------------------------------------\n');
    return;
  }

  console.log('\n[MONGODB] Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(uri);
    console.log('  ✅ Connected successfully to MongoDB Atlas!');

    // Read latest data (including any newly updated Cloudinary URLs)
    const products = readJson('products.json');
    const categories = readJson('categories.json');
    const banners = readJson('banners.json');
    const brands = readJson('brands.json');
    const coupons = readJson('coupons.json');
    const users = readJson('users.json');

    // 1. Products Bulk Upsert
    if (products.length > 0) {
      const ops = products.map((p) => ({
        updateOne: {
          filter: { id: p.id },
          update: { $set: p },
          upsert: true,
        },
      }));
      await ProductModel.bulkWrite(ops);
      console.log(`  ✅ Synced ${products.length} Products into MongoDB Atlas`);
    }

    // 2. Categories Bulk Upsert
    if (categories.length > 0) {
      const ops = categories.map((c) => ({
        updateOne: {
          filter: { id: c.id },
          update: { $set: c },
          upsert: true,
        },
      }));
      await CategoryModel.bulkWrite(ops);
      console.log(`  ✅ Synced ${categories.length} Categories into MongoDB Atlas`);
    }

    // 3. Banners Bulk Upsert
    if (banners.length > 0) {
      const ops = banners.map((b) => ({
        updateOne: {
          filter: { id: b.id },
          update: { $set: b },
          upsert: true,
        },
      }));
      await BannerModel.bulkWrite(ops);
      console.log(`  ✅ Synced ${banners.length} Banners into MongoDB Atlas`);
    }

    // 4. Brands Bulk Upsert
    if (brands.length > 0) {
      const ops = brands.map((br) => ({
        updateOne: {
          filter: { id: br.id },
          update: { $set: br },
          upsert: true,
        },
      }));
      await BrandModel.bulkWrite(ops);
      console.log(`  ✅ Synced ${brands.length} Brands into MongoDB Atlas`);
    }

    // 5. Coupons Bulk Upsert
    if (coupons.length > 0) {
      const ops = coupons.map((cp) => ({
        updateOne: {
          filter: { id: cp.id },
          update: { $set: cp },
          upsert: true,
        },
      }));
      await CouponModel.bulkWrite(ops);
      console.log(`  ✅ Synced ${coupons.length} Coupons into MongoDB Atlas`);
    }

    // 6. Users Bulk Upsert
    if (users.length > 0) {
      const ops = users.map((u) => ({
        updateOne: {
          filter: { id: u.id },
          update: { $set: u },
          upsert: true,
        },
      }));
      await UserModel.bulkWrite(ops);
      console.log(`  ✅ Synced ${users.length} Users into MongoDB Atlas`);
    }

    console.log('\n🎉 ALL DATA HAS BEEN SUCCESSFULLY MIGRATED TO MONGODB ATLAS!\n');
  } catch (err) {
    console.error('[MONGODB] Migration error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function run() {
  console.log('==============================================================');
  console.log('   VELNEER CLOUD MIGRATION: CLOUDINARY MEDIA + MONGODB ATLAS  ');
  console.log('==============================================================');

  await migrateImagesToCloudinary();
  await migrateDataToMongoDB();

  console.log('Migration process finished.');
  process.exit(0);
}

run();
