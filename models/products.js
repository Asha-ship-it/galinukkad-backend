const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DimensionsSchema = new Schema({
    length: { type: String },
    width: { type: String },
    height: { type: String },
});

const AttributesSchema = new Schema({
    name: { type: String },
    value: { type: String },
});

const varientsSchema = new Schema({
    label: { type: String },
    value: { type: String },
});

const schema = new Schema({
    title: { type: String, required: true, trim: true },
    is_featured: { type: Boolean, default: false, trim: true },
    is_hot: { type: Boolean, default: false },
    is_sale: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    vendor: { type: String, required: true },
    reviewcount: { type: Number, default: 0 },
    is_out_of_stock: { type: Boolean, default: false },
    updated: { type: Date, required: true, default: new Date() },
    depot: { type: Number, default: 0 },
    inventory: { type: Number, default: 0 },
    variants: [varientsSchema],

    productFeatures: { type: Array, default: [] },
    category: { type: Schema.ObjectId, ref: 'Category' },
    subCategory: { type: Schema.ObjectId, ref: 'sub_category' },
    // thumbnail: { type: Array },
    loginid: { type: Schema.ObjectId, ref: 'UserLogins' },
    description: { type: String, default: '' },
    specs: { type: String, default: '' },
    color: [{ type: String, default: '' }],
    location: [{ type: String, default: '' }],
    keywords: [{ type: String, default: '' }],
    rewardpoint: { type: Number, default: 0 },
    productId: { type: String, default: '' },
    height: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
    width: { type: Number, default: 0 },

    // new fields add 14-12-2020

    // General fileld 
    price: { type: Number, require: true },
    sale_price: { type: Number, default: 0 },
    discounted_price: { type: Number },
    sale_price_date_from: { type: Date },
    sale_price_date_to: { type: Date },

    // Inventory fields
    sku: { type: String, require: true, unique: true },
    stock_quanlity: { type: Number, require: true },
    allow_back_orders: { type: String, default: null },
    low_stock_threshold: { type: String, default: null },
    stock_status: { type: String, default: "In Stock" },

    // Shipping
    weight: { type: String },
    dimensions: DimensionsSchema,
    attributes: [AttributesSchema],

    // Product Images
    images: { type: Object },
    gallary_images: { type: Array },

    // Premium Package
    is_premium_package: { type: Boolean, default: false },
    premium_package_desc: { type: String, default: null },
    top_sale: { type: Number }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.index({ title: 'text', keywords: 'text', keywords: 'text', vendor: 'text', description: 'text' });

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('product', schema);

// {"color": "red" , "size": "s"}