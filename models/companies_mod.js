const   mongoose = require('mongoose'),
        Schema = mongoose.Schema;

CompanySchema = new Schema({
    formated_company: {type: String},
    company: {type: String}
});

CompaniesSchema = new Schema({
    formated_type: {type: String},
    companys: [CompanySchema]
},
{strict: false},
{collection: 'companies'});

let Companiess = mongoose.model('Companies', CompaniesSchema);

module.exports = Companys;