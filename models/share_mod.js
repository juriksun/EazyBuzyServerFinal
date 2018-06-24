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