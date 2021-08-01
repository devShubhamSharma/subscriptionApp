const path = require('path');
const express = require('express');
const bodyParser =  require('body-parser');


const app = express();
const installRoutes = require('./routes/install');
const tokenRoutes = require('./routes/token');
const themeRoutes = require('./routes/theme');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/site',installRoutes)
app.get('/site/callback', tokenRoutes);
app.post('/install/assets', themeRoutes);

app.listen(5500, ()=>{
    console.log('Server is Running');
});