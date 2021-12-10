const path = require('path');
const express = require('express');
const bodyParser =  require('body-parser');

const app = express();

const appRoutes = require('../routes/appRoutes');
const dashBoardRoutes = require('../routes/dashBoardRoutes');
const customerRoutes = require('../routes/customerRoutes');


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/site', appRoutes);
app.get('/site/callback', appRoutes);
app.post('/orders/webhook', appRoutes);

app.get('/subscribed/orders', dashBoardRoutes);
app.post('/view/orders', dashBoardRoutes);
app.get('/subscribed/customers', dashBoardRoutes);

app.get('/cancel/:id/subscription', customerRoutes);
app.get('/cancel/orders', customerRoutes);
app.get('/create/orders', appRoutes);

app.listen(5500, ()=>{
    console.log('Server is Running');
});