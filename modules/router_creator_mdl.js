const       db              = require('../data_base'),
            googleApiMdl    = require('./google_api_mdl'),
            Combinatorics   = require('./combinatorics_mdl'),
            TasksController = require('./tasks_controller_mdl'),
            Polyline        = require('@mapbox/polyline'),
            DateTime        = require('./date_time_mdl'),
            GoogleAPIs      = googleApiMdl.GoogleAPIs;


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
        this.googleAPIs = new GoogleAPIs();
    }

    // determine all time sets of route
    setTimeWindow(time){

        this.startTime = time.start_time;
        this.endTime = time.end_time;
        this.date = time.date;
        // console.log(this.date);
        this.day = DateTime.convertDateToDay(this.date);
    }

    //set data of user
    setUser(user){
        this.user = user;
    }

    // Set tasks for route. It can be all tasks or selected tasks
    setTasks(tasks){
        // mast return promise because getAllTasks connet to DB
        return new Promise((resolve, reject) => {
            // if user send empty arr of tasks we will get all tasks
            if(tasks.legs === 0){
                this.tasksController.getAllTasks(this.user)
                .then( allTasks => {
                    this.userTasks = allTasks;
                    resolve(true);
                });
            } else {
                this.tasksController.getTasks(this.user, tasks)
                .then( userTasks => {

                    this.userTasks = userTasks;
                    resolve(true);
                });
            }
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
                        for (let k = 0; k < suiteblePlaces[i].places.length && k < 4; k++) {
                            let place = suiteblePlaces[i].places[k];
                            place.task_identifier = task_identifier;
                            task.push(place);
                        }
                        // for (let k = 0; k < suiteblePlaces[i].places.length; k++) {
                        //     let place = suiteblePlaces[i].places[k];
                        //     place.task_identifier = task_identifier;
                        //     task.push(place);
                        // }
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
                    .then((suiteblePlaces) => {
                        if(suiteblePlaces.length === 0){
                            resolve(
                                {
                                    recommended_route: undefined,
                                    all_routes: undefined,
                                    all_tasks: this.userTasks
                                }
                            );
                            return;
                        }
                        this.calcPossibleRoutes(suiteblePlaces.tasks,this.startPoint, this.endPoint)//alex
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
                            this.buildAllRoutesWithSegments(possibleRoutes)//alex
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
                                this.getAllDirectionForRoutesWithSegments(allRoutesWithSegments)//alex
                            
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

                                    this.chooseRecommendedRoute(directionsForRoutesWithSegments)
                                    .then((recommendedRoute) => {
                                        if(recommendedRoute.length === 0){
                                            resolve(
                                                {
                                                    recommended_route: undefined,
                                                    all_routes: undefined,
                                                    all_tasks: this.userTasks
                                                }
                                            );
                                            return;
                                        }
                                        resolve(
                                            {
                                                recommended_route: recommendedRoute,
                                                // recommended_route: directionsForRoutesWithSegments,
                                                all_routes: directionsForRoutesWithSegments,
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
                    let query = `${tasks[i].location.address} ${tasks[i].task_place.place_type.formated_name}  ${tasks[i].task_place.place_company.formated_name}`;
                    promises.push( googleApiMdl.googleGetPlacesByQuery(i, query));
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
                    if(allFullDadaPlace.length === 0){
                        resolve({
                            tasks: [],
                        });
                    }
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

   

    //need
    saveRoute(){

    }

    chooseRecommendedRoute(directionsForRoutesWithSegments){
        return new Promise((resolve, reject)=>{

            let recommendedRoute;

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

            recommendedRoute.tasks = [];
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
                   
                    if(waitTime === undefined){
                        resolve(undefined);
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


                route.segments.push(routeWithSegments[i]);
            }
            resolve(route);
        });
    }

    getAllDirectionForRoutesWithSegments(allRoutesWithSegments){
        return new Promise( (resolve, reject) => {
            Promise.all(
                allRoutesWithSegments.map(i => this.buildRouteWithSegmentsAndDerection(i))
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
}