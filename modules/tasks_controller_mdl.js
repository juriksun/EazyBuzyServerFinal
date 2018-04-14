'use strict';
 let TaskMod        = require('../models/task_mod'),
     UserMod        = require('../models/task_mod'),
     UserController = require('./users_controller_mdl');

module.exports = class{

    constructor(){
        this.userController = new UserController();
    }

    getAllTasks(user){
        return new Promise( (resolve,reject) => {
            // resolve('all task resulve')
            // console.log(user);
            // console.log(req.body.password);
            this.userController.getUserWithId(user)
            .then(userData => {
                TaskMod.find({user_token_id: userData._id})
                .then( allTasks => {
                    resolve(allTasks)
                })
                .catch( error => {

                })
            })
            .catch( error => {

            })
        })
    }

    createTask(user, task){
        return new Promise((resolve, reject) => {

            //console.log(task);
            //resolve('blaaa');
            this.userController.getUserWithId(user)
            .then(user => {
                let newTask = new TaskMod({
                    user_token_id : user._id,
                    name : task.name,
                    type: task.type,
                    task_place: {
                        place_type: task.type,
                        place_key_word: task.name
                    }
                });
                newTask.save((err1, doc5) => {
                    if(err1){
                        console.log(JSON.stringify(err1));
                        resolve('error');
                    } else {
                        resolve(doc5);
                    }
                });
            });
        });
    }
}