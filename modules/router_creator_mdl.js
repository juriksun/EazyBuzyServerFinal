module.exports = class {
    //no now
    constructor(){
        
    }

    //not for alpha
    setTimeWindow(){
    
    }

    //
    setStartPoint(){

    }

    //
    setEndPoint(){

    }

    //
    setTaskForSearchPath(allTasksForSearch){
        this.allTasksForSearch = allTasksForSearch
    }

    calcPolygon(){
        return new Promise((resolve, reject)=>{

        })
    }

    //not for alpha
    filterByTime(){

    }

    //
    dispatch(){
        return new Promise((resolve, reject)=>{
            this.calcPolygon()
                .then((polygon) => {
                this.getSuiteblePlaces(polygon, this.tasks)//alex
                    .then((suiteblePlaces) => {
                        this.calcPossibleRoutes(suiteblePlaces)//alex
                        .then(possibleRoutes => {
                            this.buildAllRoutesWithSegments(possibleRoutes)//alex
                            .then(allRoutesWithSegments => {
                                this.getAllDirectionForRoutesWithSegments(allRoutesWithSegments)//alex
                                .then(directionsForRoutesWithSegments => {
                                    this.directionsForRoutesWithSegments = directionsForRoutesWithSegments
                                    this.chooseRecommendedRoute(directionsForRoutesWithSegments)//alex
                                    .then(recommendedRoute => resolve(recommendedRoute))
                                    .catch(errRecommendedRoute => reject({error:"Error"}));
                                })
                                .catch(errDirectionsForRoutesWithSegments => reject({error:"Error"}));
                            })
                            .catch(errRoutesWithSegments => reject({error:"Error"}));
                        })
                        .catch(errPossibleRoutes => reject({error:"Error"}));
                    })
                    .catch(errSuiteblePlaces => reject({error:"Error"}));
                })
                .catch(errPolygon => reject({error:"Error"}));
        })
    };

    calcPolygon() {
        return new Promise((resolve, reject)=>{
            resolve([this.start_place.coordinate]);
        });
        
    }

    getSuiteblePlaces(){

    }

    saveRoute(){

    }
}