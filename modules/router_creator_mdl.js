const       db              = require('../data_base'),
            googleApiMdl    = require('./google_api_mdl'),
            Combinatorics   = require('./combinatorics_mdl'),
            TasksController = require('./tasks_controller_mdl'),
            Polyline        = require('@mapbox/polyline');
//        UserMod         = require('../models/user_mod');

class ApiHandler{
    constructor(){
        this.temp = 0;
    }

    handleRequst(promisesList,requstTemp){
        return new Promise( (resolve,reject) => {
            Promise.all(promisesList)
            .then( data => {
                resolve(data);
            })
            .catch( error => {
                if(this.temp < 3){
                    this.temp++;
                    this.handleRequst(promisesList)
                }
                else{
                    this.temp = 0;
                    reject({error : error})
                }
            })
        })
    }
}

let apiHandleRequst = (promisesList,requstTemp) => {
    return new Promise( (resolve,reject) => {
        
        Promise.all(promisesList)
        .then( data => {
            resolve(data);
        })
        .catch( error => {
            if(requstTemp === 2) reject( {error : error})
            else  {
                console.log(requstTemp+1)
                apiHandleRequst(promisesList,requstTemp+1)
                .then( dataTemp => {
                    resolve(dataTemp)
                })
            }
        })
        
    })
    
}

module.exports = class {
    //no now
    constructor(){
        this.tasksController = new TasksController()
    }

    //not for alpha
    setTimeWindow(){
    
    }

    setUser(user){
        return new Promise((resolve, reject)=>{
            //get all data with tasks from db
            this.user = user;
            this.tasksController.getAllTasks(user)
            .then( allTasks => {
                // this.userTasks = db.tasks; // local DB
                this.userTasks = allTasks;
                resolve(true);
            })
        });
    }

    //
    setStartPoint(startPoint){
        this.startPoint = startPoint;
    }
    setTravelMode(travelMode){
        this.travelMode = travelMode;
    }
    //
    setEndPoint(endPoint){
        this.endPoint = endPoint;
    }

    //
    setTaskForSearchPath(allTasksForSearch){
        this.allTasksForSearch = allTasksForSearch
    }
    //not for alpha
    filterByTime(){

    }

    calcPossibleRoutes(suiteblePlaces, startPoint, endPoint) {
        return new Promise((resolve, reject) => {

                let tasksForPermutation = [];

                for (let i = 0; i < suiteblePlaces.length; i++) {
                    let task_identifier = {
                        "id": suiteblePlaces[i].id,
                        "name": suiteblePlaces[i].name
                    };
                    let task = [];
                    for (let k = 0; k < suiteblePlaces[i].places.length && k < 4; k++) {
                        let place = suiteblePlaces[i].places[k];
                        place.task_identifier = task_identifier;
                        task.push(place);
                    }
                    tasksForPermutation.push(task);
                }

                let allPermutationAndCombianationOfTasks = Combinatorics.permutationCombination(tasksForPermutation).toArray();
                
                let allPermutationAndCombinationOfAllWays = [];
                for (let i = 0; i < allPermutationAndCombianationOfTasks.length; i++) {
                    allPermutationAndCombinationOfAllWays = allPermutationAndCombinationOfAllWays.concat(
                        Combinatorics.cartesianProduct(...allPermutationAndCombianationOfTasks[i]).toArray()
                    );
                }

                for (let i = 0; i < allPermutationAndCombinationOfAllWays.length; i++) {
                    allPermutationAndCombinationOfAllWays[i].unshift(startPoint);
                    allPermutationAndCombinationOfAllWays[i].push(endPoint);
                }

                
            resolve(allPermutationAndCombinationOfAllWays);
        });
    }

    buildAllRoutesWithSegments(possibleRoutes){
        return new Promise((resolve, reject) => {
            let allRoutsWithSegments = [];
                for(let i = 0; i < possibleRoutes.length; i++){
                    let segments = [];
                    for(let k = 0; k < possibleRoutes[i].length - 1; k++){
                        let segment = {
                            startPoint: possibleRoutes[i][k],
                            endPoint: possibleRoutes[i][k + 1]
                        }
                        segments.push(segment);
                    }
                    allRoutsWithSegments.push(segments);
                }
            resolve(allRoutsWithSegments);
        });
    }
    //
    dispatch(){
        return new Promise((resolve, reject)=>{
            this.calcPolygon()
                .then((polygon) => {
                this.getSuiteblePlaces(polygon, this.userTasks)//alex
                    .then((suiteblePlaces) => {
                        this.calcPossibleRoutes(suiteblePlaces.tasks,this.startPoint, this.endPoint)//alex
                        .then(possibleRoutes => {
                            this.buildAllRoutesWithSegments(possibleRoutes)//alex
                            .then(allRoutesWithSegments => {
                                this.getAllDirectionForRoutesWithSegments(allRoutesWithSegments)//alex
                                .then(directionsForRoutesWithSegments => {
                                    //this.directionsForRoutesWithSegments = directionsForRoutesWithSegments
                                    this.chooseRecommendedRoute(directionsForRoutesWithSegments)
                                    .then((recommendedRoute) => {
                                        resolve(
                                            {
                                                recommended_route: recommendedRoute,
                                                // all_routes: directionsForRoutesWithSegments,
                                                all_tasks: this.userTasks
                                            }
                                        );
                                    })
                                    .catch(errRecommendedRoute => reject({error:"Error RecommendedRoute"}));
                                })
                                .catch(errDirectionsForRoutesWithSegments => reject({error:"Error DirectionsForRoutesWithSegments"}));
                            })
                            .catch(errRoutesWithSegments => reject({error:"Error RoutesWithSegments"}));
                        })
                        .catch(errPossibleRoutes => reject({error:"Error PossibleRoutes"}));
                    })
                    .catch(errSuiteblePlaces => reject({error:"Error SuiteblePlaces"}));
                })
                .catch(errPolygon => reject({error:"Error Polygon"}));
        })
    };

    calcPolygon() {      
        return new Promise((resolve, reject)=>{
            resolve([this.startPoint.geometry.location]);
        });
        
    }

    getSuiteblePlaces(polygonPoints, tasks){
        return new Promise((resolve, reject)=>{
            let promises = [];
            let timeout = 0
            for (let i = 0; i < polygonPoints.length; i++) {
                for (let k = 0; k < tasks.length; k++) {
                    promises.push( googleApiMdl.googleGetPlacesByRadius(k, tasks[k], polygonPoints[i], 1500,timeout));
                    timeout += 25 ;
                }
            }

            Promise.all(promises)
            .then((allData) => {
                //console.log(allData);
                for (let i = 0; i < allData.length; i++) {
                    tasks[allData[i].taskIndex].places ?
                        tasks[allData[i].taskIndex].places.concat(tasks[allData[i].taskIndex].places, allData[i].response):
                        tasks[allData[i].taskIndex].places = allData[i].response;
                }
                resolve({
                    tasks: tasks,
                });
            });
        });
    }

    getAllDirectionForRoutesWithSegments(allRoutesWithSegments){
        return new Promise((resolve, reject)=>{
            let sumOfRequers = 0;
            let promises = [];
            let allRoutesWithSegmentsWithSums = [];
            let timeout = 0;
            for (let i = 0; i < allRoutesWithSegments.length; i++) {
                for (let k = 0; k < allRoutesWithSegments[i].length; k++) {
                    sumOfRequers++;
                    promises.push(googleApiMdl.googleGetDirection(
                        allRoutesWithSegments[i][k].startPoint.place_id,
                        allRoutesWithSegments[i][k].endPoint.place_id,
                        this.travelMode,
                        timeout
                    ));
                    timeout+=25
                }
            }
             let apiHandler = new ApiHandler()
             apiHandler.handleRequst(promises)
            .then((allData) => {
                let promisesIndex = 0;
                while(promisesIndex < promises.length){
                    for (let i = 0; i < allRoutesWithSegments.length; i++) {
                        let sumOfDuration = 0;
                        for (let k = 0; k < allRoutesWithSegments[i].length; k++) {
                            allRoutesWithSegments[i][k].duration = allData[promisesIndex].routes[0].legs[0].duration.value;
                            // allRoutesWithSegments[i][k].steps = allData[promisesIndex].routes[0].legs[0].steps;
                            allRoutesWithSegments[i][k].steps_polyline = allData[promisesIndex].routes[0].overview_polyline
                            .points;

                            sumOfDuration = sumOfDuration + allRoutesWithSegments[i][k].duration;

                            promisesIndex++;
                        }
                        allRoutesWithSegmentsWithSums.push(
                            {
                                segments: allRoutesWithSegments[i],
                                num_of_segments: allRoutesWithSegments[i].length,
                                sum_of_durations: sumOfDuration
                            }
                        );
                    }
                }
                resolve(allRoutesWithSegmentsWithSums);
            })
            .catch(error => {
                console.log(error)
            })
            // Promise.all(promises)
            // .then((allData) => {
            //     let promisesIndex = 0;
            //     while(promisesIndex < promises.length){
            //         for (let i = 0; i < allRoutesWithSegments.length; i++) {
            //             let sumOfDuration = 0;
            //             for (let k = 0; k < allRoutesWithSegments[i].length; k++) {
            //                 allRoutesWithSegments[i][k].duration = allData[promisesIndex].routes[0].legs[0].duration.value;
            //                 sumOfDuration = sumOfDuration + allRoutesWithSegments[i][k].duration;
            //                 promisesIndex++;
            //             }
            //             allRoutesWithSegmentsWithSums.push(
            //                 {
            //                     route: allRoutesWithSegments[i],
            //                     num_of_segments: allRoutesWithSegments[i].length,
            //                     sum_of_durations: sumOfDuration
            //                 }
            //             );
            //         }
            //     }
            //     resolve(allRoutesWithSegmentsWithSums);
            // })
            // .catch(error => {
            //     console.log(error)
            // })
        });
    }

    chooseRecommendedRoute(directionsForRoutesWithSegments){
        return new Promise((resolve, reject)=>{
            let recommendedRoute = directionsForRoutesWithSegments[0];
            for (let i = 1; i < directionsForRoutesWithSegments.length; i++) {
                if(
                    recommendedRoute.num_of_segments < directionsForRoutesWithSegments[i].num_of_segments ||
                    recommendedRoute.num_of_segments === directionsForRoutesWithSegments[i].num_of_segments &&
                    recommendedRoute.sum_of_durations > directionsForRoutesWithSegments[i].sum_of_durations
                ){
                    recommendedRoute = directionsForRoutesWithSegments[i];
                }
            }

            recommendedRoute.polylins = [];
            recommendedRoute.markers = [];
            for(let i = 0; i < recommendedRoute.segments.length; i++ ){

                recommendedRoute.markers.push(
                    [
                        recommendedRoute.segments[i].startPoint.geometry.location.lat,
                        recommendedRoute.segments[i].startPoint.geometry.location.lng,
                    ]
                );

                if(i === recommendedRoute.segments.length - 1){
                    recommendedRoute.markers.push(
                        [
                            recommendedRoute.segments[i].endPoint.geometry.location.lat,
                            recommendedRoute.segments[i].endPoint.geometry.location.lng,
                        ]
                    );
                }

                recommendedRoute.polylins = recommendedRoute.polylins.concat(Polyline.decode(recommendedRoute.segments[i].steps_polyline));

            }

            resolve(recommendedRoute);
        });
    }

    saveRoute(){

    }
}