'use strict';

let     RouteCreator    = require('./router_creator_mdl');

module.exports = class{

    constructor(){
        this.routeCreator = new RouteCreator();
    }

    createNewRoute( user, routeInitData){
        return new Promise((resolve, reject)=>{

            this.routeCreator.setStartPoint(routeInitData.location.start_point);

            this.routeCreator.setEndPoint(routeInitData.location.end_point);

            this.routeCreator.setUser(user)
            .then((resultSetUser) => {

                this.routeCreator.dispatch()
                .then((data) => {
                    resolve(data);
                }
                )
                .catch(error => {
                    console.log(error)
                })
            })
            .catch(error => {
                console.log(error)
            });
        });
    }

    getRoute(){
        
    }
};