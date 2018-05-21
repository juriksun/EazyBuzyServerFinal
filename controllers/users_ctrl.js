'use strict';

let UserController = require('../modules/users_controller_mdl'),
    userController = new UserController();

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