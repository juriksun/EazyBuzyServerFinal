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
/*
* methods for user controller
*/
let UserController = require('../modules/users_controller_mdl'),
    userController = new UserController();

// method for get user
exports.getUser = (req , res) => {
    console.log("get_user route executing");
    if(req.body.user !== undefined){
        let user = JSON.parse(req.body.user)
        userController.getUserPartialData(user)
        .then(userData => {
            res.status(200).json({
                status: true,
                message : `Welcome, ${userData.last_name} ${userData.first_name}`,
                user: userData
            })
        })
        .catch(error => {
            res.status(200).json({
                status: false,
                message : 'Error, Email/Username Not Valid',
                error: error
            })
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
}

// method for create new user
exports.setNewUser = (req , res) => {
    console.log("set_new_user route executing");
    if(req.body.user !== undefined){
      
        let user = JSON.parse(req.body.user)
        userController.setNewUser(user)
        .then(userData => {
            res.status(200).json({
                status: true,
                user: userData
            })
        })
        .catch(error => {
            res.status(200).json({
                status: false,
                error: error
            })
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
}