import Product from './models/Product.js';
import User from './models/User.js';

// Logins for trying the store locally. Before deploying anywhere public, remove the shopper
// and set ADMIN_EMAIL / ADMIN_PASSWORD (read only when the account is first created).
const SEED_USERS = [
  { name: 'Demo Shopper', email: 'demo@shopnest.test', password: 'demo1234' },
  {
    name: 'Store Admin',
    email: process.env.ADMIN_EMAIL || 'admin@shopnest.test',
    password: process.env.ADMIN_PASSWORD || 'admin1234',
    isAdmin: true,
  },
];

const PRODUCTS = [
  { name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 4999, stock: 18, rating: 4.7, emoji: '🎧',
    description: 'Over-ear Bluetooth headphones with active noise cancellation, 30-hour battery and fast USB-C charging.' },
  { name: 'Smart Fitness Watch', category: 'Electronics', price: 3499, stock: 25, rating: 4.4, emoji: '⌚',
    description: 'Tracks heart rate, sleep, SpO2 and 100+ workout modes. Water resistant with a 7-day battery.' },
  { name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 1899, stock: 30, rating: 4.5, emoji: '🔊',
    description: 'Compact speaker with deep bass, IPX7 waterproofing and 12 hours of playtime.' },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 2799, stock: 12, rating: 4.6, emoji: '⌨️',
    description: 'Hot-swappable switches, RGB backlight and a solid aluminium frame for fast, satisfying typing.' },
  { name: 'Classic Cotton T-Shirt', category: 'Fashion', price: 499, stock: 60, rating: 4.3, emoji: '👕',
    description: '100% combed cotton, breathable and pre-shrunk. A wardrobe staple in a relaxed fit.' },
  { name: 'Denim Jacket', category: 'Fashion', price: 2199, stock: 15, rating: 4.5, emoji: '🧥',
    description: 'Timeless washed denim jacket with a button front and two chest pockets.' },
  { name: 'Polarized Sunglasses', category: 'Fashion', price: 1299, stock: 22, rating: 4.2, emoji: '🕶️',
    description: 'UV400 polarized lenses in a lightweight frame that cuts glare on sunny days.' },
  { name: 'Everyday Backpack', category: 'Fashion', price: 1599, stock: 20, rating: 4.6, emoji: '🎒',
    description: 'Water-resistant backpack with a padded 15.6" laptop sleeve and plenty of pockets.' },
  { name: 'Ceramic Coffee Mug', category: 'Home', price: 349, stock: 50, rating: 4.8, emoji: '☕',
    description: 'Hand-glazed 350 ml mug that keeps your coffee warm. Microwave and dishwasher safe.' },
  { name: 'LED Desk Lamp', category: 'Home', price: 1199, stock: 16, rating: 4.4, emoji: '💡',
    description: 'Dimmable lamp with three colour temperatures and a flexible neck for focused light.' },
  { name: 'Indoor Plant with Pot', category: 'Home', price: 649, stock: 14, rating: 4.7, emoji: '🪴',
    description: 'Low-maintenance snake plant in a matte ceramic pot. Perfect for desks and shelves.' },
  { name: 'Scented Soy Candle', category: 'Home', price: 449, stock: 35, rating: 4.5, emoji: '🕯️',
    description: 'Lavender and vanilla soy wax candle with a cotton wick and a 40-hour burn time.' },
  { name: 'Running Shoes', category: 'Sports', price: 3299, stock: 10, rating: 4.6, emoji: '👟',
    description: 'Lightweight cushioned running shoes with a breathable mesh upper and grippy outsole.' },
  { name: 'Yoga Mat', category: 'Sports', price: 899, stock: 28, rating: 4.5, emoji: '🧘',
    description: '6 mm non-slip mat with alignment lines and a carry strap.' },
  { name: 'English Willow Cricket Bat', category: 'Sports', price: 2499, stock: 8, rating: 4.7, emoji: '🏏',
    description: 'Grade 3 English willow bat with a cane handle, ready to play out of the box.' },
  { name: 'Match Football', category: 'Sports', price: 799, stock: 0, rating: 4.4, emoji: '⚽',
    description: 'Size 5 machine-stitched football for training and matches. Back in stock soon.' },
];

export async function seed() {
  if ((await Product.estimatedDocumentCount()) === 0) {
    await Product.insertMany(PRODUCTS);
    console.log(`Seeded ${PRODUCTS.length} products`);
  }
  for (const user of SEED_USERS) {
    if (await User.exists({ email: user.email })) continue;
    await User.create(user);
    console.log(`Created ${user.isAdmin ? 'admin' : 'demo'} user ${user.email}`);
  }
}
