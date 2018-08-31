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
* methods for routes controller
*/
let RouteController    = require('../modules/route_controller_mdl');

// create route method
exports.createRoute = (req, res) => {
    console.log("create_route route executing");

    let routeController = new RouteController();
    if(req.body.user !== undefined && req.body.route_init_data !== undefined ){

        routeController.createNewRoute(
            JSON.parse(req.body.user), 
            JSON.parse(req.body.route_init_data)
        )
        .then((data) => {
            res.status(200).json(
                {
                    "status": "true",
                    "data": data
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

// get route method
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