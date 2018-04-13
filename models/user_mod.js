let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    UserSchema = new Schema({
        first_name: { type : String , required : true },
        last_name: { type : String , required : true },
        username: { type : String , required : true , unique : true },
        email: { type : String , required : true , unique : true },
        password: { type : String , required : true }
    },
    {   strict: true    },
    {   collection: 'users' });

let Users = mongoose.model('Users',userSchema);

module.exports = Users;