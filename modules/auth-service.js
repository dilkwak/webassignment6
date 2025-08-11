const mongoose = require('mongoose');
require('dotenv').config(); 

if (!process.env.MONGODB) {
    throw new Error('MONGODB is missing from .env');
}
let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: {type: String, unique: true},
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String,
    }]
});

let User; //= mongoose.model('companies', userSchema);

function initialize() {
return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on('error', (err)=>{
        reject(err); // reject the promise with the provided error
    });
    db.once('open', ()=>{
        User = db.model("users", userSchema);
        resolve();
    });
});}


function registerUser(userData){
//the userData object has the following properties: .userName, .userAgent, .email, .password, .password2
return new Promise((resolve,reject) => {
if (userData.password !== userData.password2){
    return reject("Passwords do not match");
} else {
    let newUser = new User({
    userName: userData.userName,
    password: userData.password,
    email: userData.email,
    });

    newUser.save()
    .then(() => resolve())
    .catch((err) => {
        if(err && err.code === 11000){
            return reject('User Name already taken');
        } else {
            return reject(`There was an error creating the user: ${err}`);
        }
    });
}
});
}//function


function checkUser(userData){
return new Promise((resolve, reject) => {
    User.find({userName: userData.userName}).exec()
    .then((users)=>{
        if (users.length === 0) {
            return reject(`Unable to find user: ${userData.userName}`);
        }
        const userLogin = users[0];
        if(userLogin !== userData.password){
            return reject(`Incorrect Password for user: ${userData.userName}`);
        }

        if(userLogin.loginHistory.length == 8){
            return userLogin.loginHistory.pop();
        }

        userLogin.loginHistory.unshift({
            dateTime:(new Date()).toString(),
            userAgent: userData.userAgent
        });

        User.updateHistory(
            {userName: userLogin.userName},
            {$set:{loginHistory:userLogin.loginHistory}}
        ).then(() => resolve())
        .catch((err) => reject (`There was an error verifying the user: ${err}`));
    })
    .catch(()=> reject(`Unable to find user: ${userData.userName}`));
})
}//function
/**
 * ```function checkUser(userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })
            .exec()
            .then((users) => {
                if(users.length === 0) {
                    reject(`Unable to find user: ${userData.userName}`);
                }

                bcrypt.compare(userData.password, users[0].password).then().catch(() => {
                    reject(`Incorrect Password for user: ${userData.userName}`);
                });

                if(users[0].loginHistory.length == 8) {
                    users[0].loginHistory.pop();
                }

                users[0].loginHistory.unshift({dateTime: (new Date()).toString(), userAgent: userData.userAgent});

                User.updateOne({ userName: userData.userName }, { $set: {loginHistory: users[0].loginHistory} })
                    .exec()
                    .then(() => {
                        resolve(users[0]);
                    })
                    .catch((err) => {
                        reject(`There was an error verifying the user: ${err}`);
                    });
            })
            .catch(() => {
                reject(`Unable to find the user: ${userData.userName}`);
            })
    });
}```
 */
module.exports = { 
    initialize,
    registerUser, 
    checkUser
};
