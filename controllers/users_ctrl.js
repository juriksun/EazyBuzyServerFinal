'use strict';

let UserController = require('../modules/users_controller_mdl'),
    userController = new UserController();

exports.getUser = (req , res) => {
    console.log("get user information");
    if(req.body.user !== undefined){
        let user = JSON.parse(req.body.user)
        userController.getUserPartialData(user)
        .then(userData => {
            res.status(200).json({
                status: true,
                data: userData
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