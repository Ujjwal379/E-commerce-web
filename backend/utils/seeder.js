// Run: npm run seed          -> creates admin user + sample categories/products
// Run: npm run seed:destroy  -> wipes Users, Products, Categories
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const run = async () => {
  await connectDB();

  if (process.argv.includes('-d')) {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('Data destroyed.');
    process.exit();
  }

  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
    });
    console.log(`Admin created: ${process.env.ADMIN_EMAIL}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  let electronics = await Category.findOne({ name: 'Electronics' });
  if (!electronics) electronics = await Category.create({ name: 'Electronics', description: 'Gadgets and devices' });

  let apparel = await Category.findOne({ name: 'Apparel' });
  if (!apparel) apparel = await Category.create({ name: 'Apparel', description: 'Clothing and accessories' });

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
        shortDescription: 'Noise-cancelling wireless headphones',
        brand: 'SoundWave',
        category: electronics._id,
        images: [{ url: 'https://placehold.co/600x600?text=Headphones', alt: 'Headphones' }],
        price: 4999,
        discountPrice: 3999,
        stock: 50,
        sku: 'ELEC-HEAD-001',
        tags: ['audio', 'wireless', 'headphones'],
        isFeatured: true,
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Track your heart rate, steps, sleep and workouts with this waterproof smart watch.',
        shortDescription: 'Waterproof fitness tracker watch',
        brand: 'FitTrack',
        category: electronics._id,
        images: [{ url: 'https://placehold.co/600x600?text=Smart+Watch', alt: 'Smart Watch' }],
        price: 6999,
        discountPrice: 5499,
        stock: 30,
        sku: 'ELEC-WATCH-002',
        tags: ['wearable', 'fitness'],
        isFeatured: true,
      },
      {
        name: "Men's Cotton T-Shirt",
        description: '100% breathable cotton t-shirt, available in multiple sizes and colors.',
        shortDescription: 'Everyday cotton t-shirt',
        brand: 'UrbanFit',
        category: apparel._id,
        images: [{ url: 'https://placehold.co/600x600?text=T-Shirt', alt: 'T-Shirt' }],
        price: 799,
        discountPrice: 599,
        stock: 100,
        sku: 'APP-TSHIRT-003',
        variants: [
          { size: 'S', color: 'Black', stock: 25, sku: 'APP-TSHIRT-003-S-BLK' },
          { size: 'M', color: 'Black', stock: 25, sku: 'APP-TSHIRT-003-M-BLK' },
          { size: 'L', color: 'White', stock: 25, sku: 'APP-TSHIRT-003-L-WHT' },
        ],
        tags: ['clothing', 'casual'],
        isFeatured: false,
      },
    ]);
    console.log('Sample categories and products created.');
  } else {
    console.log('Products already exist, skipping sample data.');
  }

  console.log('Seeding complete.');
  process.exit();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
