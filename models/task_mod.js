//import { Schema } from 'mongoose';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ShareSchema = new Schema({
        username: { type : String , required : true },
        share_status: { type : String , required : true }
    })
    EditTimeSchema = new Schema({
        create: { type : Number , required : true },
        last_edited: { type : Number , required : true }
    })
    TimeSchema = new Schema({
        start_hour: { type : Number , required : true },
        end_hour: { type : Number , required : true },
        duration: { type : Number , required : true }
    })
    TaskPlaceSchema = new Schema({
        place_type : { type : String , required : true },
        palce_key_word : { type : String , required : true }
    })
    CoordinateSchema = new Schema({
        lat : { type : Number , required : true },
        long : { type : Number , required : true }
    }),
    LocationSchema = new Schema({
        address : { type : String , required : true },
        place_id : { type : String , required : true },
        coordinate : CoordinateSchema
    }),
    TaskSchema = new Schema({
        // ---------------- will use id from mlab on create ---------------- 
        // id : { type : Number , required : true , unique : true },
        // -----------------------------------------------------------------
        user_token_id : { type : String , required : true },
        name : { type : String , required : true },
        status : { type : String , required : true },
        priority : { type : Number , required : false },
        share : ShareSchema,
        edit_time : EditTimeSchema,
        time : TimeSchema,
        task_place : TaskPlaceSchema,
        location : LocationSchema

    },
    {   strict: true    },
    {   collection: 'tasks' });

let Tasks = mongoose.model('Tasks', TaskSchema);

module.exports = Tasks;