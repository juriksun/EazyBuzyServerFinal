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
* determining shares schema
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ShareSchema = new Schema({
        username_from: { type : String , required : true },
        username_to: { type : String , required : true },
        task_id: { type : String , required : true , unique : true },
        status_new : Boolean
    },
    {   strict: true    },
    {   collection: 'shares' });

let Shares = mongoose.model('Shares',ShareSchema);

module.exports = Shares;