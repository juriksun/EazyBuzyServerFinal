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
            this.getShareTask(task_id)
            .then( resultGetShareTask => {
                reject("Task already sent to share")
            })
            .catch( result => {
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
            })
            
        })
   }
   
   getShareTask(task_id){
       return new Promise( (resolve,reject) => {
            Task.findOne({ _id : task_id})
            .then(task => {
                if(task) resolve(task)
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
                    Promise.all( result.map( i => this.getShareTask(i.task_id)))
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
   getNotificationUpdate(user_id,taskIdArray){
       return new Promise( (resolve,reject) => {
            Share.find({username_to : user_id})
            .then( shares => {
                if(shares){
                   let tasksId = shares.map( i => i.task_id);
                   let newTasksToShare = taskIdArray.filter( i => !tasksId.includes(i) ); 
                   resolve(newTasksToShare.map( i => shares.find( x => x===i)));
                }
                else{
                    reject("No new task to share")
                }
            })
       })
        
   }
} 