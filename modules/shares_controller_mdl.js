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


   getSubscribeShareTasks(username,tasks_id_array){
       return new Promise( (resolve , reject) => {
           let objResponse = {}
            Share.find({username_to : username})
            .then( shareTasks => {
                if(shareTasks.length > 0){
                    console.log(shareTasks)
                    objResponse.status_new = shareTasks.some( x => x.status_new ) ? 1 : 0;
                    if( objResponse.status_new ){
                        this.getAllShareTasks(username)
                        .then(tasks => {
                            objResponse.tasks = tasks;
                            resolve(objResponse);
                            return;
                        })
                        .catch(err => {
                            console.error("Error can't fetch data (getAllShareTasks),\n",err);
                            reject(err);
                        })
                    }
                    //objResponse.new_tasks = shareTasks.filter( share => share.status_new ).map(i => i.task_id);
    
                    let tasks_ids_db = shareTasks.map( i => i.task_id);
                    let removed_tasks = tasks_id_array ? tasks_id_array.filter( task_id_old => !tasks_ids_db.includes(task_id_old)) : [];
                    if(removed_tasks.length > 0){
                        this.getAllShareTasks(username)
                        .then(tasks => {
                            if(task) objResponse.status_new = -1;
                            resolve(objResponse);
                            return;
                        })
                        .catch(err => {
                            console.error("Error can't fetch data (getAllShareTasks),\n",err);
                            reject(err);
                        })
                    }
                    console.log(removed_tasks.length === 0 && objResponse.status_new,removed_tasks.length === 0 , objResponse.status_new)
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

   CancelShareRequest(username,task_id){
        return new Promise( (resolve,reject) => {
            console.log(username,task_id)    
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

} 