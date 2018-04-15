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
                reject(err);
            });
        });
    }
    // Secure method only information not sensative will be returned
    getUserPartialData(user){
        return new Promise((resolve, reject) => {
            User.findOne({username: user.username, password: user.password},["-_id","-password"])
            .then(user => {
                console.log(user)
                resolve(user);

            } )
            .catch(err => { 
                reject(err);
            });
        });
    }
}