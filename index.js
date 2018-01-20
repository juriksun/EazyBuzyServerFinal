let taskPlaces = [];

let getPlacesForTaskInPoligonPoint = (task, poligonPoint, radius, callback)=>{

        const url = `https://maps.googleapis.com/maps/api/place/radarsearch/json?location=${poligonPoint.lat},${poligonPoint.lng}&radius=${radius}&type=${task.place.type}&keyword=${task.place.key_words[0]}&key=AIzaSyAkz6xddABYhnT-iPqJePo3MIsiy1kxE9Q&language=en`;
    axios
    .get(url)
    .then(response => {
        //console.log(response.data.results);
        callback(response.data.results);
    })
    .catch(error => {
        console.log(error);
    });
} 

let getPlacesForTasks = (places, poligonPoints, radius, callback)=>{
    
    for(let i = 0; i < poligonPoints.length; i++){
        for(let k = 0; k < places.length; k++){
            getPlacesForTaskInPoligonPoint(places[k], poligonPoints[i], radius, (response)=>{
                taskPlaces.push(response);
                if(i == poligonPoints.length -1 && k == places.length - 1){
                    callback(taskPlaces);
                }
            });
        }
    }
};

let calcPoligonsForSearch = (places, startPoint, endPoint, radius)=>{

    let firstDot = startPoint.coordinate;
    return [
        firstDot
    ];
};

let getTasksPlaces = (places, startPoint, endPoint, callback)=>{

    let poligonForDotsSearch = calcPoligonsForSearch(places, startPoint, endPoint, 10000);

    getPlacesForTasks(places, poligonForDotsSearch, 1200, (response)=>{
        callback(response);
    });
};

//Start program
const axios = require("axios");
let dataBase = require('./data_base');

let tasksWithPlaces = getTasksPlaces(dataBase.tasks, dataBase.start_place, dataBase.end_place, (data)=>{
    console.log(JSON.stringify(data));
});