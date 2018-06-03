const       db              = require('../data_base'),
            googleApiMdl    = require('./google_api_mdl'),
            Combinatorics   = require('./combinatorics_mdl'),
            TasksController = require('./tasks_controller_mdl'),
            Polyline        = require('@mapbox/polyline'),
            DateTime        = require('./date_time_mdl');


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

    // determine all time sets of route
    setTimeWindow(time){

        this.startTime = time.start_time;
        this.endTime = time.end_time;
        this.date = time.date;
        // console.log(this.date);
        this.day = DateTime.convertDateToDay(this.date);
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
        this.startPoint.task_identifier = { name : "Start" };
    }
    setTravelMode(travelMode){
        this.travelMode = travelMode;
    }
    //
    setEndPoint(endPoint){
        this.endPoint = endPoint;
        this.endPoint.task_identifier = { name : "End" };
    }

    //
    setTaskForSearchPath(allTasksForSearch){
        this.allTasksForSearch = allTasksForSearch
    }

    // filter places with open hour
    filterPlacesByTimeWindow(allFullDadaPlace, tasks){
        let suteblePlaces = [];
        for(let i = 0; i < allFullDadaPlace.length; i++){
            if(
                DateTime.checkPlaceInTimeWindow(
                    this.startTime, this.endTime, this.day,
                    allFullDadaPlace[i].response.opening_hours,
                    tasks[allFullDadaPlace[i].taskIndex].time.duration
                ) === 0
            ){
                // for debuging
                // console.log("In time window");
                // console.log(JSON.stringify(allFullDadaPlace[i]));

                suteblePlaces.push(allFullDadaPlace[i]);
            }
            //for debuging
             else {
                // console.log("Not in time window");
                // console.log(JSON.stringify(allFullDadaPlace[i]));
            }
        }
        return suteblePlaces;
    }

    // filter task with invariable time and date 
    filterTasksByTimeWindow(userTasks){
        let sutebleTasks = [];
        for(let i = 0; i < userTasks.length; i++){
            if(
                DateTime.checkTaskInTimeWindow(
                    this.startTime, this.endTime, 
                    userTasks[i].time.start_time,
                    userTasks[i].time.duration) 
                === 0
                && DateTime.compareDate(userTasks[i].time.date, this.date)
                === 0
            ){
                // for debuging
                // console.log("In time window");
                // console.log(JSON.stringify(userTasks[i]));

                sutebleTasks.push(userTasks[i]);
            }
            //for debuging
             else {
                // console.log("Not in time window");
                // console.log(JSON.stringify(userTasks[i]));
            }
        }
        return sutebleTasks;
    }

    //
    calcPossibleRoutes(suiteblePlaces, startPoint, endPoint) {
        return new Promise((resolve, reject) => {

                let tasksForPermutation = [];

                for (let i = 0; i < suiteblePlaces.length; i++) {
                    if(suiteblePlaces[i].places){
                        let task_identifier = {
                            name: suiteblePlaces[i].name,
                            status: suiteblePlaces[i].status,
                            time: suiteblePlaces[i].time,
                            priority: suiteblePlaces[i].priority,
                            task_place: suiteblePlaces[i].task_place,
                            location: suiteblePlaces[i].location
                        };
                        let task = [];
                        for (let k = 0; k < suiteblePlaces[i].places.length && k < 2; k++) {
                            let place = suiteblePlaces[i].places[k];
                            place.task_identifier = task_identifier;
                            task.push(place);
                        }
                        tasksForPermutation.push(task);
                    }
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
            this.calcPolygon()// need to develop
                .then((polygon) => {
                this.getSuiteblePlaces(polygon, this.filterTasksByTimeWindow(this.userTasks))// get all suitebale
                    // do next filter of open hours of places
                    .then((suiteblePlaces) => {
                        this.calcPossibleRoutes(suiteblePlaces.tasks,this.startPoint, this.endPoint)//alex
                        .then(possibleRoutes => {
                            this.buildAllRoutesWithSegments(possibleRoutes)//alex
                            .then(allRoutesWithSegments => {
                                this.getAllDirectionForRoutesWithSegments(allRoutesWithSegments)//alex
                            
                                .then(directionsForRoutesWithSegments => {
                                    //this.directionsForRoutesWithSegments = directionsForRoutesWithSegments

                                    // this.chooseRecommendedRoute(directionsForRoutesWithSegments)
                                    // .then((recommendedRoute) => {
                                        resolve(
                                            {
                                                
                                                
                                                // recommended_route: recommendedRoute,
                                                recommended_route: directionsForRoutesWithSegments,
                                                // all_routes: directionsForRoutesWithSegments,
                                                all_tasks: this.userTasks
                                            }
                                        );
                                    // })
                                    // .catch(errRecommendedRoute => reject({error:"Error RecommendedRoute" + errRecommendedRoute}));
                                })
                                .catch(errDirectionsForRoutesWithSegments => reject({error:"Error DirectionsForRoutesWithSegments" + errDirectionsForRoutesWithSegments}));
                            })
                            .catch(errRoutesWithSegments => reject({error:"Error RoutesWithSegments" + errRoutesWithSegments}));
                        })
                        .catch(errPossibleRoutes => reject({error:"Error PossibleRoutes" + errPossibleRoutes}));
                    })
                    .catch(errSuiteblePlaces => reject({error:"Error SuiteblePlaces" + errSuiteblePlaces}));
                })
                .catch(errPolygon => reject({error:"Error Polygon" + errPolygon}));
        })
    };

    calcPolygon() {      
        return new Promise((resolve, reject)=>{
            resolve([this.startPoint.geometry.location]);
        });
        
    }

    getFullData(data){  
      return googleApiMdl.googleGetPlaceData(data.taskIndex,data.place_id);
    }

    //get suteble places for all tasks
    getSuiteblePlaces(polygonPoints, tasks){
        return new Promise((resolve, reject)=>{
            let promises = [];
            let timeout = 0;

            for(let i = 0 ; i < tasks.length ; i++){
                //separating to place with addres and without
                if(tasks[i].location.address === ''){

                    //if the place without adress the plase is note concrete and must get all suteble plases for task in all poligon points
                    for(let k = 0 ; k < polygonPoints.length ; k ++){
                        promises.push( googleApiMdl.googleGetPlacesByRadius(i, tasks[i], polygonPoints[k], 1500,timeout));
                        timeout += 25 ;
                    }
                }else{
                    promises.push( googleApiMdl.googleGetPlacesByQuery(i , `${tasks[i].task_place.place_type.name !== '' ? '' : tasks[i].task_place.place_type.formated_name}  ${tasks[i].task_place.place_company.formated_name} ${tasks[i].location.address}`));
                }
            }

            // wait for all responses from googleGetPlacesByQuery & googleGetPlacesByRadius
            Promise.all(promises)
            .then((allData) => {
                // wait for all responses from googleGetPaceData
                Promise.all(allData.map( (dataArr) => {
                    return dataArr.response.map((data) => {
                        return googleApiMdl.googleGetPlaceData(dataArr.taskIndex, data.place_id);
                    });
                    // rerange object schem
                }).reduce((accumulator, currentValue) => {
                    return accumulator.concat(currentValue);
                }))
                .then((allFullDadaPlace) => {
                    allFullDadaPlace = this.filterPlacesByTimeWindow(allFullDadaPlace, tasks);
                    
                    // match all responses from googleGetPlaceData to proper task 
                    for (let i = 0; i < allFullDadaPlace.length; i++) {
                        (tasks[allFullDadaPlace[i].taskIndex].places) ?
                            tasks[allFullDadaPlace[i].taskIndex].places.push(allFullDadaPlace[i].response)
                            :tasks[allFullDadaPlace[i].taskIndex].places = [allFullDadaPlace[i].response];
                    }
                    resolve({
                        tasks: tasks,
                    });
                }).catch(err => {
                    console.log("error 999 - get place full data: ", err, "\n");
                });
            })
            .catch( err => {
                console.log("error 999 - getting map data:",err);
            });
        });
    }

    getAllDirectionForRoutesWithSegmentsLL(allRoutesWithSegments){
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
                        let sumOfDistance = 0;
                        for (let k = 0; k < allRoutesWithSegments[i].length; k++) {
                            allRoutesWithSegments[i][k].duration = allData[promisesIndex].routes[0].legs[0].duration.value;
                            allRoutesWithSegments[i][k].distance = allData[promisesIndex].routes[0].legs[0].distance.value;
                            // allRoutesWithSegments[i][k].steps = allData[promisesIndex].routes[0].legs[0].steps;
                            allRoutesWithSegments[i][k].polylines = Polyline.decode(allData[promisesIndex].routes[0].overview_polyline.points);
                            allRoutesWithSegments[i][k].travel_mode = allData[promisesIndex].routes[0].legs[0].distance.value;
                            sumOfDuration = sumOfDuration + allRoutesWithSegments[i][k].duration;

                            sumOfDistance = sumOfDistance + allRoutesWithSegments[i][k].distance;

                            promisesIndex++;
                        }
                        allRoutesWithSegmentsWithSums.push(
                            {
                                segments: allRoutesWithSegments[i],
                                num_of_segments: allRoutesWithSegments[i].length,
                                sum_of_durations: sumOfDuration,
                                sum_of_distance: sumOfDistance
                            }
                        );
                    }
                }
                resolve(allRoutesWithSegmentsWithSums);
            })
            .catch(error => {
                console.log(error)
            })
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

            recommendedRoute.tasks = [];
            for(let i = 0; i < recommendedRoute.segments.length; i++ ){
                let poliline = [];

                for(let k = 0; k < recommendedRoute.segments[i].polylines.length - 1; k++){
                    poliline.push({
                        start: {
                            lat: recommendedRoute.segments[i].polylines[k][0],
                            lng: recommendedRoute.segments[i].polylines[k][1]
                        },
                        end: {
                            lat: recommendedRoute.segments[i].polylines[k + 1][0],
                            lng: recommendedRoute.segments[i].polylines[k + 1][1]
                        }
                    });
                }
                recommendedRoute.segments[i].polylines = poliline;
                
                recommendedRoute.tasks.push({
                    name : recommendedRoute.segments[i].startPoint.task_identifier.name,
                    duration : Math.random()*10%15, // need to change
                    place : {
                        location : {
                            lat :  recommendedRoute.segments[i].startPoint.geometry.location.lat,
                            lng : recommendedRoute.segments[i].startPoint.geometry.location.lng
                        },
                        name : recommendedRoute.segments[i].startPoint.name,
                        id : recommendedRoute.segments[i].startPoint.place_id,
                        address : recommendedRoute.segments[i].startPoint.vicinity || recommendedRoute.segments[i].startPoint.address
                    }
                });


                if(i === recommendedRoute.segments.length - 1){
                    recommendedRoute.tasks.push({
                        name : recommendedRoute.segments[i].endPoint.task_identifier.name,
                        duration : Math.random()*10%15, // need to change
                        place : {
                            location : {
                                lat :  recommendedRoute.segments[i].endPoint.geometry.location.lat,
                                lng : recommendedRoute.segments[i].endPoint.geometry.location.lng
                            },
                            name : recommendedRoute.segments[i].endPoint.name,
                            id : recommendedRoute.segments[i].endPoint.place_id,
                            address : recommendedRoute.segments[i].endPoint.vicinity || recommendedRoute.segments[i].endPoint.address
                        }
                    });
                }
            }

            resolve(recommendedRoute);
        });
    }

    //need
    saveRoute(){

    }

    //********************new functions***************************//
    calcWaitTimeToOpenBeforeStart(point, routeCurrentTime){
        if(point.task_identifier.time.start_time !== "" ){
            return DateTime.compareHour(
                    routeCurrentTime,
                    point.task_identifier.time.start_time
                ) > 0 ?
                    undefined : DateTime.compareHour(
                        routeCurrentTime,
                        point.task_identifier.time.start_time
                    );
        }
        return DateTime.getNearestOpeningTime(
            routeCurrentTime, this.day, point.opening_hours,
            point.task_identifier.time.duration
        );
    }

    buildRouteWithSegmentsAndDerection(routeWithSegments){
        return new Promise(async (resolve, reject) => {
            let route = {
                route_tasks_number: routeWithSegments.length - 1,
                route_start_time: DateTime.convertTimeToMinutes(this.startTime),
                route_end_time: DateTime.convertTimeToMinutes(this.endTime),
                route_distance: 0,
                route_duration: 0,
                route_wait_time: 0,
                route_duration_in_road: 0,
                route_current_time: DateTime.convertTimeToMinutes(this.startTime),
                segments: []
            };

            for(let i = 0; i < routeWithSegments.length; i++){
                routeWithSegments[i].arriveTime = route.route_current_time;
                if(routeWithSegments[i].startPoint.task_identifier.name !== 'Start'
                ){
                    let waitTime = this.calcWaitTimeToOpenBeforeStart(routeWithSegments[i].startPoint, route.route_current_time);
                    console.log("---------------------------", waitTime);
                    if(waitTime === undefined){
                        resolve(null);
                        return;
                    }
                   
                    
                    route.route_wait_time += waitTime;
                    route.route_current_time += waitTime;
                    routeWithSegments[i].waitTime = waitTime;
                    routeWithSegments[i].duration = 
                        DateTime.convertTimeToMinutes(
                            (routeWithSegments[i].startPoint.task_identifier.time.duration === "")?
                            "00:15": routeWithSegments[i].startPoint.task_identifier.time.duration
                        );
                    
                } else {
                    routeWithSegments[i].duration = 0;
                    routeWithSegments[i].waitTime = 0;
                }

                route.route_duration += routeWithSegments[i].duration;
                route.route_duration += routeWithSegments[i].waitTime;
                route.route_current_time += routeWithSegments[i].duration;
                route.route_current_time += routeWithSegments[i].waitTime;
                let direction;
                // console.log("=================================", route.route_current_time);
                try{
                    direction = await googleApiMdl.googleGetDirection(
                        routeWithSegments[i].startPoint.place_id,
                        routeWithSegments[i].endPoint.place_id,
                        this.travelMode, DateTime.convertDateHourToMilliseconds(
                            this.date,
                            DateTime.convertMinutesToTime(route.route_current_time)
                        )
                    );
                } catch(error){
                    console.log(error);
                }

                routeWithSegments[i].duration_in_road = Math.round(direction.routes[0].legs[0].duration.value / 60);
                // console.log("++++++++++++++++++++++++++++", routeWithSegments[i].duration_in_road);
                routeWithSegments[i].distance = direction.routes[0].legs[0].distance.value;
                routeWithSegments[i].polilines = direction.routes[0].overview_polyline.points;

                route.route_duration += routeWithSegments[i].duration_in_road;
                route.route_current_time += routeWithSegments[i].duration_in_road;

                route.route_duration_in_road += routeWithSegments[i].duration_in_road;
                route.route_distance += routeWithSegments[i].distance;


                route.segments.push(routeWithSegments[i]);
            }
            resolve(route);
        });
    }

    getAllDirectionForRoutesWithSegments(allRoutesWithSegments){
        return new Promise((resolve, reject) => {
            Promise.all(
                allRoutesWithSegments.map(i => this.buildRouteWithSegmentsAndDerection(i))
            ).then((allData) => {
                resolve(allData);
            })

            // send route to build the and check the route

            // let sumOfRequers = 0;
            // let promises = [];
            // let allRoutesWithSegmentsWithSums = [];
            // let timeout = 0;
            // for (let i = 0; i < allRoutesWithSegments.length; i++) {
            //     for (let k = 0; k < allRoutesWithSegments[i].length; k++) {
            //         sumOfRequers++;
            //         promises.push(googleApiMdl.googleGetDirection(
            //             allRoutesWithSegments[i][k].startPoint.place_id,
            //             allRoutesWithSegments[i][k].endPoint.place_id,
            //             this.travelMode,
            //             timeout
            //         ));
            //         timeout+=25
            //     }
            // }
            //  let apiHandler = new ApiHandler()
            //  apiHandler.handleRequst(promises)
            // .then((allData) => {
            //     let promisesIndex = 0;
            //     while(promisesIndex < promises.length){
            //         for (let i = 0; i < allRoutesWithSegments.length; i++) {
            //             let sumOfDuration = 0;
            //             let sumOfDistance = 0;
            //             for (let k = 0; k < allRoutesWithSegments[i].length; k++) {
            //                 allRoutesWithSegments[i][k].duration = allData[promisesIndex].routes[0].legs[0].duration.value;
            //                 allRoutesWithSegments[i][k].distance = allData[promisesIndex].routes[0].legs[0].distance.value;
            //                 // allRoutesWithSegments[i][k].steps = allData[promisesIndex].routes[0].legs[0].steps;
            //                 allRoutesWithSegments[i][k].polylines = Polyline.decode(allData[promisesIndex].routes[0].overview_polyline.points);
            //                 allRoutesWithSegments[i][k].travel_mode = allData[promisesIndex].routes[0].legs[0].distance.value;
            //                 sumOfDuration = sumOfDuration + allRoutesWithSegments[i][k].duration;

            //                 sumOfDistance = sumOfDistance + allRoutesWithSegments[i][k].distance;

            //                 promisesIndex++;
            //             }
            //             allRoutesWithSegmentsWithSums.push(
            //                 {
            //                     segments: allRoutesWithSegments[i],
            //                     num_of_segments: allRoutesWithSegments[i].length,
            //                     sum_of_durations: sumOfDuration,
            //                     sum_of_distance: sumOfDistance
            //                 }
            //             );
            //         }
            //     }

            .catch(error => {
                console.log(error)
            })
        });
    }

}