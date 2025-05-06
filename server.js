const express = require('express');
const path = require('path');
const app = express();


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);

// Client-Side Routing Fallback
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PlayStation Legacy server running on http://localhost:${PORT}`);
});
