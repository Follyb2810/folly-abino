const express = require('express');
const cors = require('cors');
const connectdb = require('./config/db')
const PORT = process.env.PORT || 8080;
const AuthRoutes = require('./routes/userRoutes')
const BlogRoutes= require('./routes/blogRoutes')
const app = express();
const cookieParser = require('cookie-parser');
const { protectedRoutes, RefreshUser, UpdateUser } = require('./controller/authController');
const folly = require('crypto').randomBytes(64).toString('hex')

// console.log(folly)

connectdb()
app.use(
  cors({
    // origin: 'http://localhost:8080', 
    origin: '*',
    credentials: true,
  })
);
app.use(cookieParser())


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));



app.get('/', (req, res) => {
  res.send('Hello Folly!');
});
app.get('/about', (req, res) => res.send('About Page Route'));

app.get('/portfolio', (req, res) => res.send('Portfolio Page Route'));

app.get('/contact', (req, res) => res.send('Contact Page Route'));

app.use('/api/v1',AuthRoutes)
app.use(protectedRoutes)
app.use('/api/v1/refresh',RefreshUser)
app.use('/api/v1/blog',BlogRoutes)
app.listen(PORT, () => console.log('Folly is listening on port ' + PORT));


// var bodyParser = require('body-parser')
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json()); app.use(bodyParser.urlencoded({ extended: true }));

// const whitelist = [
//   '*'
// ];
// app.use(bodyParser.json()); app.use(bodyParser.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   const origin = req.get('referer');
//   const isWhitelisted = whitelist.find((w) => origin && origin.includes(w));
//   if (isWhitelisted) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//   }
//   // Pass to next layer of middleware
//   if (req.method === 'OPTIONS') res.sendStatus(200);
//   else next();
// });

// const setContext = (req, res, next) => {
//   if (!req.context) req.context = {};
//   next();
// };
// app.use(setContext);
