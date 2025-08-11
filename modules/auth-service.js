const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

//the userData object has the following properties: .userName, .userAgent, .email, .password, .password2
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
        return reject("Passwords do not match");
        }
        bcrypt.hash(userData.password, 10)
        .then((hash) => {
            const newUser = new User({
            userName: userData.userName,
            password: hash,
            email: userData.email,
            loginHistory: []
            });

            return newUser.save()
            .then(() => resolve())
            .catch((err) => {
                if (err && err.code === 11000) {
                return reject("User Name already taken");
                }
                return reject(`Error creating the user: ${err}`);
            });
        })
        .catch(() => {
            return reject("Error encrypting the password");
        });
    });
}

function checkUser(userData) {
return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName }).exec()
    .then(userLogin => {
        if (!userLogin) return reject(`Unable to find user: ${userData.userName}`);

        return bcrypt.compare(userData.password, userLogin.password)
        .then(match => {
            if (!match) return reject(`Incorrect Password for user: ${userData.userName}`);

            const history = Array.isArray(userLogin.loginHistory) ? userLogin.loginHistory : [];
            if (history.length === 8) history.pop();
            history.unshift({ dateTime: new Date(), userAgent: userData.userAgent });

            return User.updateOne(
            { _id: userLogin._id },
            { $set: { loginHistory: history } }
            ).then(() => {
            userLogin.loginHistory = history;
            resolve(userLogin);
            });
        });
    })
    .catch(err => reject(`There was an error verifying the user: ${err}`));
});
}

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
