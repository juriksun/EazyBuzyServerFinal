let taskPlaces = [];
let createAllWays = ()=>{

};
const test = true;
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

let getPlacesForTasks = (tasks, poligonPoints, radius, callback)=>{

    for(let i = 0; i < poligonPoints.length; i++){
        for(let k = 0; k < tasks.length; k++){
            getPlacesForTaskInPoligonPoint(tasks[k], poligonPoints[i], radius, (response)=>{
                
                tasks[k].places ? tasks[k].places.concat(tasks[k].places , response) : tasks[k].places = response;

                //taskPlaces.push(response);
                if(i == poligonPoints.length -1 && k == tasks.length - 1){

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
    getPlacesForTasks(places, poligonForDotsSearch, 2000, (response)=>{
        callback(response);
    });
};

//Start program
const   express     = require('express'),
        bodyParser  = require('body-parser'),
        app         = express(),
        port        = process.env.PORT || 80;


const axios = require("axios");
let dataBase = require('./data_base');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', port);
app.use('/', express.static('./public'));//for API
app.use((req, res, next) => {

    cw.putMetricData(paramss, function (err) {
        if (err) {
            console.log("Error", err);
        }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    //res.set('Content-Type', 'application/json');  //Dont need it, cause API contained in this WS
    next();
});


/*** All routes ***/
//app.get('/', (req, res) => { res.status(200).sendFile(__dirname + "/public/api.html") });
app.use('/test', ()=>{
    console.log("test");
});

















let tasksWithPlaces = getTasksPlaces(dataBase.tasks, dataBase.start_place, dataBase.end_place, (data)=>{
    console.log(JSON.stringify(dataBase.tasks));
});
