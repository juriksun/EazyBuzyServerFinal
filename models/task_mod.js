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
* determining task schema
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;
let    ShareSchema = new Schema({
        username: { type : String , required : true },
        share_status: { type : String , required : true }
    }),
    TypeSchema = new Schema({
        formated_name: {type: String},
        name: {type: String},
        icon: {type: String}
    }),
    CompanySchema = new Schema({
        formated_name: {type: String},
        name: {type: String},
        icon:{type: String}
    }),
    EditTimeSchema = new Schema({
        create: { type : Number , required : true },
        last_edited: { type : Number , required : true }
    }),
    TimeSchema = new Schema({
        start_time: { type : String , required : true },
        date: { type : String , required : true },
        duration: { type : String , required : true }
    }),
    TaskPlaceSchema = new Schema({
        place_type : TypeSchema,
        place_company : CompanySchema
    }),
    GeometryLocationSchema = new Schema({
        lat : { type : Number , required : true },
        lng : { type : Number , required : true }
    }),
    GeometrySchema = new Schema({
        location : GeometryLocationSchema
    }),
    LocationSchema = new Schema({
        address : { type : String , required : true },
        place_id : { type : String , required : true },
        geometry : GeometrySchema
    });

    let TaskSchema = new Schema({
        user_token_id : { type : String},
        name : { type : String},
        type: { type : String},
        status : { type : String},
        priority : { type : String},
        share : {type : String},
        edit_time : EditTimeSchema,
        time : TimeSchema,
        task_place : TaskPlaceSchema,
        location : LocationSchema

    },
    {   strict: false},
    {   collection: 'tasks' });

let Tasks = mongoose.model('Tasks', TaskSchema);

module.exports = Tasks;