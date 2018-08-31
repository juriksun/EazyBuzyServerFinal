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
* determining user schema
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    UserSchema = new Schema({
        first_name: { type : String , required : true },
        last_name: { type : String , required : true },
        username: { type : String , required : true , unique : true },
        email: { type : String , required : true , unique : true },
        password: { type : String , required : true },
        image_profile : String
    },
    {   strict: true    },
    {   collection: 'users' });

let Users = mongoose.model('Users',UserSchema);

module.exports = Users;