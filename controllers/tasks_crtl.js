'use strict';
let TaskController = require('../modules/tasks_controller_mdl');
let taskController = new TaskController();
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

exports.getAllTasks = (req, res) => {
    console.log("get_all_tasks route executing");
    
    if(req.body.username !== undefined && req.body.password !== undefined ){
        taskController.getAllTasks({username: req.body.username, password: req.body.password})
        .then( allTasks => {
            res.status(200).json(
                {
                    status : true,
                    tasks : allTasks
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