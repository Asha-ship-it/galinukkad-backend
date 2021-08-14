var express = require('express');
var app = express();
var authCtrl = require('../controllers/authController')
var category = require('../controllers/category')
var product = require('../controllers/product')
var cartandwishlist = require('../controllers/cartAndWishlist')
var orderController = require('../controllers/orderController')
var TicketController = require('../controllers/TicketController')
var SellerController = require('../controllers/SellerController')
const jwt = require('jsonwebtoken');
var cors = require('cors')
const accessTokenSecret = require('../config.json').jwd_secret;
var path = require('path')
var multer = require("multer");
var subCategory = require('../controllers/sub_category');

var couponCodesController = require('../controllers/couponCodesController');
var homePageBannerController = require('../controllers/homePageBannerController');
var shippingRatesController = require('../controllers/shipping_rates');
var shippingCodesController = require('../controllers/shipping_codes');
var frequentlyAskedQuestion = require('../controllers/frequentlyAskedQuestion');
var reportController = require('../controllers/reportController');
var adminController = require('../controllers/adminController');
var ManageCaseLogController = require('../controllers/ManageCaseLog');

const Path = require('path');
const fs = require('fs');
const htmlPagesController = require('../controllers/htmlPagesController');
const { update } = require('../models/otp');
const authController = require('../controllers/authController');
const { sellerAccountHealthById } = require('../controllers/SellerController');
const  ecom_annexure  = require('../controllers/ecom_annexureController');

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {

//     cb(null, path.join(__dirname, '../public/'))
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//   }
// })



var storage = multer.diskStorage({
  destination: function (req, file, cb) {

    // var current_year = new Date().getFullYear();
    // var current_month = new Date().getMonth() + 1;

    var DIR = Path.join(__dirname, '../public/');

    // if (!fs.existsSync(DIR + current_year)) {
    //   fs.mkdirSync(DIR + current_year);
    // }

    // if (!fs.existsSync(DIR + current_year + "/" + current_month + "/")) {
    //   fs.mkdirSync(DIR + current_year + "/" + current_month + "/");
    // }

    // DIR = DIR + current_year + "/" + current_month + "/";

    // console.log(DIR)

    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR);
    }
    cb(null, DIR)
  },
  filename: function (req, file, cb) {
    const str = file.originalname;
    const extension = str.substr(str.lastIndexOf("."));
    const fileName = Date.now() + '' + Math.round(Math.round(Math.random() * 5000)) + '' + extension;
    cb(null, fileName)
  }
});

var upload = multer({ storage: storage })
console.log('app restarted')
app.get('/check', (req, res, next) => {
  console.log('check')
})
// var upload2 = multer({ dest: 'public/' })


const randomname = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};



var routefunctions = (app) => {

  // app.use(function(req, res, next) {
  //   var allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000','http://localhost:', 'http://15.206.229.22:3000','http://fiddle.jshell.net','null'];
  //   var origin = req.headers.origin;
  //   if(allowedOrigins.indexOf(origin) > -1){
  //        res.setHeader('Access-Control-Allow-Origin', origin);
  //   }
  //   //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  //   res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  //   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token, X-Requested-With, Content-Type, Accept');
  //   res.header('Access-Control-Allow-Credentials', true);
  //   return next();
  // });
  app.use(cors());


  // app.post('/login', authCtrl.login)
  app.post('/login', authCtrl.loginNew)
  app.post('/social/login', authCtrl.socialLogin)
  app.post('/verify/otp', authCtrl.verifyOtp)
  app.post('/signup', authCtrl.signup)
  app.post('/deleteuser', authCtrl.deleteuser)

  app.post('/newsletter/subscribe', authCtrl.newsLetterSubscribe)
  app.post('/newsletter/unsubscribe', authCtrl.newsLetterUnSubscribe)

  app.post('/upload/file', upload.any(), async (req, res, next) => {
    // res.send({ files: req.files.map(i => i.filename) })
    res.end();
  })

  app.post('/upload/product/excel', authenticateJWT, upload.any(), authCtrl.uploadExcel)

  app.post('/forgetpassword', authCtrl.forgotpassword);
  app.post('/resetpassword', authCtrl.recoverpassword);
  app.post('/changepassword', authenticateJWT, authCtrl.changepassword);

  // app.get('/signup', authCtrl.signup)
  // app.post('/signup', authCtrl.signup)

  app.post('/contact', authCtrl.contactUs)
  app.get('/brands', authCtrl.brand)
  app.get('/apis/brands', authCtrl.brand)
  app.post('/brands', authCtrl.brand)

  app.get('/product-categories', authCtrl.pcatagory)
  app.post('/product-categories', authCtrl.pcatagory)

  app.get('/products', authCtrl.products)
  app.post('/products', authCtrl.products)
  app.post('/add/bulk/product', authenticateJWT, product.addBulkProduct)
  app.get('/products/count', authCtrl.countp)
  app.post('/products/count', authCtrl.countp)


  app.get('/collections', authCtrl.collections)
  app.post('/collections', authCtrl.collections)


  app.post('/createprofile', authenticateJWT, authCtrl.crateprofile)
  app.post('/updateprofile', authenticateJWT, authCtrl.updateprofile)
  app.post('/getprofile', authenticateJWT, authCtrl.getprofile)

  app.post('/getalluserlist', authCtrl.getalluser);

  app.post('/createaddress', authenticateJWT, authCtrl.createaddress)
  app.post('/updateaddress', authenticateJWT, authCtrl.updateaddress)
  app.post('/getaddresses', authenticateJWT, authCtrl.getaddresses)
  app.post('/setdefaultshipping', authenticateJWT, authCtrl.setdefaultshipping)
  app.post('/setdefaultbilling', authenticateJWT, authCtrl.setdefaultbilling)
  app.post('/deleteaddress', authenticateJWT, authCtrl.deleteaddress)

  app.post('/product-detail', authCtrl.productDetail)
  // app.post('/related-products', authCtrl.relatedProducts)

  app.get('/products/:id', authCtrl.getproductbyid)
  app.post('/products/:id', authCtrl.getproductbyid)

  app.post('/addRate', ecom_annexure.createRates);
  app.post('/updateRates', ecom_annexure.updateRates);
  app.post('/getOneRate', ecom_annexure.getOneRates);
  app.post('/allRate', ecom_annexure.getAllRates);
  app.post('/deleteRate', ecom_annexure.deleteRates);

  app.post('/getSearchKeywords', product.getSearchKeywords)
  app.post('/get-products', product.getProduct)
  app.get('/recent-viewed-products', authenticateJWT, product.recentlyViewedProducts)
  app.post('/add-recent-viewed-products', authenticateJWT, product.addProductToRecentViewedProducts)
  app.post('/create-products', authenticateJWT, upload.any(), product.createProduct)
  app.put('/update-products', authenticateJWT, upload.any(), product.updateProduct)
  app.post('/delete-products', authenticateJWT, product.deleteProduct)
  app.post('/get-all-products', authenticateJWT, product.getProductall)
  app.post('/get-seller-project', authenticateJWT, product.getSellerProductall)
  app.post('/product-by-category', product.productByCategory);
  app.post('/product-by-subcategory', product.productBySubCategory);
  app.post('/product-by-subcategory-2', product.productBySubCategory2);
  app.get('/best-selling-product', product.bestSellingItem);
  app.get('/products-filters', product.productByFilters);

  /*Cart and wishlist*/

  app.post('/add-to-cart', authenticateJWT, cartandwishlist.addToCart)
  app.post('/remove-from-cart', authenticateJWT, cartandwishlist.removeFromCart)
  app.get("/cart/list", authenticateJWT, cartandwishlist.cartList)
  app.get("/wish/list", authenticateJWT, cartandwishlist.wishListing)
  app.post('/add-to-wishlist', authenticateJWT, cartandwishlist.addToWishlist)
  app.post('/remove-from-wishlist', authenticateJWT, cartandwishlist.removeFromWishlist)

  //Order Module
  app.post('/place/getOrderDetails', authenticateJWT, orderController.getProductByOrder)
  // app.post('/place/order', authenticateJWT, orderController.placeOrder) // old code 
  app.post('/place/order', authenticateJWT, orderController.placeOrderNew) // new code
  app.post('/place/order/guest', orderController.placeOrderGuest)
  app.post('/list/guest/order', orderController.guestOrderList)
  app.post("/list/order", authenticateJWT, orderController.listOrder)
  app.post('/cancel/order', authenticateJWT, orderController.cancelOrder)
  app.post('/address', authenticateJWT, orderController.addOrderAddress)
  app.get('/get/address', authenticateJWT, orderController.retrieveAddress)
  app.post('/remove/address', authenticateJWT, orderController.removeAddress)
  app.post('/return/order', authenticateJWT, orderController.returnOrder)
  app.post('/refund/order', authenticateJWT, orderController.refundOrder)
  app.post('/order/detail', authenticateJWT, orderController.getOrderDetail)
  app.post('/get/customer/order', authenticateJWT, orderController.getCustomerOrder)
  app.post('/get/seller/order', authenticateJWT, orderController.getSellerOrder)
  app.post('/get/admin/order', authenticateJWT, orderController.getAdminOrder)
  app.post('/get/admin/seller-order', authenticateJWT, orderController.getAdminOrder1)

  // http://45.76.97.89:3000/products/8                                                                                                                                                                                                             

  app.post("/review/product", authenticateJWT, product.reviewProduct)
  app.post("/review/seller", authenticateJWT, product.reviewSeller)
  app.post("/review/seller/listing", authenticateJWT, product.reviewSellerListing)
  app.post("/review/listing", authenticateJWT, product.productReviewListing)

  // Notification Module
  app.post("/add-notification", authenticateJWT, product.addNotification)
  app.post("/notification/listing", authenticateJWT, product.notificationListing)
  app.post("/notification/detail", authenticateJWT, product.notificationDetail)
  app.post("/mark-as-read", authenticateJWT, product.markAsRead)
  app.post("/mark-as-unread", authenticateJWT, product.markAsUnRead)

  app.post("/delete-notification", authenticateJWT, product.deleteNotification)

  // Support Ticket System
  app.post('/create/ticket', authenticateJWT, TicketController.createTicket)
  app.get('/get/all/tickets', authenticateJWT, TicketController.listAllTickets)
  app.post('/get/seller/tickets', authenticateJWT, TicketController.listTicket)
  app.post('/update/ticket/status', authenticateJWT, TicketController.updateTicketStatus)
  app.post('/update/ticket/answer', authenticateJWT, TicketController.updateTicketResponse)
  app.post('/detail/ticket', authenticateJWT, TicketController.ticketDetail)


  //Communication  
  app.post('/send/chat/message', authenticateJWT, SellerController.startChatting)
  app.post('/list/chat/message', authenticateJWT, SellerController.listMessages)
  app.post('/chat/group', authenticateJWT, SellerController.chatGroup)

  //advertising
  app.post('/activelist/advplan', authenticateJWT, SellerController.getActiveAdvPlanList)
  app.post('/list/advplan', authenticateJWT, SellerController.getAdvPlanList)
  app.post('/book/advplan', authenticateJWT, SellerController.bookAdvPlan)
  app.post('/deleteBookPlan/advplan', authenticateJWT, SellerController.deleteBookPlan)

  //News
  //--->admin
  app.post('/list/newscategory', authenticateJWT, SellerController.getNewsCategoryList);
  app.post('/create/newscategory', authenticateJWT, SellerController.createNewsCategory);
  app.post('/update/newscategory', authenticateJWT, SellerController.updateNewsCategory);
  app.post('/delete/newscategory', authenticateJWT, SellerController.deleteNewsCategory);
  app.post('/list/newsarticle', authenticateJWT, SellerController.listNewsArticle);
  app.post('/create/newsarticle', authenticateJWT, upload.any(), SellerController.createNewsArticle);
  app.post('/update/newsarticle', authenticateJWT, upload.any(), SellerController.updateNewsArticle);
  app.post('/delete/newsarticle', authenticateJWT, SellerController.deleteNewsArticle);

  //---> seller
  app.post('/seller/list/newsarticle', authenticateJWT, SellerController.listNewsArticleCategoryWise)
  app.post('/seller/listbyarticleid/newsarticle', authenticateJWT, SellerController.newsArticleCategoryWiseByArticleId)
  app.post('/seller/listbycategoryid/newsarticle', authenticateJWT, SellerController.listNewsArticleCategoryWiseByCategoryId)

  // Manage Orders
  //---> Product Avaliblity 
  app.post('/list/productavailable', authenticateJWT, SellerController.getProductAvailable)


  // Communication 
  app.post('/create/communication', authenticateJWT, SellerController.createCommunication);
 
  app.post('/get/communication/productid', SellerController.getCommunicationProductId);
  app.get('/seller/list/communication', authenticateJWT, SellerController.getCommunication);
  app.get('/alllist/communication', SellerController.getAllCommunication);

  app.post('/import-products', authenticateJWT, upload.any(), product.importProducts);
  app.get('/getallproductsExport', authenticateJWT, product.getAllProductsExport);

  app.post('/search-product', product.searchProducts);

  // Coupon Codes
  app.post('/create-coupon-codes', authenticateJWT, couponCodesController.createCouponCodes);
  app.put('/update-coupon-codes', authenticateJWT, couponCodesController.updateCouponCodes);
  app.get('/get-coupon-codes', authenticateJWT, couponCodesController.getCouponCodes);
  app.get('/getAll-coupon-codes', authenticateJWT, couponCodesController.getAllCouponCodes);
  app.delete('/delete-coupon-codes', authenticateJWT, couponCodesController.deleteCouponCodes);

  // Home Page Banner
  app.post('/create-home-page-banner', authenticateJWT, upload.any(), homePageBannerController.createHPBanner);
  app.put('/update-home-page-banner', authenticateJWT, upload.any(), homePageBannerController.updateHPBanner);
  app.get('/get-home-page-banner', homePageBannerController.getHPBanner);
  app.get('/getAll-home-page-banner', homePageBannerController.getAllHPBanner);
  app.delete('/delete-home-page-banner', authenticateJWT, homePageBannerController.deleteHPBanner);

  // Bussiness
  app.post('/createbussiness', authenticateJWT, upload.any(), authCtrl.createbussiness);
  app.post('/updatebussiness', authenticateJWT, upload.any(), authCtrl.updatebussiness);
  app.post('/approvebussiness', authenticateJWT, authCtrl.approvebussiness);
  app.get('/getbussiness-by-bussness-id', authenticateJWT, authCtrl.getBussinessByBussnessId)
  app.get('/getbussiness-by-user-id', authenticateJWT, authCtrl.getBussinessByUserId)
  app.post('/getAll-seller-bussiness-info', authenticateJWT, authCtrl.getAllSellerBussInfo)
  app.post('/getallbussiness', authenticateJWT, authCtrl.getallbussines)
  app.post('/getbussiness', authenticateJWT, authCtrl.getBussiness)

  // NEW Category implement
  app.post('/createcat', authenticateJWT, category.cratecategory)
  app.post('/updatecat', authenticateJWT, category.updatecategory)
  app.post('/deletecat', authenticateJWT, category.deletecat)
  app.post('/getcat', category.getCategory)
  app.post('/getallcategries', category.getCategoryaAll)
  app.post('/getsubcatbycategories', category.getSubCatByCategory)

  // Sub Category
  app.post('/create-sub-category', authenticateJWT, subCategory.createSubCategory);
  app.post('/update-sub-category', authenticateJWT, subCategory.updateSubCategory);
  app.post('/get-sub-category', authenticateJWT, subCategory.getSubCategory);
  app.get('/getAll-sub-category', authenticateJWT, subCategory.getSubCategoryaAll);
  app.post('/delete-sub-category', authenticateJWT, subCategory.deleteSubCategory);
  app.post('/sub-category-by-category', subCategory.getSubCategoryByCategory);

  // Iqrar --> Order return Api
  // app.post('/orderreturn', authenticateJWT, orderController.orderReturn)
  // app.get('/get-return-orderlist', authenticateJWT, orderController.getReturnOrderList)
  // app.get('/get-return-order-by-order-id', authenticateJWT, orderController.getReturnOrderByOrderId)

  // Shipping rates
  app.post('/create-shipping-rates', authenticateJWT, shippingRatesController.createShippingRates);
  app.put('/update-shipping-rates', authenticateJWT, shippingRatesController.updateShippingRates);
  app.get('/getOne-shipping-rates', authenticateJWT, shippingRatesController.getOneShippingRates);
  app.get('/getByPincode-shipping-rates', authenticateJWT, shippingRatesController.getShippingRatesByPincodeNo);
  app.get('/getAll-shipping-rates', authenticateJWT, shippingRatesController.getAllShippingRates);
  app.delete('/delete-shipping-rates', authenticateJWT, shippingRatesController.deleteShippingRates);

  // Iqrar
  app.post('/create-frequently-asked-question', authenticateJWT, frequentlyAskedQuestion.createFrequentlyAskedAuestion)
  app.get('/get-frequently-asked-questionlist', authenticateJWT, frequentlyAskedQuestion.getFrequentlyAskedAuestionList)
  app.get('/get-frequently-asked-question-by-userid', authenticateJWT, frequentlyAskedQuestion.getFrequentlyAskedAuestionId)
  app.put('/update-frequently-asked-question', frequentlyAskedQuestion.updateFrequentlyAskedQuestion);
  app.delete('/delete-frequently-asked-question', frequentlyAskedQuestion.deleteFrequentlyAskedQuestion);

  app.post('/get-all-seller-info-list', authenticateJWT, SellerController.getAllSellerList);
  app.delete('/delete-user-by-user-id', authenticateJWT, SellerController.deleteUserByUserId);

  app.get('/loginhistory', authenticateJWT, authCtrl.loginHistory);
  // app.post('/bloackipaddress', authenticateJWT, authCtrl.bloackIPAddress);

  // app.get('/admin-products-report', authenticateJWT, reportController.productsReport);

  //campaign manager
  app.post('/create/campaign', authenticateJWT, SellerController.createCampaign);
  app.get('/list/campaign', authenticateJWT, SellerController.listCampaign);
  app.get('/list/all/campaign', authenticateJWT, SellerController.listAllCampaign);
  app.post('/update/campaign/status', authenticateJWT, SellerController.updateCampaignStatus);
  app.post('/update/campaign', authenticateJWT, SellerController.updateCampaign);
  app.post('/delete/campaign', authenticateJWT, SellerController.deleteCampaign);
  app.post('/detail/campaign', authenticateJWT, SellerController.campaignDetail);

  app.post('/seller-account-health-by-seller-id', authenticateJWT, SellerController.sellerAccountHealthById);

  // iqrar
  app.post('/admin-show-all-users', authenticateJWT, adminController.adminShowAllUsers);
  app.post('/admin-update-user-status', authenticateJWT, adminController.adminUpdateUserStatus);

  app.post('/admin-invoice-report-get-all-orders', reportController.orderInvoiceReportGetAllOrders);

  // Premium Product
  app.post('/update-premium-product', authenticateJWT, product.updatePremiumPackge);
  app.post('/order-invoice-for-user-by-order-id', authenticateJWT, reportController.orderInvoiceForUser);


  app.post('/get-vendors-subscription-list', authenticateJWT, reportController.getPdfvendorsSubscriptionlist);

  app.post('/create-visitor-graph-of-product', authenticateJWT, adminController.createvisitorgraph);
  app.post('/get-product-graph-info-by-product-id', authenticateJWT, SellerController.getVisitarGraphInfoById);
  app.post('/get-product-graph-info-by-month-year', authenticateJWT, SellerController.getVisitarGraphInfoByMonthYear);

  app.post('/create-product-rating', authenticateJWT, adminController.createProductRating);
  app.post('/get-product-rating', authenticateJWT, adminController.getProductRating);

  app.post('/get-vendors-subscription-list-pdf', adminController.getPdfvendorsSubscriptionlist);

  // Abhishek
  app.post('/get-users-report', authenticateJWT, reportController.getUsersReport);

  app.post('/create-get-compare-product', authenticateJWT, product.createGetComapareProduct);
  app.post('/get-user-count', authenticateJWT, adminController.userCount);

  // iqrar
  app.post('/get-sales-count', authenticateJWT, adminController.salesCount);

  app.post('/get-orders-report', authenticateJWT, reportController.ordersAdvanceReports);

  // Html Pages
  app.post('/create-html-pages', authenticateJWT, htmlPagesController.createHtmlPages);
  app.put('/update-html-pages', authenticateJWT, htmlPagesController.updateHtmlPages);
  app.get('/get-html-pages', htmlPagesController.getHtmlPages);
  app.post('/getAll-html-pages', htmlPagesController.getAllHtmlPages);
  app.delete('/delete-html-pages', authenticateJWT, htmlPagesController.deleteHtmlPages);
  app.put('/status-update-html-pages', authenticateJWT, htmlPagesController.statusUpdate);

  app.post('/tranding-product-highlight', product.trandingProductHighlight);

  app.post('/create/cancel_Policy', authenticateJWT, adminController.createCancelPolicy);
  app.post('/update/cancel_Policy', authenticateJWT, adminController.UpdateCancelPolicy);
  app.get('/cancel_policy_byid', authenticateJWT, adminController.listCancelPolicyById)
  app.get('/list/all/cancel_policy', authenticateJWT, adminController.listCancelPolicy)

  app.post('/dashboard', authenticateJWT, adminController.dashBoard);
  app.post('/related-products', product.relatedProducts)

  app.post('/update-track-status', authenticateJWT, orderController.updateTrackStatus)
  app.post('/update-order', authenticateJWT, orderController.updateOrderProductValue)

  app.post('/particular-product-return', orderController.particularProductReturn);

  app.post('/logout', authenticateJWT, authCtrl.logout);
  app.post('/send-otp-to-user', authCtrl.sendOtpToUser);

  app.post('/get-products-advance-report', authenticateJWT, reportController.getProductsAdvanceReport);

  app.post('/get-print-order-user', authenticateJWT, reportController.printOrderUser);

  app.post('/product-name-by-search-keyword', product.searchProductsNameByKeyWord);

  app.post('/add-return-policy-days', authenticateJWT, orderController.addReturnPolicyDays);
  app.put('/update-return-policy-days', authenticateJWT, orderController.updateReturnPolicyDays);
  app.get('/getOne-return-policy-days', authenticateJWT, orderController.getOneReturnPolicyDays);
  app.get('/getAll-return-policy-days', authenticateJWT, orderController.getAllReturnPolicyDays);

  //replace order product
  app.post('/create-replace-order-product', authenticateJWT, orderController.createReplaceOrderProduct);
  app.post('/getOne-product-replace-order', authenticateJWT, orderController.getOnereplaceOrderProduct);
  app.post('/getAll-product-replace-order', authenticateJWT, orderController.getAllreplaceOrderProduct);
  app.post('/delete-product-replace-order', authenticateJWT, orderController.deleteReplaceOrderProduct);

  app.post('/admin-commission-by-productid', authenticateJWT, orderController.adminCommissionByProductid);
  app.post('/send-sms', authController.sendsms);

  app.get('/updateOrder', authenticateJWT, orderController.updateOrder);

  // product ques ans
  app.post('/create-product-ques-ans', authenticateJWT, product.createProductQuesAns);
  app.put('/update-product-ques-ans', authenticateJWT, product.updateProductQuesAns);
  app.get('/get-product-ques-ans-by-ques-id', authenticateJWT, product.getProductQuesAnsByQuesId);
  app.get('/get-product-ques-ans-by-product-id', authenticateJWT, product.getProductQuesAnsByProductId);
  app.delete('/delete-product-ques-ans-by-ques-id', authenticateJWT, product.deleteProductQuesAns);

  // Manage CaseLog
  app.post('/create-manage-caselog', authenticateJWT, ManageCaseLogController.createManageCaseLog);
  app.post('/get/all/manage-caselog', authenticateJWT, ManageCaseLogController.listAllManageCaseLog);
  app.post('/get/seller/manage-caselog', authenticateJWT, ManageCaseLogController.listManageCaseLog);
  app.post('/update/manage-caselog/status', authenticateJWT, ManageCaseLogController.updateManageCaseLogStatus);
  app.post('/update/manage-caselog', authenticateJWT, ManageCaseLogController.updateManageCaseLog);
  app.post('/detail/manage-caselog', authenticateJWT, ManageCaseLogController.ManageCaseLogDetail);
  app.post('/delete/manage-caselog', authenticateJWT, ManageCaseLogController.deleteManageCaseLog);
  app.post('/create/plans', authenticateJWT, upload.any(), ManageCaseLogController.createPlans);
  app.put('/update/plans', authenticateJWT, upload.any(), ManageCaseLogController.updatePlans);
  app.get('/get-by-id/plans', authenticateJWT, ManageCaseLogController.getByIdPlan);
  app.post('/getAll/plans', authenticateJWT, ManageCaseLogController.getAllPlan);
  app.get('/delete/plans', authenticateJWT, ManageCaseLogController.deletePlan);

  app.get('/apply-coupon-codes-on-product', authenticateJWT, couponCodesController.applyCouponCode);

  // Shipping rates
  app.post('/create-shipping-codes', authenticateJWT, shippingCodesController.createShippingCodes);
  app.put('/update-shipping-codes', authenticateJWT, shippingCodesController.updateShippingCodes);
  app.get('/getOne-shipping-codes', authenticateJWT, shippingCodesController.getOneShippingCodes);
  app.get('/getByPincode-shipping-codes', authenticateJWT, shippingCodesController.getShippingCodesByPincodeNo);
  app.get('/getAll-shipping-codes', authenticateJWT, shippingCodesController.getAllShippingCodes);
  app.delete('/delete-shipping-codes', authenticateJWT, shippingCodesController.deleteShippingCodes);

  app.post('/account-health-by-user-id', authenticateJWT, orderController.accountHealthByUserId);
  app.post('/admin-banktransfer', authenticateJWT, orderController.banktransfer);

  app.post('/top-sale-product-category-wise-list', product.topSaleProductCategoryWiseList);
  app.post('/top-sale-product-by-category', product.topSaleProductByCategory);
  app.get('/admin-getbanktransfer', authenticateJWT, orderController.getbanktransfer);
}

authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDJmOWYxNWU0ZDgzMjc1OTc4NWM1MWMiLCJzb2NpYWxpZCI6bnVsbCwidHlwZV9sb2dpbiI6bnVsbCwib3RwIjoiMTg4MiIsIm1vYmlsZV9vdHAiOiI4NDk4IiwiZ3N0aW4iOmZhbHNlLCJmc3NhaSI6ZmFsc2UsImlzRW1haWxWZXJpZmllZCI6dHJ1ZSwiaXNNb2JpbGVWZXJpZmllZCI6ZmFsc2UsImlzQnVzc2luZXNzVmVyaWZpZWQiOnRydWUsImlwX2FkZHJlc3MiOm51bGwsIm5vX29mX2xvZ2dlZGluIjoyLCJsYXN0X2xvZ2luX3RpbWUiOiIyMDIxLTAzLTA2VDEyOjQ3OjQ1LjI3N1oiLCJ1c2VyX3N0YXR1cyI6ImFjdGl2ZSIsImVtYWlsIjoiYWJoaXBhbmNoYWwwOThAZ21haWwuY29tIiwidXNlcm5hbWUiOiJ0ZXM0dCIsInBhc3N3b3JkIjoiJDJiJDEwJFg0aktobEM1ay5NN2tBV3FvTXRkbC5lTXA2VVF0d1JSTmFjZmsudWNmNzVZNURpNmhZcG8yIiwicm9sZXMiOiJTRUxMRVIiLCJtb2JpbGVfbnVtYmVyIjoiNjY2NjY2NjY2NiIsIl9fdiI6MCwibm90ZSI6bnVsbCwiaWF0IjoxNjE1MDM1MTYzfQ.5bQ7opf3yC60oe1FEyaGyQoRINT85afC7IB3e1bgrNw';

    if (token) {
      jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }

        if (!user || !user._id) {
          return res.send({ status: false, message: 'Not Authorized' });
        }
        console.log(user)
        req.user = user;
        next();
      });
    } else {
      return res.send({ status: false, message: 'Not Authorized' });
    }
  } else {
    res.sendStatus(401);
  }
};

module.exports = routefunctions;


// {
//   "name": "Ball",
//   "slug": "ball",
//   "description": "sports desc",  // it can be null
//   "parent_category": "5fd8a6d6bf1a001f60a15975" // if parent_category define then its a child category of parent_category otherwise main category
// }

// 5fdcaa3e61c03bcb6622af69



// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNlbGxlckB5b3BtYWlsLmNvbSIsIl9pZCI6IjVmNGM4OGQ3YTQxMzg2NjBlOThlMTgxNSIsInRpbWUiOjE2MDk3NjAxOTAzODcsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE2MDk3NjAxOTB9.iC5GSa9zLaOI4_FCvwnj6Jtvb4UdXtDw04V5SdqTUps
