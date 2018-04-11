'use strict';
require('./server');




// let createAllWays = (tasks) => {
//     function permutator(inputArr) {
//         let results = [];
//         function permute(arr, memo) {
//             var cur, memo = memo || [];
//             for (let i = 0; i < arr.length; i++) {
//                 cur = arr.splice(i, 1);
//                 if (arr.length === 0) {
//                     results.push(memo.concat(cur));
//                 }
//                 permute(arr.slice(), memo.concat(cur));
//                 arr.splice(i, 0, cur[0]);
//             }
//             return results;
//         }
//         return permute(inputArr);
//     }
//     let tasksForPermutation = [];

//     for(let i = 0; i < tasks.length; i++){
//         let task_indificator = {
//             "id": tasks[i].id,
//             "name": tasks[i].name
//         };
//         let task = [];
//         for(let k = 0; k < tasks[i].places.length; k++){
//             let place = tasks[i].places[k];
//             place.task_indificator = task_indificator;
//             task.push(place);
//         }
//         tasksForPermutation.push(task);
//     }

//     let permutationOfTasks = permutator(tasksForPermutation);

//     for(let i = 0; i < permutationOfTasks.length; i ++){
//         permutationOfTasks[i].unshift(dataBase.start_place);
//         permutationOfTasks[i].push(dataBase.end_place);
//     }

//     return getAllPermutation(permutationOfTasks);
// };

// let getAllPermutation = (permutationOfTasks, indexI = 0, indexK = 0)=>{

//     if(indexI + 1 === permutationOfTasks.length){
//          return [permutationOfTasks[indexI]];
//     }

//     if(permutationOfTasks[indexI].length === undefined){
//         return [permutationOfTasks[indexI]].concat(getAllPermutation(permutationOfTasks, indexI + 1, 0));
//     }

//     if(indexK < permutationOfTasks[indexI].length ){
//         return [permutationOfTasks[indexI][indexK]].concat(getAllPermutation(permutationOfTasks, indexI, indexK + 1));
//     }

//     return getAllPermutation(permutationOfTasks, indexI + 1, 0); 
// }



// let getPlacesForTaskInPoligonPoint = (task, poligonPoint, radius)=>new Promise((resolve, reject)=>{

//     const url = `https://maps.googleapis.com/maps/api/place/radarsearch/json?location=${poligonPoint.lat},${poligonPoint.lng}&radius=${radius}&type=${task.place.type}&keyword=${task.place.key_words[0]}&key=AIzaSyAkz6xddABYhnT-iPqJePo3MIsiy1kxE9Q&language=en`;
//     axios
//         .get(url)
//         .then(response => {
//             //console.log(response.data.results);
//             resolve(response.data.results);
//         })
//         .catch(error => {
//             console.log(error);
//         });
// }); 

// let getPlacesForTasks = (tasks, poligonPoints, radius)=>new Promise((resolve, reject)=>{
//     for (let i = 0; i < poligonPoints.length; i++) {
//         for (let k = 0; k < tasks.length; k++) {
//             getPlacesForTaskInPoligonPoint(tasks[k], poligonPoints[i], radius)
//             .then(response => {
//                 // tasks[k].places = tasks[k].places || [];
//                 tasks[k].places ? tasks[k].places.concat(tasks[k].places, response) : tasks[k].places = response;
//                 if (i === poligonPoints.length - 1 && k === tasks.length - 1) {
//                     resolve(true);
//                 }
//             });
//         }
//     }
// });

// let calcPolygonsForSearch = (places, startPoint, endPoint, radius)=>{

//     let firstDot = startPoint.coordinate;
//     return [
//         firstDot
//     ];
// };

// let getTasksPlaces = (places, startPoint, endPoint, callback)=>{

//     let poligonForDotsSearch = calcPoligonsForSearch(places, startPoint, endPoint, 10000);
//     getPlacesForTasks(places, poligonForDotsSearch, 2000)
//     .then( response =>{
//         callback(response);
//     });
// };

// //Start program
// // const   express     = require('express'),
// //         bodyParser  = require('body-parser'),
// //         app         = express(),
// //         port        = process.env.PORT || 80;


// const axios = require("axios");
// let dataBase = require('./data_base');

// // app.use(bodyParser.json());
// // app.use(bodyParser.urlencoded({ extended: true }));
// // app.set('port', port);
// // app.use('/', express.static('./public'));//for API
// // app.use((req, res, next) => {

// //     cw.putMetricData(paramss, function (err) {
// //         if (err) {
// //             console.log("Error", err);
// //         }
// //     });

// //     res.setHeader('Access-Control-Allow-Origin', '*');
// //     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
// //     res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
// //     //res.set('Content-Type', 'application/json');  //Dont need it, cause API contained in this WS
// //     next();
// // });


// // /*** All routes ***/
// // //app.get('/', (req, res) => { res.status(200).sendFile(__dirname + "/public/api.html") });
// // app.use('/test', ()=>{
// //     console.log("test");
// // });


// let tasksWithPlaces = getTasksPlaces(dataBase.tasks, dataBase.start_place, dataBase.end_place, (data)=>{
//     setTimeout(()=>{ 
//         console.log(JSON.stringify(createAllWays(dataBase.tasks)));
//     }, 2000);
//     //createAllWays(dataBase.tasks);
//     //console.log(JSON.stringify(dataBase.tasks));
// });