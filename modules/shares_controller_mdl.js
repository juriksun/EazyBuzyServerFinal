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
                            task_id : task_id
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
            Share.findOne({task_id : task_id})
            .then(share => {
                if(share) resolve(share)
                else reject(false)
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