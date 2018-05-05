'use strict';
 let TaskMod        = require('../models/task_mod'),
     UserMod        = require('../models/task_mod'),
     Type           = require('../models/type_mod'),
     Comany         = require('../models/companies_mod'),

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

    addOrUpdateTask(user, taskId, taskUpdateData, locationData){
        return new Promise( (resolve,reject) => {
           
            this.userController.getUserWithId(user)
            .then(user => {
                
                if(user !== {} ){
                    
                    let toUpDate = {};

                    toUpDate.user_token_id = user._id;

                    toUpDate.name = taskUpdateData.name;

                    toUpDate.type = taskUpdateData.type;

                    toUpDate.status = 'ready';

                    toUpDate.time = {
                        start_time: taskUpdateData.time_start,
                        date: taskUpdateData.time_date,
                        duration: taskUpdateData.time_duration
                    };


                    toUpDate.priority = taskUpdateData.priority;

                    toUpDate.task_place = taskUpdateData.task_place;
                    
                    toUpDate.location = locationData;

                    let conditions = { _id: taskId || mongoose.Types.ObjectId()} ,
                        update      = { $set:  toUpDate },
                        opts = { new: true, upsert: true };

                    TaskMod.findOneAndUpdate(conditions, update, opts)
                    .then( result => {
                        // console.log(result);
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

                    



    getTypes(){
        return new Promise((resolve, reject) => {
            Type.find({})
            .then(result => {
                resolve(result)
            })
            .catch(error => {
                reject(error)
            });
        }) 
    }

    getCompanies(type){
        return new Promise((resolve, reject) => {
            Comany.findOne({formated_name: type})
            .then(result => {
                resolve(result)
            })
            .catch(error => {
                 reject(error)
            });
        }) 
    }
}