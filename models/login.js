const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    roles: { type: String, required: true },
    socialid: { type: String, default: null },
    type_login: { type: String, default: null },
    mobile_number: { type: String, defualt: null, unique: true },
    otp: { type: String, default: null },
    mobile_otp: { type: String, default: null },
    gstin: { type: Boolean, default: false },
    fssai: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    isBussinessVerified: { type: Boolean, default: false },
    ip_address: { type: String, default: null },
    no_of_loggedin: { type: Number, default: 0 },
    last_login_time: { type: Date, default: null }, // for login history
    firebase_token: { type: String, default: null }, // for login history
    user_status: { type: String, default: "active" },
    note: { type: String }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UserLogins', schema);
