'use strict';

let     RouteCreator    = require('./router_creator_mdl');

module.exports = class{

    constructor(){
        this.routeCreator = new RouteCreator();
    }

    createNewRoute( user, startTime, endTime,
                    startPoint, endPoint, travelMode
    ){
        return new Promise((resolve, reject)=>{
            //routeCreator.setStartTime()
            //routeCreator.setEndPoint()
            this.routeCreator.setStartPoint(startPoint);
            this.routeCreator.setEndPoint(endPoint);
            //routeCreator.setTRavelMode(travelMode);
            console.log(user)
            this.routeCreator.setUser(JSON.parse(user))
            .then((resultSetUser) => {
                if(resultSetUser !== 0){
                    console.log(resultSetUser)
                }
                this.routeCreator.dispatch()
                .then((data) => {
                    resolve(data);
                }
                )
                .catch(error => {
                    console.log(error)
                })
            })
            .catch();

            
        });
    }

    getRoute(){
        
    }
};