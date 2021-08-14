const config = require('../config.json');
const mongoose = require('mongoose');
const sub_category = require('../models/sub_category');
mongoose.connect(process.env.MONGODB_URI || config.db_uri);
mongoose.Promise = global.Promise;

module.exports = {
    UserLogins: require('../models/login'),
    Profile: require('../models/profile'),
    Address: require('../models/address'),
    Category: require('../models/category'),
    Product: require('../models/products'),
    Bussiness: require('../models/bussiness'),
    otp: require('../models/otp'),
    Cart: require('../models/cart'),
    Wishlist: require('../models/wishlist'),
    Contact: require('../models/contact'),
    Order: require('../models/order'),
    OrderDetails: require('../models/order_details'),
    Review: require('../models/review'),
    NewsLetter: require('../models/newsletter'),
    RecentViewed: require('../models/recent_viewed'),
    Notification: require('../models/notification'),
    Ticket: require('../models/ticket'),
    Campaign: require('../models/campaign'),
    ChatMessage: require('../models/chat_message'),
    ChatGroup: require('../models/chat_group'),
    AdvPlan: require('../models/advplan'),
    AdvPlanBook: require('../models/advplanbook'),
    NewsCategory: require('../models/newscategories'),
    NewsArticle: require('../models/newsarticles'),
    Keywords: require('../models/keywords'),
    Communication: require('../models/communication'),
    Sub_Category: require('../models/sub_category'),
    CouponCodes: require('../models/coupon_code'),
    HomePageBanner: require('../models/home_page_banner'),
    Order_Return: require('../models/order_return'),
    Shipping_Rates: require('../models/shipping_rates'),
    Shipping_Codes: require('../models/shipping_codes'),
    Frequently_Asked_Question: require('../models/frequently_asked_question'),
    Visitor_Graph: require('../models/visitor_graph'),
    Product_rating: require('../models/products_rating'),
    Compare_product: require('../models/compare_products'),
    Payment_details: require('../models/payment_details'),
    HtmlPages: require('../models/htmlPages'),
    cancel_policy: require('../models/cancel_policy'),
    return_policy_days: require('../models/return_policy_days'),
    replaceOrder: require('../models/replceOrder'),
    productQuesAns: require('../models/product_ques_ans'),
    manage_caselog: require('../models/manage_caselog'),
    Plans: require('../models/plans'),
    bank_transaction: require('../models/bank_transaction'),
    Ecom_Annexure: require('../models/ecom_annexure'),
};
