'use strict';
const Share = require('../models/share_mod');
const User = require('../models/user_mod');
const UsersController = require('./users_controller_mdl');
const Task = require('../models/task_mod');
const TasksController = require('./tasks_controller_mdl');

module.exports = class{
    constructor(){
        this.usersController = new UsersController();
        this.tasksController = new TasksController();
    }

    // setting new request to another user to share a task
   setNewShareNotifictation(username_from,username_to,task_id){
        return new Promise( (resolve , reject) => {
            if(username_from !== username_to){
                Share.find({task_id:task_id})
                .then( resultGetShareTask => {
                    if(resultGetShareTask.length > 0){
                        reject("Task already sent to share")
                    }
                    else{
                        this.usersController.userExist(username_to)
                        .then( userExistResult => {
                            this.tasksController.setShareTask(username_to,task_id)
                            .then( result => {
                                let newShare = new Share({
                                    username_from : username_from,
                                    username_to : username_to,
                                    task_id : task_id,
                                    status_new : true
                                });
                                newShare.save((err, doc) => {
                                    if(err){
                                        reject('problem with sharing task\n',err);
                                    } else {
                                        resolve(`Task as been send to ${username_to} and waiting to his apply`);
                                    }
                                });
                            })
                            .catch( error => {
                                console.log("setShareTask error,\n", error);
                                reject(error);
                            })
                        })
                        .catch(error => {
                            console.log("userExist error,\n", error);
                            reject(error);
                        })
                    }
                })
                .catch( err => {
                    console.error("Error can't fetch data from share\n",err);
                    reject(err);
                })
                
            
            }else{
                reject("Error, can't share with yourself!");
            }
        }) 
   }
   

   getShareTask(task_id , username){
       return new Promise( (resolve,reject) => {
            Task.findOne({ _id : task_id})
            .then(task => {
                let taskReturnObject = Object.assign({share_from : username} , task._doc);
                console.log(task)
                if(task) resolve(taskReturnObject)
                else reject(false)
            })
       })
    
   }

   // change status to false of "status_new" in case document form collection "share" is true
   viewShareTask(task_id){
        let conditions  = { task_id: task_id } ,
        update      = { $set:  { status_new : false } },
        opts = { new: true, upsert: true };

        Share.findOneAndUpdate(conditions, update, opts)
        .then( result => {
            console.log("View task ",task_id,result);
        })
        .catch( error => {
            console.error("Error view task ",error);
        });
   }

   // get all user share task 
   getAllShareTasks(username){
       return new Promise( (resolve,reject) => {
           let objRespons = {}
            Share.find({username_to : username})
            .then(result => {
                if(result.length > 0){
                    objRespons.newShare = result.some( x => x.status_new === true );
                    Promise.all( result.map( i => this.getShareTask(i.task_id , i.username_from)))
                    .then( resultGetShareTasks => {
                        resolve({
                            status_new : objRespons.newShare,
                            tasks : resultGetShareTasks
                        })
                    })
                    .catch( err => {
                        console.error("Error promise all getShareTask,\n",err);
                        reject(err)
                    })
                    result.map( i => {
                        if(i.status_new)
                            this.viewShareTask(i.task_id);
                    })
                }
                else{
                    resolve({
                        status_new : false,
                        tasks : []
                    })
                }
            })
            .catch(err => {
                console.error("Error find Share Tasks,\n",err);
                reject(err);
            })
       })
   }

// method to subscribe (get notification) regarding new or deleted "share task"
   getSubscribeShareTasks(username,tasks_id_array){
       return new Promise( (resolve , reject) => {
           let objResponse = {}
            Share.find({username_to : username})
            .then( shareTasks => {
                if(shareTasks.length > 0){
                    objResponse.status_new = shareTasks.some( x => x.status_new ) ? 1 : 0;
                    if( objResponse.status_new ){
                        this.getAllShareTasks(username)
                        .then(getAllShareTasksResopnse => {
                            objResponse.tasks = getAllShareTasksResopnse.tasks;
                            resolve(objResponse);
                            return;
                        })
                        .catch(err => {
                            console.error("Error can't fetch data (getAllShareTasks),\n",err);
                            reject(err);
                        })
                    }
    
                    let tasks_ids_db = shareTasks.map( i => i.task_id);
                    let removed_tasks = tasks_id_array ? tasks_id_array.filter( task_id_old => !tasks_ids_db.includes(task_id_old)) : [];
                    if(removed_tasks.length > 0){
                        this.getAllShareTasks(username)
                        .then(getAllShareTasksResopnse => {
                            if(getAllShareTasksResopnse) {
                                objResponse.status_new = -1;
                                objResponse.tasks = getAllShareTasksResopnse.tasks
                            }
                            resolve(objResponse);
                            return;
                        })
                        .catch(err => {
                            console.error("Error can't fetch data (getAllShareTasks),\n",err);
                            reject(err);
                        })
                    }
                    if(removed_tasks.length === 0 && !objResponse.status_new){
                        objResponse.tasks = [];
                        resolve(objResponse);
                    }
                }
                else{
                    if(tasks_id_array.length > 0)
                        objResponse.status_new = -1;
                    else objResponse.status_new = 0;
                    objResponse.tasks = [];
                    resolve(objResponse);
                }
                
                
            })
            .catch(err => {
                console.error("Error getSubscribeShareTasks find Share,\n",err);
                reject(err);
            })
       })
   }

   // User which asked to share a task will "end" the request and the other will user his notification will be removed
   // after the method end the task will be open again for sharing
   deleteShareRequest(username,task_id){
       return new Promise( (resolve,reject) => {
                Share.deleteOne({$and:[{task_id : task_id } , {username_from : username}]})
                .then(result => {
                    if(result.n){
                        resolve("Task has been unshared");
                        this.tasksController.setShareTask("",task_id)
                        .catch(err => {
                            console.error("Error can't delete Task from Task collection,\n",err);
                            reject(err)
                        })
                    }else{
                        reject("Can't find Share task")
                    }
                })
                .catch(err => {
                    console.error("Error can't delete Task from Share collection,\n",err);
                    reject(err)
                })
            
       })
   }

   // User who asked for "share task" will cacnel the request
   // User which asked to share the task could now share it with some one else 
   CancelShareRequest(username,task_id){
        return new Promise( (resolve,reject) => {
            Share.deleteOne({$and:[{task_id : task_id } , {username_to : username}]})
            .then(result => {
                if(result.n){
                    resolve("removed share request");
                    this.tasksController.setShareTask("",task_id)
                    .catch(err => {
                        console.error("Error can't delete Task from Task collection,\n",err);
                        reject(err)
                    })
                }else{
                    reject("Can't find Share task")
                }
            })
            .catch(err => {
                console.error("Error can't delete Task from Share collection,\n",err);
                reject(err)
            })
        
    })
   }

   // This method will approve the transfer of the task to the user who approved
   ApplyShareRequest(username,password,task_id){
        return new Promise((resolve,reject) => {
            this.usersController.getUserWithId({password:password,key_entry:username})
            .then( resultUser => {
                if(resultUser){
                    this.CancelShareRequest(username,task_id)
                    .then(result => {
                        this.tasksController.updateUserTokenToTask(resultUser._id,task_id)
                        .then( resultUpdateTask => {
                            resolve("Task added to your list");
                        })
                        .catch(err => {
                            console.error("Can't update task,\n",err);
                            reject(err);
                        })
                    })
                    .catch( err => {
                        reject(err);
                    })
                }else{
                    reject("Can't find user");
                }
            })
            .catch(err => {
                console.error("Error, can't apply share task... please try again later");
                reject(err);
            })
        })
   }

} 