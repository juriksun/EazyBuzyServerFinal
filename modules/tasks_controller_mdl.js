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
let TaskMod        = require('../models/task_mod'),
    Type           = require('../models/type_mod'),
    Comany         = require('../models/companies_mod'),
    UserController = require('./users_controller_mdl'),
    mongoose       = require('mongoose');

/*
* the main purpose of task controller class role is work with task data base
*/
module.exports = class{

    constructor(){
        this.userController = new UserController();
    }

    // method for get all tasks of some user
    getAllTasks(user){
        return new Promise( (resolve,reject) => {
            this.userController.getUserWithId(user)
            .then(userData => {
                TaskMod.find({user_token_id: userData._id})
                .then( allTasks => {
                    resolve(allTasks)
                })
                .catch( error => {
                    reject("Error, can't find tasks")
                })
            })
            .catch( error => {
                reject("Error, can't find user")
            })
        })
    }

    // get special tasks of user by array of tasks id
    getTasks(user, tasks){
        return new Promise((resolve, reject) => {
            this.userController.getUserWithId(user)
            .then(userData => {
                TaskMod.find({_id: {$in: tasks}, user_token_id: userData._id}).lean().exec()
                .then( allTasks => {
                    resolve(allTasks);
                })
                .catch( error => {
                        reject("Error, can't find tasks");
                })
            })
            .catch( error => {
                reject("Error, can't find user");
            });
        });
    }

    // save new task
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

    // delete task
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

    // get one task of some user
    getTask(user){
        return new Promise( (resolve,reject) => {
            this.userController.getUserWithId(user)
            .then(userData => {
                TaskMod.findOne({user_token_id: userData._id})
                .then( taskDasks => {
                    resolve(taskDasks)
                })
                .catch( error => {

                })
            })
            .catch( error => {

            })
        })
    }

    // get one task full information by task id
    getTasksInfoByTasksId(tasks_id){
        return new Promise( (resolve,reject) => {
            TaskMod.find({_id: {$in : tasks_id }})
            .then( tasks => {
                if(tasks) resolve(tasks)
                else reject("Error getting tasks info")
            })
            .catch(err => {
                console.error("Error getTasksInfobyTasksId TaskMod find,\n",err);
                reject(err);
            })
        })
    }

    // update some task data
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

    // add or update task.
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

    // set stutus of the task to shares or not
    setShareTask(username,task_id){
        return new Promise((resolve,reject) => {
            let conditions  = { _id: task_id } ,
            update      = { $set:  { share : username } },
            opts = { new: true, upsert: true };

            TaskMod.findOneAndUpdate(conditions, update, opts)
            .then( result => {
                resolve(true);
            })
            .catch( error => {
                console.error(error);
                reject(false);
            });
        })
    }  
    
    // associate the task to other user
    updateUserTokenToTask(userToken,task_id){
        return new Promise((resolve,reject) => {
            let conditions  = { _id: task_id } ,
            update      = { $set:  { user_token_id : userToken } },
            opts = { new: true, upsert: true };

            TaskMod.findOneAndUpdate(conditions, update, opts)
            .then( result => {
                resolve(true);
            })
            .catch( error => {
                console.error(error);
                reject(false);
            });
        })
    }

    // get list of task types 
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

    // get list of companies belonging to types of task
    getCompanies(type){
        return new Promise((resolve, reject) => {
            Comany.findOne({name: type})
            .then(result => {
                
                resolve(result || {companies: null})
            })
            .catch(error => {
                 reject(error)
            });
        }) 
    }
}