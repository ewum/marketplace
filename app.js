const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/sales', require('./routes/sales'));
//app.use('/api/users', require('./routes/users'));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, '0.0.0.0');