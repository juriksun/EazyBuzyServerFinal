'use strict';

let RouteController    = require('../modules/route_controller_mdl');
exports.createRoute = (req, res) => {
    console.log("create_route route executing");

    let user      = req.body.user,
        startTime   = req.body.start_time,
        endTime     = req.body.end_time,
        startPoint  = req.body.start_point,
        endPoint    = req.body.end_point,
        travelMode  = req.body.travel_mode;

    let routeController = new RouteController();

    routeController.createNewRoute(user, startTime, endTime, startPoint, endPoint, travelMode)
    .then((data) => {
        res.status(200).json(
            {
                "status": "true",
                "data": data
            }
        );
    });
};

exports.getRoute = (req, res) => {
    console.log("get_route route executing");
    res.status(200).json(
        {
            "name":"eazyBuzy",
            "version":"1.0",
            "authors":[
                "Alexander Djura",
                "Shamir Kritzler",
                "Nir Mekin"
            ],
            "description":"task managment system based GPS position and constraints - Server Side"
        }
    );
};