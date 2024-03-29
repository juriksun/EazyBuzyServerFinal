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
* method for cereating route
*/
let RouteController    = require('../modules/route_controller_mdl');
exports.execute = (req, res) => {
    console.log("create_route route executing");
    let userId      = req.body.uder_id,
        startTime   = req.body.start_time,
        endTime     = req.body.end_time,
        startPoint  = req.body.start_point,
        endPoint    = req.body.end_point,
        travelMode  = req.body.travel_mode;
    let routeController = new RouteController();

    routeController.createNewRoute(userId, startTime, endTime, startPoint, endPoint, travelMode)
    .then((data) => {
        res.status(200).json(
            {
                "status": "true",
                "data": data
            }
        );
    });
};