const   mongoose = require('mongoose'),
        Schema = mongoose.Schema;

 
TypeSchema = new Schema({
    formated_name: {type: String},
    name: {type: String},
    icon: {type: String}
},
{strict: false},
{collection: 'types'});

let Types = mongoose.model('Types', TypeSchema);

module.exports = Types;