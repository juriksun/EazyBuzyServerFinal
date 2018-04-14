'use strict';
const User = require('../models/user_mod');

module.exports = class{
    constructor(){

    }

    getUserWithId(user){
        return new Promise((resolve, reject) => {
            User.findOne({username: user.username, password: user.password})
            .then(user => {
                resolve(user);

            } )
            .catch(err => { 
                console.log(err)
            });
        });
    }
}