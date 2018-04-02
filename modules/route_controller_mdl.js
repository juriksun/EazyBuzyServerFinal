'use strict';

let RouteCreator = require('./router_creator_mdl');

module.exports = class{

    constructor(){
        this.routeCreator = RouteCreator();
    }

    createRoute(){
        this.routeCreator.createRoute()
    }

    getRoute(){

    }
};