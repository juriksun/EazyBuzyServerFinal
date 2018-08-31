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
* determining type schema
*/
const   mongoose = require('mongoose'),
        Schema = mongoose.Schema;

let TypeSchema = new Schema({
    formated_name: {type: String},
    name: {type: String},
    icon: {type: String}
},
{strict: false},
{collection: 'types'});

let Types = mongoose.model('Types', TypeSchema);

module.exports = Types;