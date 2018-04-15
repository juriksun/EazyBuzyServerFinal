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
    
    if(req.body.user !== undefined){
        taskController.getAllTasks(JSON.parse(req.body.user))
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

// exports.updateTask = (req, res) => {
//     console.log("delete_task route executing");
    
//     if(
//         req.body.user !== undefined && 
//         req.body.task_id !== undefined &&
//         req.body.task_update_data !== undefined
//     ){
//         console.log(req.body.user);
//         console.log(req.body.task_id);
//         console.log(req.body.task_update_data);
//         taskController.updateTask(
//             JSON.parse(req.body.user),
//             req.body.task_id,
//             JSON.parse(req.body.task_update_data)
//         )
//         .then( result => {
//             res.status(200).json(
//                 {
//                     status : true,
//                     tasks : result
//                 }
//             );
//         })
//         .catch( error => {
//             res.status(200).json(
//                 {
//                     status : "false",
//                     error : error
//                 }
//             );
//         })

//     } else {
//         res.status(200).json(
//             {
//                 massage: 'undefined'
//             }
//         );
//     }   
// };