'use strict';
const axios         = require("axios"),
      consts        = require("../consts"),
      DateTime      = require('./date_time_mdl');

const   low         = require('lowdb'),
        FileSync    = require('lowdb/adapters/FileSync');

module.exports.GoogleAPIs = class{

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
                this.apiKeyArrIndex++;
                return consts.GOOGLE_API_SHAMIR;
            }
        }
    }

    googleGetDirection(startPoint, endPoint, mode, departureTime ){
        return new Promise(async (resolve, reject) => {

            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${startPoint}&destination=place_id:${endPoint}&mode=${mode}&key=${this.getApiKey()}&departure_time=${departureTime}&language=en`;

            const key = `${startPoint}${endPoint}${mode}${DateTime.getDayAndHour(departureTime)}`;

            if(this.directionsDB.get(key).value()){
                resolve(this.directionsDB.get(key).value());
            } else {
            setTimeout(()=>{
                if(this.directionsDB.get(key).value()){
                    resolve(this.directionsDB.get(key).value());
                } else {
                axios
                .get(url)
                .then(response => {
                    this.numOfDirectionRequest--;
                    this.directionsDB.set(key, response.data).write();
                    resolve(response.data);
                })
                .catch(error => {
                    this.numOfDirectionRequest--;
                    reject({error:error})
                });
            }
                }, 50 * this.numOfDirectionRequest++);
            }
            
        });
    };

    googleGetPlacesByRadius(taskIndex, task, polygonPoint, radius){
        return new Promise((resolve, reject) => {
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${polygonPoint.lat},${polygonPoint.lng}&radius=${radius}&type=${task.task_place.place_type.name}&keyword=${task.task_place.place_company.name}&key=${consts.GOOGLE_API_ALEX}&language=en`;

            const key = `${polygonPoint.lat}${polygonPoint.lng}${radius}${task.task_place.place_type.name}${task.task_place.place_company.name}`;

            if(this.placesByRadiusDB.get(key).value()){
                resolve({
                    'taskIndex':  taskIndex,
                    response: this.placesByRadiusDB.get(key).value()
                });
            } else {
            setTimeout(()=>{
                if(this.placesByRadiusDB.get(key).value()){
                    resolve({
                        'taskIndex':  taskIndex,
                        response: this.placesByRadiusDB.get(key).value()
                    });
                } else {
                axios
                .get(url)
                .then(response => {
                    this.numOfPlacesByRadius--;
                    this.placesByRadiusDB.set(key, response.data.results).write();
                    resolve({
                        'taskIndex':  taskIndex,
                        response: response.data.results
                    });
                })
                .catch(error => {
                    this.numOfPlacesByRadius--;
                    reject({error:error});
                    console.log(error);
                });
            }
                }, 50 * this.numOfPlacesByRadius++);
            }
        });
    };

    googleGetPlacesByQuery(taskIndex, query){
        return new Promise((resolve, reject) => {

            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${consts.GOOGLE_API_NIR}&language=en`;
            
            const key = `${query}`;

            if(this.placesByQueryDB.get(key).value()){
                resolve({
                    'taskIndex':  taskIndex,
                    response: this.placesByQueryDB.get(key).value()
                });

            } else {
            setTimeout(()=>{
                if(this.placesByQueryDB.get(key).value()){
                    resolve({
                        'taskIndex':  taskIndex,
                        response: this.placesByQueryDB.get(key).value()
                    });
                } else {
                axios
                .get(url)
                .then(response => {
                    this.numOfPlacesByQuery--;
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

    googleGetPlaceData(taskIndex, palaceId){
        return new Promise((resolve, reject) => {
            const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${palaceId}&key=${consts.GOOGLE_API_ALEX}&language=en`;
    
            const key = `${palaceId}`;

            if(this.placeDataDB.get(key).value()){
                resolve({
                    'taskIndex':  taskIndex,
                    response: this.placeDataDB.get(key).value()
                });
            } else {
            setTimeout(()=>{
                if(this.placeDataDB.get(key).value()){
                    resolve({
                        'taskIndex':  taskIndex,
                        response: this.placeDataDB.get(key).value()
                    });
                } else {
                axios
                .get(url)
                .then(response => {
                    this.numOfPlaceData--;
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