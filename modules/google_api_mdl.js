'use strict';
const axios = require("axios");
module.exports.googleGetPlacesByRadius = (taskIndex, task, polygonPoint, radius) => {
    return new Promise((resolve, reject) => {

        const url = `https://maps.googleapis.com/maps/api/place/radarsearch/json?location=${polygonPoint.lat},${polygonPoint.lng}&radius=${radius}&type=${task.place.type}&keyword=${task.place.key_words[0]}&key=AIzaSyAkz6xddABYhnT-iPqJePo3MIsiy1kxE9Q&language=en`;
        axios
            .get(url)
            .then(response => {
                //console.log(response.data.results);
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
    });
};

module.exports.googleGetDirection = (startPoint, endPoint, mode) => {
    return new Promise((resolve, reject) => {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${startPoint}&destination=place_id:${endPoint}&mode=${mode}&key=AIzaSyAkz6xddABYhnT-iPqJePo3MIsiy1kxE9Q&language=en`;
        axios
            .get(url)
            .then(response => {
                //console.log(response.data.results);
                resolve(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    });
}