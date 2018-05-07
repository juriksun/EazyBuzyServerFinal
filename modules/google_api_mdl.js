'use strict';
const axios = require("axios"),
      consts = require("../consts");

      
module.exports.googleGetPlacesByRadius = (taskIndex, task, polygonPoint, radius, timeout) => {
    if(!timeout) timeout = 0;
    return new Promise((resolve, reject) => {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${polygonPoint.lat},${polygonPoint.lng}&radius=${radius}&type=${task.task_place.place_type.name}&keyword=${task.task_place.place_company.name}&key=${consts.GOOGLE_API_SHAMIR}&language=en`;
        setTimeout(()=>{
            axios
            .get(url)
            .then(response => {
                resolve(
                    {
                        'taskIndex':  taskIndex,
                        response: response.data.results
                    }
                );
            })
            .catch(error => {
                console.log(error);
            });
        },timeout)
    });
};

module.exports.googleGetPlacesByQuery = (taskIndex, query , timeout = 0) => {
    return new Promise((resolve, reject) => {
        query = query.replace(/\s+/g,'%20')
        console.log(query)
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${consts.GOOGLE_API_SHAMIR}&language=en`;
        setTimeout(()=>{
            axios
            .get(url)
            .then(response => {
                resolve(
                    {
                        'taskIndex':  taskIndex,
                        response: response.data.results
                    }
                );
            })
            .catch(error => {
                console.log(error);
            });
        },timeout)
    });
};

module.exports.googleGetPlaceData = (taskIndex, palaceId) => {
    if(!timeout) timeout = 0;
    return new Promise((resolve, reject) => {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${palaceId}&key=${consts.GOOGLE_API_SHAMIR}&language=en`;
        setTimeout(()=>{
            axios
            .get(url)
            .then(response => {
                resolve(
                    {
                        'taskIndex':  taskIndex,
                        response: response.data.result
                    }
                );
            })
            .catch(error => {
                console.log(error);
            });
        },timeout)
    });
};

module.exports.googleGetDirection = (startPoint, endPoint, mode, timeout) => {
    if(!timeout) timeout = 0;
    return new Promise((resolve, reject) => {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${startPoint}&destination=place_id:${endPoint}&mode=${mode}&key=${consts.GOOGLE_API_SHAMIR}&language=en`;
        setTimeout(()=>{
            axios
            .get(url)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject({error:error})
            });
        },timeout)
    });
};