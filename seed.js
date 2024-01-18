
require('dotenv').config();
require('./config/database');

const Category = require('./models/category');
const Item = require('./models/item');

(async function() {

  await Category.deleteMany({});
  const categories = await Category.create([
    { name: 'Smartphones', sortOrder: 10 },
      { name: 'Laptops', sortOrder: 20 },
      { name: 'Headphones', sortOrder: 30 },
      { name: 'Smartwatches', sortOrder: 40 },
      { name: 'Accessories', sortOrder: 50 },
      { name: 'Cameras', sortOrder: 60 },
      { name: 'Gaming Consoles', sortOrder: 70 },
      { name: 'Speakers', sortOrder: 80 },
      { name: 'Wearables', sortOrder: 90 },
      { name: 'Home Appliances', sortOrder: 100 },
  ]);

  await Item.deleteMany({});
  const items = await Item.create([
    // Smartphones
    { name: 'Smartphone Model X', image: 'https://m.media-amazon.com/images/I/51D14DGf5eL._AC_SL1390_.jpg', category: categories[1], price: 799.99 },
    { name: 'SuperSlim Phone', image: 'https://m.media-amazon.com/images/I/61U3J32ttyL._AC_SL1500_.jpg', category: categories[1], price: 899.99 },
    // Laptops
    { name: 'MacBook Pro', image: 'https://m.media-amazon.com/images/I/71S4sIPFvBL._AC_SL1500_.jpg', category: categories[1], price: 1499.99 },
    { name: 'UltraLight Notebook', image: 'https://m.media-amazon.com/images/I/71qSNZSBxkL._AC_SL1500_.jpg', category: categories[1], price: 1299.99 },
    // Headphones
    { name: 'Noise-Canceling Headphones', image: 'https://m.media-amazon.com/images/I/61ZDwijKtxL._AC_SL1500_.jpg', category: categories[2], price: 129.99 },
    { name: 'Wireless Earbuds', image: 'https://m.media-amazon.com/images/I/41gGkBjThPL._AC_SL1400_.jpg', category: categories[2], price: 79.99 },
    { name: 'Gaming Headset', image: 'https://m.media-amazon.com/images/I/71Th1IE9pcL._SL1500_.jpg', category: categories[2], price: 149.99 },
    // Smartwatches
    { name: 'Advanced Smartwatch', image: 'https://m.media-amazon.com/images/I/719DHTuqS4L._AC_SL1500_.jpg', category: categories[3], price: 249.99 },
    { name: 'Fitness Tracker Watch', image: 'https://m.media-amazon.com/images/I/61WpiPLatCL._AC_SL1500_.jpg', category: categories[3], price: 129.99 },
    // Accessories
    { name: 'Fast Charging Cable', image: 'https://m.media-amazon.com/images/I/51AltCnXviL._AC_SL1200_.jpg', category: categories[4], price: 19.99 },
    { name: 'Phone Case', image: 'https://m.media-amazon.com/images/I/71Zwf0oLNeL._AC_SL1500_.jpg', category: categories[4], price: 9.99 },
    // Cameras
    { name: 'High-Resolution Camera', image: 'https://m.media-amazon.com/images/I/81RVj7JlrDL._AC_SL1500_.jpg', category: categories[5], price: 899.99 },
    { name: 'Action Camera', image: 'https://m.media-amazon.com/images/I/71p5V8+OnfL._AC_SL1500_.jpg', category: categories[5], price: 199.99 },
    // Gaming Consoles
    { name: 'Next-Gen Gaming Console', image: 'https://m.media-amazon.com/images/I/61QsQ8ix5eL._SL1470_.jpg', category: categories[6], price: 499.99 },
    { name: 'Portable Gaming Device', image: 'https://m.media-amazon.com/images/I/71UiJ0O6vTL._SL1500_.jpg', category: categories[6], price: 299.99 },
    // Speakers
    { name: 'Premium Sound Speakers', image: 'https://m.media-amazon.com/images/I/81iCnJkW3TL._AC_SL1500_.jpg', category: categories[7], price: 199.99 },
    { name: 'Bluetooth Speaker', image: 'https://m.media-amazon.com/images/I/61ZquNpiFcL._AC_SL1200_.jpg', category: categories[7], price: 79.99 },
    // Wearables
    { name: 'Fitness Tracker', image: 'https://m.media-amazon.com/images/I/51wlRf24EeL._AC_SL1000_.jpg', category: categories[8], price: 79.99 },
    { name: 'Smart Glasses', image: 'https://m.media-amazon.com/images/I/51ikAZsAFtL._AC_SL1500_.jpg', category: categories[8], price: 149.99 },
    // Home Appliances
    { name: 'Smart Refrigerator', image: 'https://m.media-amazon.com/images/I/5113c-ib3eS._AC_SL1000_.jpg', category: categories[9], price: 1299.99 },
    { name: 'Robot Vacuum Cleaner', image: 'https://m.media-amazon.com/images/I/71tWzqOqfiL._AC_SL1500_.jpg', category: categories[9], price: 299.99 },
    { name: 'Smart TV', image: 'https://m.media-amazon.com/images/I/71YkhhDj3IL._AC_SL1500_.jpg', category: categories[9], price: 1299.99 },
    { name: 'Vaccum', image: 'https://m.media-amazon.com/images/I/613doEjslUL._AC_SL1500_.jpg', category: categories[9], price: 599.99 },
  ]);

  console.log(items)

  process.exit();

})();