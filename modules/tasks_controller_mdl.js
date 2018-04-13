'use strict';
 let TaskMod    = require('../models/task_mod'),
     UserMod    = require('../models/task_mod')

module.exports = class{

    constructor(){

    }

    getAllTasks(username , password){
        return new Promise( (resolve,reject) => {
            UserMod.find({username : username , password : password})
            .then( user => {
                let user_token_id = user._id.toString();
                TaskMod.find({user_token_id :  user_token_id})
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

    createTask(...arg){
        // const { name , type , status , share , edit_time , time , priority , task_place , location } = arg
        // console.log("TEST : "+ name , type , status , share , edit_time , time , priority , task_place , location)
        console.log(JSON.stringify(arg));
    }
}