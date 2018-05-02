const   mongoose = require('mongoose'),
        Schema = mongoose.Schema;

        
CompanySchema = new Schema({
    formated_company: {type: String},
    company: {type: String}
},
{strict: false},
{collection: 'companies'});

let Company = mongoose.model('Company', CompanySchema);

module.exports = Company;