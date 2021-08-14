const db = require('../_helper/db');
const Cart = db.Cart;
const Wishlist = db.Wishlist;
const accessTokenSecret = require('../config.json').jwd_secret;
var ROLES = require('../config.json').ROLES;
const jwt = require('jsonwebtoken');
const { Address, UserLogins, Ecom_Annexure, Shipping_Codes  } = require('../_helper/db');
var request = require('request');
const Product = db.Product;
const mongoose = require('mongoose');
notEmpty = (obj) => {
    let t = Object.keys(obj).filter(i => (obj[i] == undefined || obj[i].toString().length == 0));
    console.log("t", t)
    if (t.length > 0) {
        return false;
    } else {
        return true;
    }
};



module.exports = {
    addToCart: async (req, res, next) => {

        try {
            const reqBody = req.body;
            const userId = req.user._id;
            const productIds = reqBody.productIds;

            if (!isValidArr(productIds)) {
                return res.send({ status: false, message: "Product Array is required" });
            }
            //console.log(reqBody);
            console.log("userid"+userId)
            
            const userlogin = await Address.findOne({loginid:userId}).select('postal').lean().exec();
            
            const pincode = userlogin.postal;
            
            const shipping_codes = await Shipping_Codes.findOne({pincode:pincode}).select('city state').lean().exec();
            
            const usercity = shipping_codes.city;
            const userstate = shipping_codes.state;
            let final_rate = 0;
            console.log("User City"+usercity)
            console.log("User State"+userstate)

            for (let i = 0; i < productIds.length; i++) {
                if (!mongoose.Types.ObjectId.isValid(productIds[i].product_id)) {
                    return res.send({ status: false, message: "Product Id is required in Product Array" });
                }
                if (!productIds[i].quantity) {
                    return res.send({ status: false, message: "Quantity is required in Product Array" });
                }
                const isProduct = await Product.findById(productIds[i].product_id).lean().exec();
                if (isProduct) {

                    const isQnt = isProduct.inventory - productIds[i].quantity;
                    const weight = isProduct.weight;
                    const loginid = isProduct.loginid;
                    console.log(loginid);
                    const sellerlogin = await Address.findOne({loginid:loginid}).select('postal').lean().exec();
                    console.log(sellerlogin);
                    const pincode = sellerlogin.postal;
                    const shipping_codes = await Shipping_Codes.findOne({pincode:pincode}).select('city state').lean().exec();
                    const sellercity = shipping_codes.city;
                    const sellerstate = shipping_codes.state;
                    console.log("Seller City "+sellercity);
                    console.log("Seller State "+sellerstate);
                    let zone = '';
                    if(sellercity == usercity){
                        zone = 'A';
                    }
                    else if(sellerstate == userstate){
                        zone = 'B';
                    }
                    else if(usercity == 'Delhi' || usercity == 'Mumbai' || usercity == 'Bengaluru' || usercity == 'Chennai' || usercity == 'Kolkata'){
                        zone = 'C';    
                    }
                    else {
                        if(userstate == 'J&K'){
                            zone = 'E';
                        }
                        else if (userstate == 'North East & Andaman'){
                            zone = 'F'
                        }
                    }
                   console.log("zone"+zone);
                   console.log("weight"+weight);
                   const rate = await Ecom_Annexure.findOne({zone: zone}).select('upto500').lean().exec();
                  
                   let newWeight = (weight / 500);

                   if(newWeight <= 1){
                       console.log("in if");
                       final_rate = rate.upto500;
                   }
                   else{
                        console.log("in else");
                        final_rate = rate.upto500 * newWeight;
                   }
                   productIds[i].shipping_rates = final_rate;
                   reqBody.productIds[i].shipping_rates = final_rate;
                   console.log(final_rate);
                    if (Math.sign(isQnt) !== 1) {
                        return res.send({ status: false, message: `${isProduct.title} Out of stock` });
                    }

                } else {
                    return res.send({ status: false, message: "Product Not Found" });
                }

            }


            reqBody.userId = userId;
           

            const isCart = await Cart.findOne({ userId: userId }).lean().exec();

            let result;
            console.log(productIds);
            console.log(reqBody);
            if (isCart) {
                result = await Cart.findByIdAndUpdate(isCart._id, { $addToSet: { productIds: productIds } });
            } else {
                result = await (new Cart(reqBody)).save();
            }

            return res.send({ status: true, data: result, message: `${isCart ? `Updated` : `Created`} Successfully` });

        } catch (error) {
            console.log(error);
            return res.send({ status: false, message: error.message });
        }

        // const { productIds } = req.body;
        // let userId = req.user._id;
        // let quantity = req.body.quantity ? req.body.quantity : 1;
        // if (!productIds) {
        //     res.send({ status: false, message: "Required Parameter is missings" });
        //     return;
        // }

        // let p = {
        //     productIds,
        //     userId,
        //     quantity
        // }

        // Cart.findOne({ userId: userId }).then((data) => {
        //     if (data && data._id) {
        //         Cart.update({ userId: userId }, {
        //             $addToSet: { productIds: productIds }, $set: { updated_at: new Date() }
        //         }).then((data) => {
        //             res.send({ status: true, data })
        //             return;
        //         }).catch((err) => {
        //             console.log("error")
        //             res.send({ status: false, err: err })
        //             return;
        //         })
        //     } else {
        //         Cart.create(p).then((data) => {
        //             res.send({ status: true, data })
        //             return;
        //         }).catch((err) => {
        //             res.send({ status: false, err: err })
        //             return;
        //         });
        //     }
        // });
    },
    cartList: async (req, res, next) => {
        try {

            let cart = await Cart.findOne({ userId: req.user._id });

            let arr = [];

            if (cart) {
                const cartProduct = cart.productIds;
                for (let i = 0; i < cartProduct.length; i++) {
                    if (cartProduct[i].product_id) {
                        const pro = await Product.findById(cartProduct[i].product_id).lean().exec();
                        if (pro) {
                            arr.push({ product: pro, quantity: (cartProduct[i].quantity || 1), variants: (cartProduct[i].variants || []) });
                        } else {
                            arr.push({ product: {}, quantity: 0, variants: [] });
                        }
                    }
                }
                cart.productIds = arr;
                return res.send({ status: true, message: 'Record found!', result: arr, count: cartProduct.length })
            } else {
                return res.send({ status: false, message: 'record not found!' })
            }

            // if (cart.length > 0) {
            //     for (const ca of cart) {
            //         let product = await Product.find({ _id: { $in: ca.productIds } })
            //         arr.push({
            //             'cart': ca,
            //             'product': product
            //         })
            //         console.log(ca.productIds[0])
            //     }
            //     res.send({ status: true, message: 'Record found!', result: arr, count: cart.length })
            // } else {
            //     res.send({ status: false, message: 'record not found!' })
            // }

        } catch (e) {
            res.send({ status: false, message: e.message })
            return;
        }
    },

    removeFromCart: async (req, res, next) => {

        const { _id } = req.body;
        let userId = req.user._id;

        if (!_id) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        Cart.findOne({ userId: userId }).then((data) => {
            if (data && data._id) {
                Cart.update({ userId: userId },
                    { $pull: { productIds: { _id: _id } } }
                ).then((data) => {
                    res.send({ status: true, data })
                    return;
                }).catch((err) => {
                    res.send({ status: false, message: err.message })
                    return;
                });
            } else {
                return res.send({ status: false, message: "Cart info not found" });
            }
        });
    },
    addToWishlist: (req, res, next) => {

        const {
            productIds

        } = req.body;
        let userId = req.user._id
        if (!productIds) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        let p = {
            productIds,
            userId
        }

        Wishlist.findOne({ userId: userId }).then((data) => {
            if (data && data._id) {
                Wishlist.update({ userId: userId }, {
                    $addToSet: { productIds: productIds }, $set: { updated_at: new Date() }
                }).then((data) => {
                    res.send({ status: true, data })
                    return;
                }).catch((err) => {
                    res.send({ status: false, message: err.message })
                    return;
                });

            }
            else {
                Wishlist.create(p).then((data) => {
                    res.send({ status: true, data })
                    return;
                }).catch((err) => {
                    res.send({ status: false, message: err.message })
                    return;
                });
            }

        });

    },
    wishListing: async (req, res, next) => {
        try {
            console.log('wishliesttt')
            Wishlist.find({ userId: req.user._id }).then(async user => {
                let arr = [];
                if (user.length > 0) {
                    for (const i of user) {
                        let product = await Product.find({ _id: { $in: i.productIds } })
                        arr.push({
                            'wishlist': user,
                            'product': product
                        })
                    }
                    res.send({ status: true, arr });
                } else {
                    res.send({ status: false, message: 'not found!' })
                }

            }).catch(err => {
                console.log(err)
                res.send({ status: false, message: err.message })
                return;
            })
        } catch (e) {
            res.send({ status: false, message: e.message })
            return;
        }
    },

    removeFromWishlist: (req, res, next) => {

        const {
            productIds,

        } = req.body;
        let userId = req.user._id
        if (!productIds) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        let p = {
            productIds,
            userId
        }

        Wishlist.findOne({ userId: userId }).then((data) => {
            if (data && data._id) {
                Wishlist.update({ userId: userId }, {
                    $pull: { productIds: productIds }, $set: { updated_at: new Date() }
                }).then((data) => {
                    res.send({ status: true, data })
                    return;
                }).catch((err) => {
                    res.send({ status: false, message: err.message })
                    return;
                });

            }


        });

    },
}


function isValidArr(array, length = 0) {
    if (length) {
        if (Array.isArray(array) && array.length === length) {
            return true;
        } else {
            return false;
        }
    } else {
        if (Array.isArray(array) && array.length) {
            return true;
        } else {
            return false;
        }
    }
}