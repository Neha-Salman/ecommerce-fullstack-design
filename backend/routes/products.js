import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// 15 Sample products across categories: Electronics, Clothing, Home & Kitchen, Sports, Accessories
let sampleProducts = [
  {
    id: 1,
    name: "Smart Watch Silver Series 6",
    price: 19.99,
    image: "/deal_smartwatch.png",
    description: "High-fidelity smart watch featuring heart rate monitor, sleep tracking, fitness tracking, and full notifications sync.",
    category: "Electronics",
    stock: 25
  },
  {
    id: 2,
    name: "GoPro HERO 8 Action Camera",
    price: 299.00,
    image: "/deal_camera.png",
    description: "Capture smooth 4K videos and high-quality photos during any outdoor sports or under-water activities.",
    category: "Electronics",
    stock: 12
  },
  {
    id: 3,
    name: "Laptops Intel Core i7 16GB",
    price: 899.00,
    image: "/deal_laptop.png",
    description: "High-performance laptop with Intel Core i7 processor, 16GB RAM, and 512GB SSD for coding and gaming.",
    category: "Electronics",
    stock: 8
  },
  {
    id: 4,
    name: "Regular Fit Resort Shirt",
    price: 35.50,
    image: "/recommended_tshirt.png",
    description: "Breathable and stylish shirt designed for casual summer wear and resort vacations.",
    category: "Clothing",
    stock: 45
  },
  {
    id: 5,
    name: "Classic Leather Jacket Men",
    price: 120.00,
    image: "/recommended_coat.png",
    description: "Premium quality genuine leather jacket designed for comfort and rugged look. Water-resistant and durable.",
    category: "Clothing",
    stock: 15
  },
  {
    id: 6,
    name: "Casual Blue Denim Jeans",
    price: 49.99,
    image: "/recommended_jeans.jpg",
    description: "Classic blue denim jeans with a modern fit, perfect for everyday use and outdoor casual events.",
    category: "Clothing",
    stock: 30
  },
  {
    id: 7,
    name: "Peach Armchair Soft Comfort",
    price: 89.00,
    image: "/soft_chair.png",
    description: "Soft velvet armchair in peach color. Enhances home interior style and provides long-lasting comfort.",
    category: "Home & Kitchen",
    stock: 5
  },
  {
    id: 8,
    name: "Espresso Maker Coffee Machine",
    price: 150.00,
    image: "/coffee_maker_home.png",
    description: "Programmable espresso machine with steam wand for cappuccino and latte. Enjoy barista quality coffee at home.",
    category: "Home & Kitchen",
    stock: 10
  },
  {
    id: 9,
    name: "Professional Kitchen Blender",
    price: 59.99,
    image: "/blender.png",
    description: "High speed countertop blender for smoothies and shakes. Features 3 speeds and a pulse control.",
    category: "Home & Kitchen",
    stock: 18
  },
  {
    id: 10,
    name: "Carbon Fiber Tennis Racket",
    price: 79.99,
    image: "/recommended_smartwatch.png",
    description: "Lightweight carbon fiber tennis racket for advanced control, speed, and durability on court.",
    category: "Sports",
    stock: 14
  },
  {
    id: 11,
    name: "Professional Leather Soccer Ball",
    price: 24.99,
    image: "/deal_phone.png",
    description: "Official size 5 leather soccer ball with textured casing for optimal touch, control, and durability.",
    category: "Sports",
    stock: 50
  },
  {
    id: 12,
    name: "Mountain Trail Running Shoes",
    price: 85.00,
    image: "/recommended_tshirt.png",
    description: "Designed for rugged trails, featuring high traction outsole and responsive cushioning for comfort.",
    category: "Sports",
    stock: 20
  },
  {
    id: 13,
    name: "Leather Wallet with RFID Shield",
    price: 15.99,
    image: "/deal_smartwatch.png",
    description: "Slim bifold wallet made from genuine leather with built-in RFID blocking technology to protect card data.",
    category: "Accessories",
    stock: 100
  },
  {
    id: 14,
    name: "Aviator Sunglasses Classic Black",
    price: 18.50,
    image: "/deal_camera.png",
    description: "Classic aviator sunglasses with polarized lenses, lightweight frame, and UV protection.",
    category: "Accessories",
    stock: 60
  },
  {
    id: 15,
    name: "Canvas Travel Backpack Large",
    price: 39.99,
    image: "/laptop_electronics.png",
    description: "Large capacity canvas backpack with multiple compartments and laptop sleeve for hiking and travel.",
    category: "Accessories",
    stock: 35
  }
];

// Helper to check MongoDB connection status
const isConnected = () => mongoose.connection.readyState === 1;

// 1. GET /api/products/search - search products by name or category
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json(isConnected() ? await Product.find({}) : sampleProducts);
    }
    const searchStr = String(q).toLowerCase();

    if (isConnected()) {
      const regex = new RegExp(q, 'i');
      const results = await Product.find({
        $or: [
          { name: regex },
          { category: regex }
        ]
      });
      res.json(results);
    } else {
      // In-Memory search fallback
      const filtered = sampleProducts.filter(item => 
        item.name.toLowerCase().includes(searchStr) || 
        item.category.toLowerCase().includes(searchStr)
      );
      res.json(filtered);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/products - fetch all products
router.get('/', async (req, res) => {
  try {
    if (isConnected()) {
      const products = await Product.find({});
      res.json(products);
    } else {
      res.json(sampleProducts);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/products/:id - fetch single product by ID
router.get('/:id', async (req, res) => {
  try {
    const idVal = Number(req.params.id);
    if (isConnected()) {
      let product;
      if (!isNaN(idVal)) {
        product = await Product.findOne({ id: idVal });
      }
      if (!product && mongoose.Types.ObjectId.isValid(req.params.id)) {
        product = await Product.findById(req.params.id);
      }
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } else {
      // In-Memory lookup
      const product = sampleProducts.find(item => item.id === idVal);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST /api/products - create a new product
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const count = isConnected() ? await Product.countDocuments() : sampleProducts.length;
    const newId = req.body.id || (count + 1000 + Math.floor(Math.random() * 1000));
    
    if (isConnected()) {
      const product = new Product({
        ...req.body,
        id: newId
      });
      const savedProduct = await product.save();
      res.status(201).json(savedProduct);
    } else {
      // In-Memory save
      const newProduct = {
        ...req.body,
        id: newId,
        price: Number(req.body.price || 0),
        stock: Number(req.body.stock || 0)
      };
      sampleProducts.push(newProduct);
      res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. PUT /api/products/:id - update a product
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const idVal = Number(req.params.id);
    if (isConnected()) {
      let updatedProduct;
      if (!isNaN(idVal)) {
        updatedProduct = await Product.findOneAndUpdate({ id: idVal }, req.body, { new: true });
      }
      if (!updatedProduct && mongoose.Types.ObjectId.isValid(req.params.id)) {
        updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      }
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(updatedProduct);
    } else {
      // In-Memory update
      const index = sampleProducts.findIndex(item => item.id === idVal);
      if (index === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }
      sampleProducts[index] = {
        ...sampleProducts[index],
        ...req.body,
        id: idVal // enforce consistency
      };
      res.json(sampleProducts[index]);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. DELETE /api/products/:id - delete a product
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const idVal = Number(req.params.id);
    if (isConnected()) {
      let deletedProduct;
      if (!isNaN(idVal)) {
        deletedProduct = await Product.findOneAndDelete({ id: idVal });
      }
      if (!deletedProduct && mongoose.Types.ObjectId.isValid(req.params.id)) {
        deletedProduct = await Product.findByIdAndDelete(req.params.id);
      }
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully', deletedProduct });
    } else {
      // In-Memory delete
      const index = sampleProducts.findIndex(item => item.id === idVal);
      if (index === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const deletedProduct = sampleProducts.splice(index, 1)[0];
      res.json({ message: 'Product deleted successfully', deletedProduct });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export raw sample data for server seeding
export { sampleProducts };

export default router;
