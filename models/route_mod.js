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
/*
* determining route schema
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    DurationSchema = new Schema({
        way: Number,
        execution: Number
    });

    LocationSchema = new Schema({
        lat: Number,
        lng: Number
    });

    PointScheme = new Schema({
        address: String,
        place_id: String, 
        geometry: LocationSchema
    });

    SegmentSchema = new Schema({
        start_point: PointScheme,
        end_point: PointScheme,
        duration: DurationSchema
    });

    RouteSchema = new Schema({
        start_point: PointScheme,
        end_point: PointScheme,
        user_token_id : String ,
        duration: DurationSchema,
        distance: Number,
        status: String,
    },
    {   strict: false},
    {   collection: 'routs' });

let Route = mongoose.model('Routs', RouteSchema);

module.exports = Route;