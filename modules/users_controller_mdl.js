'use strict';
const User = require('../models/user_mod');

module.exports = class{
    constructor(){

    }

    getUserWithId(user){
        return new Promise((resolve, reject) => {
            User.findOne({$and :[ {password: user.password } , {$or : [{ username : user.key_entry }, { email : user.key_entry }] }]})
            .then(user => {
                if(user) resolve(user);
                else reject("user not found")
            } )
            .catch(err => { 
                reject(err);
            });
        });
    }
    // Secure method only information not sensative will be returned
    getUserPartialData(user){
        return new Promise((resolve, reject) => {
            User.findOne({$and :[ {password: user.password } , {$or : [{ username : user.key_entry }, { email : user.key_entry }] }]},["-_id","-password"])
            .then(user => {
                if(user) resolve(user);
                else reject("user not found")
            } )
            .catch(err => { 
                reject(err);
            });
        });
    }
}