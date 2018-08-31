/*
* Shenkar College of Engineering and Design.
* Department of Software Engineering
* EazyBuzy - Software Engineering B.Sc. Final Project 2018
*   Created by:
*       Shamir Krizler
*       Nir Mekin
*       Alexander Djura
*
*   Supervisor:
*       Dr. Michael Kiperberg
*/

'use strict';
const axios         = require("axios"),
      consts        = require("../consts"),
      DateTime      = require('./date_time_mdl');

// low db packege for save 
const   low         = require('lowdb'),
        FileSync    = require('lowdb/adapters/FileSync');

/*
* class for manage and regulate all request for google APIs
* all responses saving in local data base
* the next request checked in local DB
* this model allowing to reduce the time and date of requests
*/

module.exports.GoogleAPIs = class{

    // the constructor create for all APIs special scheme in local database
    constructor(){
        this.numOfDirectionRequest = 0;
        this.directionsDB = low(new FileSync('google_cache/directions_db.json'));
 
        this.numOfPlacesByRadius = 0;
        this.placesByRadiusDB = low(new FileSync('google_cache/places_by_radius.json'));

        this.numOfPlacesByQuery = 0;
        this.placesByQueryDB = low(new FileSync('google_cache/places_by_query.json'));

        this.numOfPlaceData = 0;
        this.placeDataDB = low(new FileSync('google_cache/places_data.json'));

        this.apiKeyArrIndex = 0;
    }
    
    // just for free version of APIs Keys
    getApiKey(){
        switch(this.apiKeyArrIndex){
            case 0: {
                this.apiKeyArrIndex++;
                return consts.GOOGLE_API_NIR;
            }
            case 1: {
                this.apiKeyArrIndex++;
                return consts.GOOGLE_API_ALEX;
            }
            default: {
                this.apiKeyArrIndex = 0;
                return consts.GOOGLE_API_SHAMIR;
            }
        }
    }

    // get direction data method.
    // all segments have start and end point and this method get for it directions
    googleGetDirection(startPoint, endPoint, mode, departureTime ){
        return new Promise(async (resolve, reject) => {

            // generating key for DB
            let key = `${startPoint}${endPoint}${mode}${DateTime.getDayAndHour(departureTime)}`;
            key = key.replace(/\s+/g,'');
            key = key.replace(/\./g,'');

            // first cheking if this request existiong in local database
            if(this.directionsDB.get(key).value()){
                resolve(this.directionsDB.get(key).value());
            } else {
                // if not exist, get the data from the api
                const url = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${startPoint}&destination=place_id:${endPoint}&mode=${mode}&key=${this.getApiKey()}&departure_time=${departureTime}&language=en`;
                axios.get(url)
                .then(response => {
                    this.numOfDirectionRequest--;
                    if(response.data.routes[0]){
                        // if the request has data, save is in local database
                        this.directionsDB.set(key, response.data).write();
                        resolve(response.data);
                    } else {
                        resolve(response.data);
                    }
                })
                .catch(error => {
                    this.numOfDirectionRequest--;
                    reject({error:error})
                 });
            }
        });
    };

    // get places around some point
    // the places looking by query consisting of parameters and kinds of laces determined by google
    googleGetPlacesByRadius(taskIndex, task, polygonPoint, radius){
        return new Promise((resolve, reject) => {

            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${polygonPoint.lat},${polygonPoint.lng}&rankby=distance&type=${task.task_place.place_type.name}&keyword=${task.task_place.place_company.name}&key=${consts.GOOGLE_API_ALEX}&language=en`;
            
            // generating key for DB
            if(!task.task_place.place_company.name || task.task_place.place_company.name === ""){
                task.task_place.place_company.name = ""
            }
            let key = task.task_place.place_type.name +task.task_place.place_company.name + polygonPoint.lat + polygonPoint.lng + radius;
            key = key.replace(/\s+/g,'');
            key = key.replace(/\./g,'');
            
            // first cheking if this request existiong in local database
            if(this.placesByRadiusDB.get(key).value()){
                resolve({
                    'taskIndex':  taskIndex,
                    response: this.placesByRadiusDB.get(key).value()
                });
            } else {
                // if not exist, get the data from the api
                axios.get(url)
                .then(response => {
                    this.numOfPlacesByRadius--;
                    // if the request has data, save is in local database
                    this.placesByRadiusDB.set(key, response.data.results.slice(0, 4)).write();
                    resolve({
                        'taskIndex':  taskIndex,
                        response: response.data.results.slice(0, 4)
                    });
                })
                .catch(error => {
                    this.numOfPlacesByRadius--;
                    reject({error:error});
                    console.log(error);
                });
            }
        });
    };

    // get the palaces by free text
    googleGetPlacesByQuery(taskIndex, query){
        return new Promise((resolve, reject) => {

            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${consts.GOOGLE_API_NIR}&language=en`;
            
            // generating key for DB
            let key = `${query}`;
            key = key.replace(/\s+/g,'');
            key = key.replace(/\./g,'');

            // first cheking if this request existiong in local database
            if(this.placesByQueryDB.get(key).value()){
                resolve({
                    'taskIndex':  taskIndex,
                    response: this.placesByQueryDB.get(key).value()
                });
            } else {
                setTimeout(()=>{
                    // first cheking if this request existiong in local database
                    if(this.placesByQueryDB.get(key).value()){
                        resolve({
                            'taskIndex':  taskIndex,
                            response: this.placesByQueryDB.get(key).value()
                        });
                    } else {
                        // if not exist, get the data from the api
                        axios.get(url)
                        .then(response => {
                            this.numOfPlacesByQuery--;
                            // if the request has data, save is in local database
                            this.placesByQueryDB.set(key, response.data.results).write();
                            resolve({
                                'taskIndex':  taskIndex,
                                response: response.data.results
                            });
                        })
                        .catch(error => {
                            this.numOfPlacesByQuery--;
                            reject({error:error});
                            console.log(error);
                        });
                    }
                }, 50 * this.numOfPlacesByQuery++);
            }
        });        
    };

    // get full data about place includes opening hours
    googleGetPlaceData(taskIndex, palaceId){
        return new Promise((resolve, reject) => {
            const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${palaceId}&key=${consts.GOOGLE_API_ALEX}&language=en`;
    
            // generating key for DB
            const key = `${palaceId}`;

            // first cheking if this request existiong in local database
            if(this.placeDataDB.get(key).value()){
                resolve({
                    'taskIndex':  taskIndex,
                    response: this.placeDataDB.get(key).value()
                });
            } else {
                setTimeout(()=>{
                    // first cheking if this request existiong in local database
                    if(this.placeDataDB.get(key).value()){
                        resolve({
                            'taskIndex':  taskIndex,
                            response: this.placeDataDB.get(key).value()
                        });
                    } else {
                        // if not exist, get the data from the api
                        axios.get(url)
                        .then(response => {
                            this.numOfPlaceData--;
                            // if the request has data, save is in local database
                            this.placeDataDB.set(key, response.data.result).write();
                            resolve({
                                'taskIndex':  taskIndex,
                                response: response.data.result
                            });
                        })
                        .catch(error => {
                            this.numOfPlaceData--;
                            reject({error:error});
                            console.log(error);
                        });
                    }
                }, 50 * this.numOfPlaceData++);
            }
        });        
    };
}