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
/*
* methods for tasks controller
*/
let TaskController = require('../modules/tasks_controller_mdl');
let taskController = new TaskController();

// method for create task
exports.createTask = (req, res) => {
    console.log("create_new_task route executing");
    let user,
        task;

    if(req.body.user !== undefined && req.body.task !== undefined ){
        
        user = JSON.parse(req.body.user);
        task = JSON.parse(req.body.task);

        taskController.createTask(user, task)
        .then(data => {
            res.status(200).json(
                {
                    massage: data
                }
            );
        });
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
};

// method for get all tasks route
exports.getAllTasks = (req, res) => {
    console.log("get_all_tasks route executing");
    
    if(req.body.user !== undefined){
        taskController.getAllTasks(JSON.parse(req.body.user))
        .then( allTasks => {
            res.status(200).json(
                {
                    status : true,
                    message : 'Success, Get All Tasks',
                    tasks : allTasks
                }
            );
        })
        .catch( error => {
            res.status(200).json(
                {
                    status : "false",
                    message : "Error, Can't Fetch Tasks",
                    error : error
                }
            );
        })

    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }   
};

// mehtod for delete task
exports.deleteTask = (req, res) => {
    console.log("delete_task route executing");
    
    if(req.body.user !== undefined && req.body.task_id !== undefined ){
        taskController.deleteTask(JSON.parse(req.body.user) , req.body.task_id)
        .then( result => {
            res.status(200).json(
                {
                    status : true,
                    tasks : result
                }
            );
        })
        .catch( error => {
            res.status(200).json(
                {
                    status : "false",
                    error : error
                }
            );
        })

    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }   
};

// method for update task
exports.updateTask = (req, res) => {
    console.log("update_task route executing");
    if(
        req.body.user !== undefined && 
        req.body.task_id !== undefined &&
        req.body.task_update_data !== undefined
    ){
        taskController.updateTask(
            JSON.parse(req.body.user),
            req.body.task_id,
            JSON.parse(req.body.task_update_data)
        )
        .then( result => {
            res.status(200).json(
                {
                    status : true,
                    tasks : result
                }
            );
        })
        .catch( error => {
            res.status(200).json(
                {
                    status : "false",
                    error : error
                }
            );
        })

    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }   
};

// method for update or create new task
exports.addOrUpdateTask = (req, res) => {
    console.log("add_or_update_task route executing");

    if(
        req.body.user !== undefined &&
        req.body.task_update_data !== undefined
    ){
        taskController.addOrUpdateTask(
            JSON.parse(req.body.user),
            req.body.task_id,
            JSON.parse(req.body.task_update_data),
            JSON.parse(req.body.task_location_data) 
        )
        .then( result => {
            res.status(200).json(
                {
                    status : true,
                    tasks : result
                }
            );
        })
        .catch( error => {
            res.status(200).json(
                {
                    status : "false",
                    error : error
                }
            );
        })

    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }   
};

// method for get types of task
exports.getTypes = (req, res) => {
    console.log("get_typs route executing");
    
    taskController.getTypes()
    .then( result => {
        res.status(200).json(
            {
                status : true,
                types : result
            }
        );
    })
    .catch( error => {
        res.status(200).json(
            {
                status : "false",
                error : error
            }
        );
    })
};

// method for get companies suitable for types of task
exports.getCompanies = (req, res) => {
    console.log("get_companies route executing");
    if(req.params.type !== undefined){
        taskController.getCompanies(req.params.type)
        .then( result => {
            res.status(200).json(
                {
                    status : true,
                    data : result
                }
            );
        })
        .catch( error => {
            res.status(200).json(
                {
                    status : "false",
                    error : error
                }
            );
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }   
};