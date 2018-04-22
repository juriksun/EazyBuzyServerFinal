'use strict';
 let TaskMod        = require('../models/task_mod'),
     UserMod        = require('../models/task_mod'),
     UserController = require('./users_controller_mdl'),
     mongoose       = require('mongoose');

module.exports = class{

    constructor(){
        this.userController = new UserController();
    }

    getAllTasks(user){
        return new Promise( (resolve,reject) => {
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

    deleteTask(user , taskId){
        return new Promise( (resolve,reject) => {
            this.getTask(user)
            .then( taskToDelete => {
                if(taskToDelete!== {} ){
                    TaskMod.deleteOne({_id : taskId})
                    .then( result => {
                        resolve(result)
                    })
                    .catch( error => {
                        reject(error)
                    })
                }else{
                    reject(`Error delete task id - ${taskId}`)
                }
            })
        }) 
    }

    getTask(user){
        return new Promise( (resolve,reject) => {
            this.userController.getUserWithId(user)
            .then(userData => {
                TaskMod.findOne({user_token_id: userData._id})
                .then( taskDasks => {
                    // console.log(taskDasks);
                    resolve(taskDasks)
                })
                .catch( error => {

                })
            })
            .catch( error => {

            })
        })
    }

    updateTask(user, taskId, taskUpdateData){
        return new Promise( (resolve,reject) => {
            this.getTask(user)
            .then( taskToDelete => {
                if(taskToDelete!== {} ){

                    let toUpDate = {};

                    toUpDate.name = taskUpdateData.name;
                    toUpDate.type = taskUpdateData.type;
                    toUpDate.task_place = {
                        place_type: taskUpdateData.type,
                        place_key_word: taskUpdateData.name
                    };
                
                    let conditions  = { _id: taskId },
                        update      = { $set:  toUpDate },
                        opts = { new: true, upsert: false };

                    TaskMod.findOneAndUpdate(conditions, update, opts)
                    .then( result => {
                        resolve(result)
                    })
                    .catch( error => {
                        reject(error)
                    });
                }else{
                    reject(`Error delete task id - ${taskId}`)
                }
            })
        }) 
    }
}