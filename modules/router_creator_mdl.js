const       googleApiMdl    = require('./google_api_mdl'),
            // packege for combinatoric manipulations
            Combinatorics   = require('./combinatorics_mdl'),
            TasksController = require('./tasks_controller_mdl'),
            // packege for decoding polylines 
            Polyline        = require('@mapbox/polyline'),
            // static class for all necessary action with times formats
            DateTime        = require('./date_time_mdl'),
            GoogleAPIs      = googleApiMdl.GoogleAPIs;


/*
* This is a main class for calculating the new route.
* The main function of this class is a dispatch(). 
* It contain all steps of algorithm for create new route.
*/
module.exports = class {
    constructor(){
        this.tasksController = new TasksController()
        this.googleAPIs = new GoogleAPIs();
        this.MaxNumOfSegments = 0;
        this.startProcess = Date.now();
    }

    // determine all time sets of route
    setTimeWindow(time){
        this.startTime = time.start_time;
        this.endTime = time.end_time;
        this.date = time.date;
        this.day = DateTime.convertDateToDay(this.date);
    }

    //set data of user
    setUser(user){
        this.user = user;
    }

    // Set tasks for route. It can be all tasks or selected tasks
    setTasks(tasks){
        // must return promise because getAllTasks connet to DB
        return new Promise((resolve, reject) => {
            // if user send empty array of tasks we will get all tasks
            if(tasks.length === 0){
                this.tasksController.getAllTasks(this.user)
                .then( allTasks => {
                    this.userTasks = allTasks;
                    this.setAllTasksRouteStatus(this.userTasks, "places false");
                    resolve(true);
                });
            } else {
                this.tasksController.getTasks(this.user, tasks)
                .then( userTasks => {
                    this.userTasks = userTasks;
                    this.setAllTasksRouteStatus(this.userTasks, "places false");
                    resolve(true);
                });
            }
        });
    }

    // set start point of new route
    setStartPoint(startPoint){
        this.startPoint = startPoint;
        this.startPoint.task_identifier = { name : "Start" };
    }

    // set travel made of new route
    setTravelMode(travelMode){
        this.travelMode = travelMode;
    }

    // set end point of new route
    setEndPoint(endPoint){
        this.endPoint = endPoint;
        this.endPoint.task_identifier = { name : "End" };
    }

    // set array of tasks for new route
    setTaskForSearchPath(allTasksForSearch){
        this.allTasksForSearch = allTasksForSearch
    }

    // filter places by opening hours.
    // get all places and check the compapatibility with time window of the new route.
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
                suteblePlaces.push(allFullDadaPlace[i]);
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
                sutebleTasks.push(userTasks[i]);
            }
            else {
                this.setTasksRouteStatus(userTasks[i]._id, "time false");
            }
        }
        return sutebleTasks;
    }

    // generating all possible routes with combinatoric packege
    calcPossibleRoutes(suiteblePlaces, startPoint, endPoint) {
        return new Promise((resolve, reject) => {
                let tasksForPermutation = [];

                // entering task id to places
                for (let i = 0; i < suiteblePlaces.length; i++) {
                    if(suiteblePlaces[i].places){
                        let task_identifier = {
                            id: suiteblePlaces[i]._id,
                            name: suiteblePlaces[i].name,
                            status: suiteblePlaces[i].status,
                            time: suiteblePlaces[i].time,
                            priority: suiteblePlaces[i].priority,
                            task_place: suiteblePlaces[i].task_place,
                            location: suiteblePlaces[i].location
                        };
                        let task = [];
                        for (let k = 0; k < suiteblePlaces[i].places.length  && k < 5; k++) {
                            let place = {
                                "formatted_address": suiteblePlaces[i].places[k].formatted_address,
                                "geometry": suiteblePlaces[i].places[k].geometry,
                                "opening_hours": suiteblePlaces[i].places[k].opening_hours,
                                "place_id": suiteblePlaces[i].places[k].place_id,
                                "vicinity": suiteblePlaces[i].places[k].vicinity
                            };

                            place.task_identifier = task_identifier;
                            task.push(place);
                        }
                        tasksForPermutation.push(task);
                    }
                }


                // generate all passible routes
                let allPermutationAndCombianationOfTasks = Combinatorics.permutationCombination(tasksForPermutation).toArray();
                
                let allPermutationAndCombinationOfAllWays = [];
                for (let i = 0; i < allPermutationAndCombianationOfTasks.length; i++) {
                    allPermutationAndCombinationOfAllWays = allPermutationAndCombinationOfAllWays.concat(
                        Combinatorics.cartesianProduct(...allPermutationAndCombianationOfTasks[i]).toArray()
                    );
                }

                // add all routes the start and end points
                for (let i = 0; i < allPermutationAndCombinationOfAllWays.length; i++) {
                    allPermutationAndCombinationOfAllWays[i].unshift(startPoint);
                    allPermutationAndCombinationOfAllWays[i].push(endPoint);
                }
            resolve(allPermutationAndCombinationOfAllWays);
        });
    }

    // separating all tasks in all routes to segments (start point and end point of path for one task)
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

    // main function. contain of all steps for new route algorithm
    dispatch(){
        return new Promise((resolve, reject)=>{
            // creating anchor points for looking suitable places
            this.calcPolygon()
            .then((polygon) => {
                // get suitable places for executing tasks
                this.getSuiteblePlaces(polygon, this.filterTasksByTimeWindow(this.userTasks))
                .then((suiteblePlaces) => {
                    if(suiteblePlaces.tasks.length === 0){
                        resolve(
                            {
                                recommended_route: undefined,
                                all_routes: undefined,
                                all_tasks: this.userTasks
                            }
                        );
                        return;
                    }
                    // calculating all possible routes
                    this.calcPossibleRoutes(suiteblePlaces.tasks, this.startPoint, this.endPoint)
                    .then(possibleRoutes => {
                        if(possibleRoutes.length === 0){
                            resolve(
                                {
                                    recommended_route: undefined,
                                    all_routes: undefined,
                                    all_tasks: this.userTasks
                                }
                            );
                            return;
                        }
                        // separating all tasks in all routes to segments
                        this.buildAllRoutesWithSegments(possibleRoutes)
                        .then(allRoutesWithSegments => {
                            if(allRoutesWithSegments.length === 0){
                                resolve(
                                    {
                                        recommended_route: undefined,
                                        all_routes: undefined,
                                        all_tasks: this.userTasks
                                    }
                                );
                                return;
                            }
                            allRoutesWithSegments = this.sortByAirDistanceNumOfSegments(allRoutesWithSegments);
                            // add for all segments direction from google direction API 
                            this.getAllDirectionForRoutesWithSegments(allRoutesWithSegments)
                            .then(directionsForRoutesWithSegments => {
                                if(directionsForRoutesWithSegments.length === 0){
                                    resolve(
                                        {
                                            recommended_route: undefined,
                                            all_routes: undefined,
                                            all_tasks: this.userTasks
                                        }
                                    );
                                     return;
                                }
                                this.directionsForRoutesWithSegments = directionsForRoutesWithSegments
                                this.setAllTasksRouteStatusInRoutes(this.directionsForRoutesWithSegments, "route false");
                                // choose recomendet route
                                this.chooseRecommendedRoute(directionsForRoutesWithSegments)
                                .then((recommendedRoute) => {
                                    if(recommendedRoute.length === 0){
                                        resolve(
                                            {
                                                recommended_route: undefined,
                                                all_tasks: this.userTasks
                                            }
                                        );
                                        return;
                                    }
                                    this.setAllTasksRouteStatusInRoutes([recommendedRoute], "route true");
                                    resolve(
                                        {
                                            recommended_route: recommendedRoute,
                                            all_tasks: this.userTasks
                                        }
                                    );
                                })
                                .catch(errRecommendedRoute => reject({error:"Error RecommendedRoute" + errRecommendedRoute}));
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

    // function for determine anchor points for looking suitable places
    calcPolygon() {      
        return new Promise((resolve, reject)=>{
            let poligonDots = [];

            poligonDots.push(this.startPoint.geometry.location);
            poligonDots.push(this.endPoint.geometry.location);
            
            for(let i = 0; i < this.userTasks.length; i++){

                if(this.userTasks[i].location.geometry){
                    this.checkAndSetPuligonDot(poligonDots, this.userTasks[i].location.geometry.location);
                }
                
            }
            resolve(poligonDots);
        });
    }

    // setting anchor points
    checkAndSetPuligonDot(poligonDots, dot){
        let i = 0;
        if(dot.lat === 0 || dot.lng === 0){
            return;
        }
        for(; i < poligonDots.length; i++){
            if(poligonDots[0].lat === dot.lat && poligonDots[0].lng === dot.lng){
                break;
            }
        }
        if(i === poligonDots.length){
            poligonDots.push(dot);
        }
    }

    // get suteble places for all tasks
    getSuiteblePlaces(polygonPoints, tasks){
        return new Promise((resolve, reject)=>{

            let promises = [];
            let timeout = 0;

            if(tasks.length === 0){
                resolve({
                    tasks: [],
                });
                return;
            }

            for(let i = 0 ; i < tasks.length ; i++){
                // separating to place with address and without
                if(tasks[i].location.address === ''){

                    // if the place without address - the place is not concrete and must get all suitable places for task in all polygon points
                    for(let k = 0 ; k < polygonPoints.length ; k ++){
                        
                        promises.push( this.googleAPIs.googleGetPlacesByRadius(i, tasks[i], polygonPoints[k], 1500));
                    }
                }else{
                    let query = `${tasks[i].location.address} ${tasks[i].task_place.place_type.formated_name}  ${tasks[i].task_place.place_company.formated_name}`;
                    promises.push( this.googleAPIs.googleGetPlacesByQuery(i, query));
                }
            }

            // wait for all responses from googleGetPlacesByQuery & googleGetPlacesByRadius
            Promise.all(promises)
            .then((allData) => {
                // wait for all responses from googleGetPaceData
                Promise.all(allData.map( (dataArr) => {
                    return dataArr.response.map((data) => {
                        return this.googleAPIs.googleGetPlaceData(dataArr.taskIndex, data.place_id);
                    });
                }).reduce((accumulator, currentValue) => {
                    return accumulator.concat(currentValue);
                }))
                .then((allFullDadaPlace) => {
                    if(allFullDadaPlace.length === 0){
                        resolve({
                            tasks: [],
                        });
                        return;
                    }

                    for (let i = 0; i < allFullDadaPlace.length; i++) {
                        if(tasks[allFullDadaPlace[i].taskIndex].places){
                            let k = 0; 
                            for( ; k < tasks[allFullDadaPlace[i].taskIndex].places.length; k++){
                                if(
                                    tasks[allFullDadaPlace[i].taskIndex].places[k].place_id ===
                                    allFullDadaPlace[i].response.place_id
                                ){
                                    break;
                                }
                            }
                            if(k === tasks[allFullDadaPlace[i].taskIndex].places.length){
                                tasks[allFullDadaPlace[i].taskIndex].places.push(allFullDadaPlace[i].response);
                            }
                        } else {
                            tasks[allFullDadaPlace[i].taskIndex].places = [allFullDadaPlace[i].response];
                        }
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

    // function for choosing recommended route
    chooseRecommendedRoute(directionsForRoutesWithSegments){
        return new Promise((resolve, reject)=>{

            let recommendedRoute;

            // choose best route by number of segments and duration
            for (let i = 0; i < directionsForRoutesWithSegments.length; i++) {
                
                recommendedRoute || (recommendedRoute = directionsForRoutesWithSegments[i]);

                if(
                    recommendedRoute.route_tasks_number < directionsForRoutesWithSegments[i].route_tasks_number
                    ||
                    recommendedRoute.route_tasks_number === 
                    directionsForRoutesWithSegments[i].route_tasks_number 
                    &&
                    recommendedRoute.route_duration / recommendedRoute.route_tasks_number >
                    directionsForRoutesWithSegments[i].route_duration / directionsForRoutesWithSegments[i].route_tasks_number
                ){
                    recommendedRoute = directionsForRoutesWithSegments[i];
                }
            }

            // add aditional fields for recomended route
            recommendedRoute.tasks = [];
            recommendedRoute.date = this.date;
            for(let i = 0; i < recommendedRoute.segments.length; i++ ){
                let poliline = [];
                let  polilineArr = Polyline.decode(recommendedRoute.segments[i].polilines);
                
                for(let k = 0; k < polilineArr.length - 1; k++){
                   
                    poliline.push({
                        start: {
                            lat: polilineArr[k][0],
                            lng: polilineArr[k][1]
                        },
                        end: {
                            lat: polilineArr[k + 1][0],
                            lng: polilineArr[k + 1][1]
                        }
                    });
                }
                recommendedRoute.segments[i].polylines = poliline;
                
                recommendedRoute.tasks.push({
                    name : recommendedRoute.segments[i].startPoint.task_identifier.name,
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

    // calculating the early opening hours
    calcWaitTimeToOpenBeforeStart(point, routeCurrentTime){
        if(point.task_identifier.time.start_time !== "" ){
            
            return DateTime.compareHour(
                    point.task_identifier.time.start_time,
                    routeCurrentTime
                ) < 0 ?
                    undefined : DateTime.compareHour(
                        point.task_identifier.time.start_time,
                        routeCurrentTime
                    );
        }

        return DateTime.getNearestOpeningTime(
            routeCurrentTime, this.day, point.opening_hours,
            point.task_identifier.time.duration
        );
    }

    // function for add for all segments direction from google direction API 
    buildRouteWithSegmentsAndDerection(routeWithSegments, startHour){
        return new Promise(async (resolve, reject) => {
            let route = {
                route_tasks_number: routeWithSegments.length - 1,
                route_start_time: startHour,
                route_end_time: DateTime.convertTimeToMinutes(this.endTime),
                route_distance: 0,
                route_duration: 0,
                route_wait_time: 0,
                route_duration_in_road: 0,
                route_current_time: startHour,
                segments: []
            };

            for(let i = 0; i < routeWithSegments.length; i++){
                routeWithSegments[i].arriveTime = route.route_current_time;
                if(routeWithSegments[i].startPoint.task_identifier.name !== 'Start'
                ){
                    let waitTime = this.calcWaitTimeToOpenBeforeStart(routeWithSegments[i].startPoint, route.route_current_time);
                
                    if(waitTime === undefined){
                        resolve(undefined);
                        return;
                    }
                      
                    route.route_wait_time += waitTime;
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
                try{
                    direction = await this.googleAPIs.googleGetDirection(
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
                routeWithSegments[i].distance = direction.routes[0].legs[0].distance.value;
                routeWithSegments[i].polilines = direction.routes[0].overview_polyline.points;

                route.route_duration += routeWithSegments[i].duration_in_road;
                route.route_current_time += routeWithSegments[i].duration_in_road;
                
                route.route_duration_in_road += routeWithSegments[i].duration_in_road;
                route.route_distance += routeWithSegments[i].distance;

                if(route.route_current_time > DateTime.convertTimeToMinutes(this.endTime)){
                    resolve(undefined);
                    return;
                }
                if(this.BestDutarion !== undefined && this.BestDutarion <= route.route_duration){
                    resolve(undefined);
                    return;
                }
                route.segments.push(routeWithSegments[i]);
            }

            this.MaxNumOfSegments = routeWithSegments.length;

            if(this.BestDutarion === undefined || this.BestDutarion >= route.route_duration){
                this.BestDutarion = route.route_duration;
            }
            resolve(route);
        });
    }

    // get directions for all routes 
    getAllDirectionForRoutesWithSegments(allRoutesWithSegments){
        return new Promise( async (resolve, reject) => {   
            let poromises = [];
            for(let i = allRoutesWithSegments.length - 1; 0 <= i && allRoutesWithSegments.length - i; i--){
                let startHour = DateTime.convertTimeToMinutes(this.startTime);
                if(this.MaxNumOfSegments === undefined || this.MaxNumOfSegments <= allRoutesWithSegments[i].length){
                    while(startHour < DateTime.convertTimeToMinutes(this.endTime) && Date.now() - this.startProcess < 25000){
                        
                        let route = JSON.parse(JSON.stringify(allRoutesWithSegments[i]));
                        let routeWithDirections = await this.buildRouteWithSegmentsAndDerection(
                            route, startHour
                        );
                        poromises.push(routeWithDirections);
                        startHour += 120; 
                    }
                }
            }

            Promise.all(
                poromises
            ).then((allData) => {
                let routesWithSegmentsAndDirections = [];
                for(let i = 0; i < allData.length; i++){
                    if(allData[i] !== undefined){
                        routesWithSegmentsAndDirections.push(allData[i]);
                    }
                }
                resolve(routesWithSegmentsAndDirections);
            })
            .catch(error => {
                console.log(error)
            })
        });
    }

    // check which tasks are included in route 
    setAllTasksRouteStatusInRoutes(route, status){
        for(let i = 0; i < route.length; i++){
            for(let k = 0; k < route[i].segments.length; k++){
                if(route[i].segments[k].endPoint.task_identifier 
                && route[i].segments[k].endPoint.task_identifier.id){
                    this.setTasksRouteStatus(
                        route[i].segments[k].endPoint.task_identifier.id,
                        status
                    );
                }
            }
        }
    }

    // check which task are included in route 
    setAllTasksRouteStatus(tasks, status){
        for(let i = 0; i < tasks.length; i++){
            tasks[i].route_status = status;
        }
    }

    // check which task are included in route 
    setTasksRouteStatus(taskId, status){
        for(let i = 0; i < this.userTasks.length; i++){
            if(this.userTasks[i]._id == taskId){
                this.userTasks[i].route_status = status;
                return;
            }
        }
    }

    // sort all routes by direct distance
    sortByAirDistanceNumOfSegments(allRauteWithSegments){
        const MAX_NUM_OF_REQUESTS = 100.0;

        let sortByAirDistance = (route1, route2) => {
            return (
                calcSumOfAirDistance(route1) -
                calcSumOfAirDistance(route2)
            ); 
        };

        // calculating direct distance between points
        let calcSumOfAirDistance = (route) => {

            let calcAirDistance = (point1, point2) => {
                let radlat1     = Math.PI * point1.geometry.location.lat/180,
                    radlat2     = Math.PI * point2.geometry.location.lat/180;
                
                let theta = point1.geometry.location.lng -
                    point2.geometry.location.lng;
    
                let radtheta = Math.PI * theta/180;
    
                let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                if (dist > 1) {
                    dist = 1;
                }
                dist = Math.acos(dist);
                dist = dist * 180/Math.PI;
                dist = dist * 60 * 1.1515;
                dist = dist * 0.8684;

                return dist;
            };

            let sumOfAirDistances = 0;
            for(let i = 0; i < route.length; i++){
                sumOfAirDistances += calcAirDistance(route[i].startPoint, route[i].endPoint);
            }
            return sumOfAirDistances;
        };


        let routesByNumOfSegments = [];

        for(let i = 0; i < allRauteWithSegments.length; i++){
            if(!routesByNumOfSegments[allRauteWithSegments[i].length - 2]){
                routesByNumOfSegments[allRauteWithSegments[i].length - 2] =
                    [allRauteWithSegments[i]];
            } else {
                routesByNumOfSegments[allRauteWithSegments[i].length - 2]
                .push(allRauteWithSegments[i]);
            }
        }

        let pieceOfNum = 0;

        for(let i = 0; i < routesByNumOfSegments.length; i++){
            routesByNumOfSegments[i] = routesByNumOfSegments[i].sort(sortByAirDistance);
            pieceOfNum += Math.pow((i + 2), 3);
            
        }

        pieceOfNum = MAX_NUM_OF_REQUESTS/pieceOfNum;
        allRauteWithSegments = [];

        for(let i = 0; i < routesByNumOfSegments.length; i++){
            allRauteWithSegments = allRauteWithSegments.concat(routesByNumOfSegments[i].slice(0, ~~(pieceOfNum * Math.pow((i + 2), 3)) + 1).reverse());
        }
        return allRauteWithSegments;
    }
}