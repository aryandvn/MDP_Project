const router = require('express').Router();
const Product = require('../models/product');

//we use faker when we need to post fake products to test
//const faker = require('faker');
const checkJWT = require('../middlewares/check-jwt');
const multer = require('multer');
const async = require('async');
//const upload = multer({dest : 'uploads/images'});
const storage = multer.diskStorage({
    destination : function(req, file, cb) {
        cb(null, './image')
    },
    filename : function(req, file, cb){
        cb(null, Date.now()+file.originalname)
    }
});
const upload = multer({storage : storage});

router.get("/image/:name", function (req, res, next) {
    console.log("image name");
    var options = {
        root: "./image",
        dotfiles: "deny",
        headers: {
            "x-timestamp": Date.now(),
            "x-sent": true
        }
    };

    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log("Sent:", fileName);
        }
    });
});

router.route('/products')
    .get(checkJWT, (req, res, next)=>{
        Product.find({owner : req.decoded.user._id})
        //recuperer les donnes de user et de category, non seulement leurs ids
               .populate('owner')
               .populate('category')
               .exec((err, products)=>{
                   if(products){
                       res.json({
                           success : true,
                           message : 'products',
                           products : products
                       });
                   }
               });
    })
    .post([checkJWT, upload.single('product_picture')], (req, res, next)=>{
        console.log(upload);
        console.log(req.file);
        //console.log(req.file.location);
        let product = new Product();
        product.owner = req.decoded.user._id;
        product.category = req.body.categoryId;
        product.title = req.body.title;
        product.year = req.body.year;
        product.description = req.body.description;
        product.trailer=req.body.trailer;
        product.streaming = req.body.streaming;
        product.download = req.body.download;
        product.evaluation = req.body.evaluation;
        product.image = req.file.path;
        product.fileName = req.file.filename;
        product.promotion = req.body.promotion;
        product.discount = req.body.discount;
        product.stock = req.body.stock;
        if(product.discount) product.newyear = product.year - (product.year*(product.discount/100));
        product.save();
        res.json({
            success : true,
            message : 'successfully added the product',
            //product : product
        });
    });

    router.post('/products/:id', [checkJWT, upload.single('product_picture')], (req,res,next)=>{
        Product.findOne({_id : req.params.id}, (err, product)=>{
            console.log(product);
            if (req.body.categoryId) product.category = req.body.categoryId;
            if (req.body.title) product.title = req.body.title;
            if (req.body.year) product.year = req.body.year;
            if (req.body.description) product.description = req.body.description;
            if (req.file) {
                product.image = req.file.path;
                product.fileName = req.file.filename;
            }
            if (req.body.promotion) product.promotion = req.body.promotion;
            if (req.body.discount) product.discount = req.body.discount;
            if (req.body.stock) product.stock = req.body.stock;
            if(product.discount) product.newyear = product.year - (product.year*(product.discount/100));
            product.save();
            res.json({
                success : true,
                product : product
            });
        });
    });

    router.delete('/products/:id',checkJWT, (req,res,next)=>{
        async.waterfall([
            function(callback) {
                Product.findByIdAndDelete({_id : req.params.id}, (err, product)=>{
                    if (product) {
                        callback(err, product);
                    }
                });
            },
            function(product) {
                /*async.waterfall([
                    function(callback){
                        for (let i=0;i<product.reviews.length;i++) {
                            Review.findByIdAndDelete({_id : product.reviews[i]},(err, review)=>{
                                console.log(review);
                            });
                        }
                        callback(true);
                    },
                    function () {
                        res.json({
                            success : true
                        });
                    }


                ])*/
                for (let i=0;i<product.reviews.length;i++) {
                    Review.findByIdAndDelete({_id : product.reviews[i]},(err, review)=>{
                        console.log(review);
                    });
                }
                setTimeout(function(){
                    res.json({
                        success : true
                    })
                }, 3000)
            }
        ])
        //Product.findByIdAndDelete({_id : req.params.id}, (err, product)=>{
          //  let rev = product['reviews'];
            //console.log(rev);
            //for (let i=0;i<product.reviews.length;i++) {
              //  Review.findByIdAndDelete({_id : product.reviews[i]});
            //}
            //res.json({
              //  success : true,
                //product : product
            //});
        //})
    })


module.exports = router;
