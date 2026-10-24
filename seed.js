const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/product');
const Category = require('./models/categories');
const User = require('./models/user');
const Admin = require('./models/admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blinkit';

const sampleProducts = [
    // Dairy & Breakfast
    {
        name: 'Amul Taaza Fresh Toned Milk',
        price: 27,
        category: 'Dairy & Breakfast',
        stock: 50,
        description: 'Pasteurised toned milk with 3.0% fat and 8.5% SNF. Fresh & nutritious daily essential.',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'
    },
    {
        name: 'Amul Salted Butter (100g)',
        price: 58,
        category: 'Dairy & Breakfast',
        stock: 45,
        description: 'Pure, creamy, and golden Amul butter. Perfect for breakfast toast and cooking.',
        imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80'
    },
    {
        name: 'Britannia 100% Whole Wheat Brown Bread',
        price: 45,
        category: 'Dairy & Breakfast',
        stock: 30,
        description: 'Wholesome brown bread made with 100% whole wheat flour, rich in dietary fiber.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80'
    },
    {
        name: 'Farm Fresh White Eggs (Pack of 6)',
        price: 54,
        category: 'Dairy & Breakfast',
        stock: 60,
        description: 'Fresh farm eggs rich in protein, cleaned and graded for premium quality.',
        imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80'
    },
    {
        name: 'Epigamia Greek Natural Yogurt (120g)',
        price: 40,
        category: 'Dairy & Breakfast',
        stock: 25,
        description: 'Strained natural yogurt with double the protein and silky smooth texture.',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80'
    },

    // Fruits & Vegetables
    {
        name: 'Fresh Red Onion (1 kg)',
        price: 38,
        category: 'Fruits & Vegetables',
        stock: 100,
        description: 'Crisp, pungent red onions sourced directly from certified farms.',
        imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80'
    },
    {
        name: 'Hybrid Fresh Tomatoes (1 kg)',
        price: 34,
        category: 'Fruits & Vegetables',
        stock: 90,
        description: 'Juicy, firm, and vibrant red tomatoes suitable for curries and salads.',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80'
    },
    {
        name: 'Fresh Jyoti Potato (1 kg)',
        price: 28,
        category: 'Fruits & Vegetables',
        stock: 120,
        description: 'High-grade farm fresh potatoes, ideal for everyday cooking and fries.',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80'
    },
    {
        name: 'Robusta Cavendish Bananas (500g)',
        price: 39,
        category: 'Fruits & Vegetables',
        stock: 40,
        description: 'Naturally sweet and potassium-rich ripe Cavendish bananas.',
        imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80'
    },
    {
        name: 'Royal Gala Crisp Apples (4 pcs)',
        price: 135,
        category: 'Fruits & Vegetables',
        stock: 35,
        description: 'Imported sweet and crunchy Royal Gala apples packed with antioxidants.',
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80'
    },

    // Snacks & Munchies
    {
        name: "Lay's India's Magic Masala Chips (50g)",
        price: 20,
        category: 'Snacks & Munchies',
        stock: 80,
        description: 'Classic spicy and tangy magic masala potato chips from Lay’s.',
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80'
    },
    {
        name: 'Uncle Chipps Spicy Treat (48g)',
        price: 20,
        category: 'Snacks & Munchies',
        stock: 75,
        description: 'Desi spiced potato wafers with an irresistible crunch.',
        imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&q=80'
    },
    {
        name: 'Kurkure Masala Munch (82g)',
        price: 20,
        category: 'Snacks & Munchies',
        stock: 90,
        description: 'Tedha par mera crunchy corn puff snack with authentic Indian masala.',
        imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&q=80'
    },
    {
        name: 'Doritos Cheese Supreme Nachos (60g)',
        price: 50,
        category: 'Snacks & Munchies',
        stock: 50,
        description: 'Crispy corn tortilla chips coated with delicious nacho cheese.',
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80'
    },

    // Cold Drinks & Juices
    {
        name: 'Coca-Cola Soft Drink Bottle (750 ml)',
        price: 40,
        category: 'Cold Drinks & Juices',
        stock: 65,
        description: 'The world’s favourite refreshing carbonated cola beverage.',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80'
    },
    {
        name: 'Thums Up Charged (750 ml)',
        price: 40,
        category: 'Cold Drinks & Juices',
        stock: 70,
        description: 'Strong, fizzy, and thunderous taste cola drink.',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80'
    },
    {
        name: 'Frooti Real Mango Drink (600 ml)',
        price: 35,
        category: 'Cold Drinks & Juices',
        stock: 60,
        description: 'Juicy Alphonso mango pulp beverage bursting with real mango flavor.',
        imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80'
    },

    // Instant & Packaged Food
    {
        name: 'Maggi 2-Minute Masala Noodles (Pack of 4)',
        price: 56,
        category: 'Instant & Packaged Food',
        stock: 120,
        description: 'Favourite quick 2-minute instant noodles with the iconic masala tastemaker.',
        imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80'
    },
    {
        name: 'Kellogg’s Corn Flakes Original (475g)',
        price: 185,
        category: 'Instant & Packaged Food',
        stock: 35,
        description: 'Crispy golden toasted corn flakes enriched with essential iron and vitamins.',
        imageUrl: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80'
    }
];

function fallbackBuffer(name, color = '#22c55e') {
    // 1x1 transparent PNG fallback buffer
    return Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
    );
}

async function fetchImageBuffer(url, fallbackName) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'BlinkitApp/1.0' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ab = await res.arrayBuffer();
        return Buffer.from(ab);
    } catch (err) {
        console.warn(`Could not fetch image for ${fallbackName}: ${err.message}. Using high-quality placeholder.`);
        return fallbackBuffer(fallbackName);
    }
}

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB at:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');

        // 1. Seed Admin
        const adminEmail = 'admin@blinkit.com';
        let admin = await Admin.findOne({ email: adminEmail });
        const hashedPassword = await bcrypt.hash('admin123', 10);
        if (!admin) {
            admin = await Admin.create({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword
            });
            console.log('Default Admin created: admin@blinkit.com / admin123');
        } else {
            admin.password = hashedPassword;
            await admin.save();
            console.log('Admin password ensured: admin@blinkit.com / admin123');
        }

        // 2. Seed Default Demo Customer
        const customerEmail = 'customer@blinkit.com';
        let user = await User.findOne({ email: customerEmail });
        if (!user) {
            user = await User.create({
                name: 'Harsh Sharma',
                email: customerEmail,
                password: await bcrypt.hash('user123', 10),
                phone: 9876543210,
                role: 'user',
                addresses: [
                    {
                        state: 'Haryana',
                        zip: 122002,
                        city: 'Gurugram',
                        address: 'Flat 402, Tower B, Sector 22, DLF Phase 2'
                    }
                ]
            });
            console.log('Default Customer created: customer@blinkit.com / user123');
        }

        // 3. Seed Categories
        const categories = [
            'Dairy & Breakfast',
            'Fruits & Vegetables',
            'Snacks & Munchies',
            'Cold Drinks & Juices',
            'Instant & Packaged Food'
        ];

        for (const catName of categories) {
            await Category.findOneAndUpdate(
                { name: catName },
                { name: catName },
                { upsert: true, new: true }
            );
        }
        console.log('Categories seeded:', categories.length);

        // 4. Seed Products with real image buffers
        const existingCount = await Product.countDocuments();
        if (existingCount < 5) {
            console.log('Seeding fresh products with images (please wait a few seconds)...');
            for (const item of sampleProducts) {
                const imgBuffer = await fetchImageBuffer(item.imageUrl, item.name);
                await Product.create({
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    stock: item.stock,
                    description: item.description,
                    image: imgBuffer
                });
                console.log(`+ Seeded: ${item.name} (₹${item.price})`);
            }
            console.log('All products successfully seeded into MongoDB!');
        } else {
            console.log(`Database already has ${existingCount} products.`);
        }

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
