const router = require('express').Router();
const Category = require('../models/category');
const Product = require('../models/product');
const Review = require('../models/review');
const News = require('../models/news');



const async = require('async');
const chekJWT = require('../middlewares/check-jwt')

router.get('/products', (req, res, next) => {
    const perPage = 10;
    const page = req.query.page;
    async.parallel([
      function(callback) {
        Product.count({}, (err, count) => {
          var totalProducts = count;
          callback(err, totalProducts);
        });
      },
      function(callback) {
        Product.find({})
          .skip(perPage * page)
          .limit(perPage)
          .populate('category')
          .populate('owner')
          .exec((err, products) => {
            if(err) return next(err);
            callback(err, products);
          });
      }
    ], function(err, results) {
      var totalProducts = results[0];
      var products = results[1];
     
      res.json({
        success: true,
        message: 'category',
        products: products,
        totalProducts: totalProducts,
        pages: Math.ceil(totalProducts / perPage)
      });
    });
    
  });
  
  router.route('/categories')
    .get((req, res, next) => {
      Category.find({}, (err, categories) => {
        res.json({
          success: true,
          message: "Success",
          categories: categories
        })
      })
    })
    .post((req, res, next) => {
      let category = new Category();
      category.name = req.body.category;
      category.save();
      res.json({
        success: true,
        message: "Successful"
      });
    });
  
  
    router.get('/categories/:id', (req, res, next) => {
      const perPage = 10;
      const page = req.query.page;
      async.parallel([
        function(callback) {
          Product.count({ category: req.params.id }, (err, count) => {
            var totalProducts = count;
            callback(err, totalProducts);
          });
        },
        function(callback) {
          Product.find({ category: req.params.id })
            .skip(perPage * page)
            .limit(perPage)
            .populate('category')
            .populate('owner')
            .populate('reviews')
            .exec((err, products) => {
              if(err) return next(err);
              callback(err, products);
            });
        },
        function(callback) {
          Category.findOne({ _id: req.params.id }, (err, category) => {
           callback(err, category)
          });
        }
      ], function(err, results) {
        var totalProducts = results[0];
        var products = results[1];
        var category = results[2];
        res.json({
          success: true,
          message: 'category',
          products: products,
          categoryName: category.name,
          totalProducts: totalProducts,
          pages: Math.ceil(totalProducts / perPage)
        });
      });
      
    });
  
    router.get('/product/:id', (req, res, next) => {
      Product.findById({ _id: req.params.id })
        .populate('category')
        .populate('owner')
        .deepPopulate('reviews.owner')
        .exec((err, product) => {
          if (err) {
            res.json({
              success: false,
              message: 'Product is not found'
            });
          } else {
            if (product) {
              res.json({
                success: true,
                product: product
              });
            }
          }
        });
    });
  
  
    /*Product.find({category : req.params.id})
           .populate('category')
           .exec((err, products)=>{
               Product.count({category : req.params.id}, (err, totalProducts)=>{
                   res.json({
                       success : true,
                       message : 'category',
                       products : products,
                       categoryName : products[0].category.name,
                       totalProducts : totalProducts,
                       pages : Math.ceil(totalProducts / perPage)
                   });
               });
           });*/



router.post('/addreview', chekJWT, (req,res,next)=>{
    async.waterfall([
        function(callback){
            Product.findOne({ _id: req.body.productId }, (err, product)=>{
                if(product){
                    callback(err, product)
                }
            })
        },
        function(product){
            let  review = new Review()
            review.owner = req.decoded.user._id

            if(req.body.title)
                review.title = req.body.title
            if(req.body.description)
                review.description = req.body.description
                review.rating = req.body.rating
            product.reviews.push(review._id)
            product.save()
            review.save()
            res.json({
                success: true,
                message: 'review was added successfully'
            })
        }
    ])
});
router.get('/reviews/:id', chekJWT, (req, res, next) => {
    Review.findOne({_id : req.params.id}, (err, review)=>{
        console.log(review);
        review.report ++;
        review.save();
        res.json({
            success : true,
            review : review
        });
    });
});


router.post('/addNews', chekJWT, (req,res,next)=>{
    async.waterfall([
        function(callback){
            Product.findOne({ _id: req.body.productId }, (err, product)=>{
                if(product){
                    callback(err, product)
                }
            })
        },
        function(product){
            let  news = new News()
            News.owner = req.decoded.user._id

            if(req.body.title)
                news.title = req.body.title
            if(req.body.description)
                news.description = req.body.description
                news.rating = req.body.rating
            product.reviews.push(news._id)
            product.save()
            news.save()
            res.json({
                success: true,
                message: 'news was added successfully'
            })
        }
    ])
});
router.get('/news/:id', chekJWT, (req, res, next) => {
    News.findOne({_id : req.params.id}, (err, news)=>{
        console.log(news);
        news.report ++;
        news.save();
        news.json({
            success : true,
            news : news
        });
    });
});

    
    


module.exports = router;
