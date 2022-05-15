const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// const config = require('./config');

const app = express();

// Only include useMongoClient only if your mongoose version is < 5.0.0
// mongoose.connect(config.database, {useMongoClient: true}, err => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('Connected to the database');
//   }
// });

const CONNECTION_STRING = 'mongodb+srv://Aryan:Aryan@cluster0.pypch.mongodb.net/MoviesNowDB?retryWrites=true&w=majority'
mongoose.connect(CONNECTION_STRING)
.then(()=>{
  console.log("MongoDB up and running!")
})
.catch((err)=>{
  console.log(err)
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());

const userRoutes = require('./routes/account');
const mainRoutes = require('./routes/main');
const sellerRoutes = require('./routes/seller');

app.use('/api', mainRoutes);
app.use('/api/accounts', userRoutes);
app.use('/api/seller', sellerRoutes);

app.listen(5000, ()=> {
  console.log('Magic happens on port awesome '  );
});
