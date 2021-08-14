var nodemailer = require('nodemailer');
const firebase = require("firebase-admin");
const db = require('../_helper/db');
const UserLogins = db.UserLogins;
const serviceAccount = require('../_helper/firebase/secret.json');
// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'mail786tester@gmail.com',
//         pass: 'oaelwbhhckizzoce',
//         // user: 'admin@galinukkad.com',
//         // pass: 'Manish@123'
//     }
// });

var transporterAdmin = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false,
    auth: {
        // user: 'mail786tester@gmail.com',
        // pass: 'oaelwbhhckizzoce',
        user: 'admin@galinukkad.com',
        pass: 'Manish@123'
    }
});

var transporterInfo = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'info@galinukkad.com',
        pass: 'Manish@123'
    }
});

const Helper = {
    
    sendNotification(title, message) {
    return new Promise(async (resolve, reject) => {
        try {
            await UserLogins.find({ $and: [ {'firebase_token': {$ne: null }}, {'firebase_token': {$ne: '' }} ] }).then((data) => {
             
              for(i=0; i<data.length; i++){
                 let firebaseToken = data[i].firebase_token;
                firebase.initializeApp({
                credential: firebase.credential.cert(serviceAccount),
                databaseURL: "https://galinukkad.firebaseio.com"
              });

              const payload = {
                notification: {
                  title: title,
                  body: message,
                }
              };
             
              const options = {
                priority: 'high',
                timeToLive: 60 * 60 * 24, // 1 day
              };
                let firebaseToken1 = data[i].firebase_token;      
                console.log(firebaseToken1);
                if(firebaseToken1 != null){
                    firebase.messaging().sendToDevice(firebaseToken1, payload, options)  
                }
                
              }
              // .then(function(response){
              //   console.log("successfully send message", response);
              // })
              // .catch(function(error){
              //   console.log('Error sending message', error);
              // });
             })
           
        } catch (error) {
            return resolve(false);
        }
    });
},


    sendEmail(email, subject, msg_body) {
        // email sending
        var mailOptions = {
            from: 'admin@galinukkad.com',
            to: email,
            subject: subject,
            html: msg_body
        };
        transporterAdmin.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },

    sendEmailInfo(email, subject, msg_body) {
        // email sending
        var mailOptions = {
            from: 'info@galinukkad.com',
            to: email,
            subject: subject,
            html: msg_body
        };
        transporterInfo.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },

    trackStatus() {
        return ['Pending', 'Processed', 'Shipped', 'Delivered'];
    },

    ckeckTrackStatus(status) {
        if (status && (this.trackStatus()).includes(status)) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = Helper;