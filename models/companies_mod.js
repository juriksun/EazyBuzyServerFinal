const   mongoose = require('mongoose'),
        Schema = mongoose.Schema;

CompanySchema = new Schema({
    formated_name: {type: String},
    name: {type: String},
    icon:{type: String}
});

CompaniesSchema = new Schema({
    formated_type: {type: String},
    companys: [CompanySchema]
},
{strict: false},
{collection: 'companies'});

let Companies = mongoose.model('Companies', CompaniesSchema);

module.exports = Companies;