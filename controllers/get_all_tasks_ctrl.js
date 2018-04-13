'use strict';

let TaskController    = require('../modules/tasks_controller_mdl');

exports.execute = (req, res) => {
    console.log("get_all_tasks route executing");
    
    let taskController = new TaskController();

    taskController.getAllTasks(req.body.username,req.body.password)
    .then( allTasks => {
        res.status(200).json(
            {
                status : "true",
                data : allTasks
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