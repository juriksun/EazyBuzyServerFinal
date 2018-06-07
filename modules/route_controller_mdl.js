'use strict';

let     RouteCreator    = require('./router_creator_mdl');
const   Route            = require('../models/route_mod');
module.exports = class{

    constructor(){
        this.routeCreator = new RouteCreator();
    }

    createNewRoute( user, routeInitData){
        return new Promise((resolve, reject)=>{
            this.routeCreator.setTimeWindow(routeInitData.time);
            this.routeCreator.setStartPoint(routeInitData.location.start_point);

            this.routeCreator.setEndPoint(routeInitData.location.end_point);

            this.routeCreator.setTravelMode(routeInitData.mode);
            this.routeCreator.setTasks

            this.routeCreator.setUser(user);
            this.routeCreator.setTasks(routeInitData.tasks)
            .then((resultSetTasks) => {
                this.routeCreator.dispatch()
                .then((data) => {
                    this.seveRoute(data)
                    .then((newRoute) => {
                        resolve(newRoute);
                    })
                    .catch( error => {
                        console.log(error);
                        reject("Error, can't save route");
                    });
                    
                }
                )
                .catch(error => {
                    console.log(error);
                    reject("Error, can't dispatch route");
                })
            })
            .catch(error => {
                console.log(error);
                reject("Error, can't set user");
            });
        });
    }

    getRoute(){
        
    }

    seveRoute(newRouteRes){
        return new Promise((resolve, reject) => {

            let newRoute = new Route(
                newRouteRes
            )
            
            newRoute.save((err, success) => {
                if (err) {
                    reject("Error, can't save user: \n" + err)
                }
                else resolve(
                    success
                )
            })
        })
    }
};