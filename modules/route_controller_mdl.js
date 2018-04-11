'use strict';

let     RouteCreator    = require('./router_creator_mdl');

module.exports = class{

    constructor(){
        this.routeCreator = new RouteCreator();
    }

    createNewRoute( userId, startTime, endTime,
                    startPoint, endPoint, travelMode
    ){
        return new Promise((resolve, reject)=>{
            //routeCreator.setStartTime()
            //routeCreator.setEndPoint()
            this.routeCreator.setStartPoint(startPoint);
            this.routeCreator.setEndPoint(endPoint);
            //routeCreator.setTRavelMode(travelMode);
            this.routeCreator.setUser(userId)
            .then((resultSetUser) => {
                if(resultSetUser !== 0){

                }
                this.routeCreator.dispatch()
                .then((data) => {
                    resolve(data);
                }
                );
            })
            .catch();

            
        });
    }

    getRoute(){
        
    }
};