const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const productsDataPath = path.join(__dirname, 'data', 'products.json');

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
    try {
        const rawData = fs.readFileSync(productsDataPath);
        const products = JSON.parse(rawData);
        res.json(products);
    } catch (error) {
        console.error('Error reading products data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/products/:id - Get a single product
app.get('/api/products/:id', (req, res) => {
    try {
        const rawData = fs.readFileSync(productsDataPath);
        const products = JSON.parse(rawData);
        const product = products.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error reading products data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/orders - Create a new order (Simulation)
app.post('/api/orders', (req, res) => {
    const orderData = req.body;

    // `items` must be a non-empty array of line items, each with a positive
    // integer id and quantity. (A plain string passes a `.length` check, and
    // Number(null) / Number(1.5) pass a loose finite check, so be explicit.)
    const items = orderData && orderData.items;
    const itemsValid = Array.isArray(items) && items.length > 0 && items.every(item => {
        const id = Number(item && item.id);
        const qty = Number(item && item.quantity);
        return Number.isInteger(id) && id > 0 && Number.isInteger(qty) && qty > 0;
    });

    if (!itemsValid) {
        return res.status(400).json({ message: 'Invalid order data' });
    }

    // Simulate order processing delay
    setTimeout(() => {
        const orderId = 'BBK' + Math.floor(1000 + Math.random() * 9000);
        res.status(201).json({
            message: 'Order created successfully',
            orderId: orderId,
            status: 'Processing',
            estimatedDelivery: 'Same Day'
        });
    }, 1000);
});

// Unknown /api/* route -> JSON 404 (registered before the static handler)
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'Not found' });
});

// Serve frontend static files if we want to run both from one server
// Although in this setup, they are in different folders.
app.use(express.static(path.join(__dirname, '../frontend')));

// Central error handler: keep API failures as JSON instead of Express' HTML
// stack-trace page (which also leaked the server's filesystem path).
app.use((err, req, res, next) => {
    if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
        return res.status(400).json({ message: 'Invalid JSON body' });
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Endpoints:`);
    console.log(`- GET  http://localhost:${PORT}/api/products`);
    console.log(`- POST http://localhost:${PORT}/api/orders`);
});
