import { Schema } from 'mongoose';

let mongoose = require('mongoose'),
    schema = mongoose.Schema,
    shareSchema = new Schema({
        user_name: { type : String , required : true },
        share_status: { type : String , required : true }
    })
    editTimeSchema = new Schema({
        create: { type : Number , required : true },
        last_edited: { type : Number , required : true }
    })
    timeSchema = new Schema({
        start_hour: { type : Number , required : true },
        end_hour: { type : Number , required : true },
        duration: { type : Number , required : true }
    })
    taskPlaceSchema = new Schema({
        place_type : { type : String , required : true },
        palce_key_word : { type : String , required : true }
    })
    coordinateSchema = new schema({
        lat : { type : Number , required : true },
        long : { type : Number , required : true }
    }),
    locationSchema = new schema({
        address : { type : String , required : true },
        place_id : { type : String , required : true },
        coordinate : coordinateSchema
    }),
    taskSchema = new schema({
        id : { type : Number , required : true , unique : true },
        name : { type : String , required : true },
        status : { type : String , required : true },
        priority : { type : Number , required : true },
        share : shareSchema,
        edit_time : editTimeSchema,
        time : timeSchema,
        task_place : taskPlaceSchema,
        location : locationSchema

    },
    {   strict: true    },
    {   collection: 'tasks' });

let Tasks = mongoose.model('Tasks',userSchema);

module.exports = Tasks;