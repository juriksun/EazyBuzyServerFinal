let     db              = require('../data_base');
const   googleApiMdl    = require('./google_api_mdl');
let     Combinatorics   = require('./combinatorics_mdl'); 
module.exports = class {
    //no now
    constructor(){
        
    }

    //not for alpha
    setTimeWindow(){
    
    }

    setUser(userId){
        return new Promise((resolve, reject)=>{
            //get all data with tasks from db
            this.userTasks = db.tasks;
            resolve(3);
        });
    }

    //
    setStartPoint(startPoint){
        this.startPoint = JSON.parse(startPoint);
    }

    //
    setEndPoint(endPoint){
        this.endPoint = JSON.parse(endPoint);
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
                    let task_indificator = {
                        "id": suiteblePlaces[i].id,
                        "name": suiteblePlaces[i].name
                    };
                    let task = [];
                    for (let k = 0; k < suiteblePlaces[i].places.length && k < 6; k++) {
                        let place = suiteblePlaces[i].places[k];
                        place.task_indificator = task_indificator;
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
                    let route = [];
                    for(let k = 0; k < possibleRoutes[i].length - 1; k++){
                        let segment = {
                            startPoint: possibleRoutes[i][k],
                            endPoint: possibleRoutes[i][k + 1],
                        }
                        route.push(segment);
                    }
                    allRoutsWithSegments.push(route);
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
                                                all_routes: directionsForRoutesWithSegments,
                                                all_tasks: this.userTasks
                                            }
                                        );
                                    })
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
            resolve([this.startPoint.coordinate]);
        });
        
    }

    getSuiteblePlaces(polygonPoints, tasks){
        return new Promise((resolve, reject)=>{
            let promises = [];
        
            for (let i = 0; i < polygonPoints.length; i++) {
                for (let k = 0; k < tasks.length; k++) {
                    promises.push(googleApiMdl.googleGetPlacesByRadius(k, tasks[k], polygonPoints[i], 1200));
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
            for (let i = 0; i < allRoutesWithSegments.length; i++) {
                for (let k = 0; k < allRoutesWithSegments[i].length; k++) {
                    sumOfRequers++;
                    promises.push(googleApiMdl.googleGetDirection(
                        allRoutesWithSegments[i][k].startPoint.place_id,
                        allRoutesWithSegments[i][k].endPoint.place_id,
                        'walking'
                    ));
                }
            }
            console.log(sumOfRequers);
            Promise.all(promises)
            .then((allData) => {
                let promisesIndex = 0;
                while(promisesIndex < promises.length){
                    for (let i = 0; i < allRoutesWithSegments.length; i++) {
                        let sumOfDuration = 0;
                        for (let k = 0; k < allRoutesWithSegments[i].length; k++) {
                            allRoutesWithSegments[i][k].duration = allData[promisesIndex].routes[0].legs[0].duration.value;
                            sumOfDuration = sumOfDuration + allRoutesWithSegments[i][k].duration;
                            promisesIndex++;
                        }
                        allRoutesWithSegmentsWithSums.push(
                            {
                                route: allRoutesWithSegments[i],
                                num_of_segments: allRoutesWithSegments[i].length,
                                sum_of_durations: sumOfDuration
                            }
                        );
                    }
                }
                resolve(allRoutesWithSegmentsWithSums);
            });
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
            resolve(recommendedRoute);
        });
    }

    saveRoute(){

    }
}