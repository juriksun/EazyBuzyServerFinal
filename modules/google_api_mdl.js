'use strict';
const axios = require("axios"),
      consts = require("../consts")  
module.exports.googleGetPlacesByRadius = (taskIndex, task, polygonPoint, radius, timeout) => {
    if(!timeout) timeout = 0;
    return new Promise((resolve, reject) => {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${polygonPoint.lat},${polygonPoint.lng}&radius=${radius}&type=${task.task_place.place_type}&keyword=${task.task_place.place_key_word}&key=${consts.GOOGLE_API_SHAMIR}&language=en`;
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
            },timeout);
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
}