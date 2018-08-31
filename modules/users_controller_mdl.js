/*
* Shenkar College of Engineering and Design.
* Department of Software Engineering
* EazyBuzy - Software Engineering B.Sc. Final Project 2018
*   Created by:
*       Shamir Krizler
*       Nir Mekin
*       Alexander Djura
*
*   Supervisor:
*       Dr. Michael Kiperberg
*/
'use strict';
const User = require('../models/user_mod');

/*
* the main purpose of user controller class role is work with user data base
*/
module.exports = class{
    constructor(){

    }

    // get full data of user contain id
    getUserWithId(user){
        return new Promise((resolve, reject) => {
            // console.log(user)
            User.findOne({$and :[ {password: user.password } , {$or : [{ username : user.key_entry }, { email : user.key_entry }] }]})
            .then(user => {
                // console.log(user)
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

    // check if the user exist 
    userExist(username){
        return new Promise((resolve, reject) => {
            // console.log(username)
            User.findOne({ username : username })
            .then(user => {
                if(user) resolve(true);
                else reject(false)
            } )
            .catch(err => { 
                reject(false);
            });
        });
    }

    // save new user in database
    setNewUser(user){
        return new Promise( (resolve,reject) => {
            this.userExist(user)
            .then( userAlreadyExist => {
                reject("user already exist");
            })
            .catch( () => {
                let newUser = new User({
                    username : user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    password : user.password
                })
                newUser.save( (err,success) => {
                    if(err){
                        reject( "can't save user: \n" + err)
                    }
                    else resolve({
                        username : success.username,
                        first_name : success.first_name,
                        last_name : success.last_name,
                        email : success.email
                    })
                })
            })
        })
    }
}