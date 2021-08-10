const path = require('path');
const express = require('express');
const bodyParser =  require('body-parser');

const app = express();
const appRoutes = require('./routes/appRoutes');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/site', appRoutes)
app.get('/site/callback', appRoutes);
app.post('/install/assets', appRoutes);
app.post('/orders/webhook', appRoutes);

app.listen(5500, ()=>{
    console.log('Server is Running');
});