'use strict';

let SharesController = require('../modules/shares_controller_mdl'),
    sharesController = new SharesController();

exports.setTaskForShare = (req , res) => {
    console.log("set new task to share");
    if(req.body.username_from !== undefined && req.body.username_to !== undefined && req.body.task_id !== undefined ){
        sharesController.setNewShareNotifictation(req.body.username_from , req.body.username_to, req.body.task_id)
        .then(message => {
            res.status(200).json({
                status: true,
                message : message,
                task_id : req.body.task_id,
                username_to : req.body.username_to
            })
        })
        .catch(error => {
            res.status(200).json({
                status: false,
                message : "Error, can't share task, try again later...",
                error: error
            })
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
}

exports.getAllShareTasks = (req , res) => {
    console.log("Get All Share Tasks");
    if(req.body.username !== undefined){
        sharesController.getAllShareTasks(req.body.username)
        .then(message => {
            res.status(200).json({
                status: true,
                response : message
            })
        })
        .catch(error => {
            res.status(200).json({
                status: false,
                message : "Error, can't get share tasks, try again later...",
                error: error
            })
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
}

exports.getSubscribeShareTasks = (req , res) => {
    console.log("Get Subscribe Share Tasks");
    if(req.body.username !== undefined && req.body.tasks_id != undefined){
        sharesController.getSubscribeShareTasks(req.body.username , JSON.parse(req.body.tasks_id))
        .then(message => {
            res.status(200).json({
                status: true,
                response : message
            })
        })
        .catch(error => {
            res.status(200).json({
                status: false,
                message : "Error, can't get share tasks, try again later...\n"+error,
                error: error
            })
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
}

exports.deleteShareRequest = (req , res) => {
    console.log("Delete Share Request");
    if(req.body.username_from !== undefined && req.body.task_id != undefined){
        sharesController.deleteShareRequest(req.body.username_from , req.body.task_id)
        .then(message => {
            res.status(200).json({
                status: true,
                response : message
            })
        })
        .catch(error => {
            res.status(200).json({
                status: false,
                message : "Error, can't delete share tasks, try again later... ",
                error: error
            })
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
}

exports.cancelShareRequest = (req , res) => {
    console.log("Cancel Share Request");
    if(req.body.username_to !== undefined && req.body.task_id != undefined){
        sharesController.CancelShareRequest(req.body.username_to , req.body.task_id)
        .then(message => {
            res.status(200).json({
                status: true,
                response : message
            })
        })
        .catch(error => {
            res.status(200).json({
                status: false,
                message : "Error, can't remove share tasks, try again later...",
                error: error
            })
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
}

exports.applyShareRequest = (req , res) => {
    console.log("Cancel Share Request");
    if(req.body.username_to !== undefined && req.body.password !== undefined && req.body.task_id != undefined){
        sharesController.ApplyShareRequest(req.body.username_to, req.body.password , req.body.task_id)
        .then(message => {
            res.status(200).json({
                status: true,
                response : message
            })
        })
        .catch(error => {
            res.status(200).json({
                status: false,
                message : "Error, can't remove share tasks, try again later...",
                error: error
            })
        })
    } else {
        res.status(200).json(
            {
                massage: 'undefined'
            }
        );
    }
}