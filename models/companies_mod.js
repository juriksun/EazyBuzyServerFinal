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
* determining companies schema
*/
const   mongoose = require('mongoose'),
        Schema = mongoose.Schema;

CompanySchema = new Schema({
    formated_name: {type: String},
    name: {type: String},
    icon:{type: String}
});

CompaniesSchema = new Schema({
    formated_name: {type: String},
    companies: [CompanySchema]
},
{strict: false},
{collection: 'companies'});

let Companies = mongoose.model('Companies', CompaniesSchema);

module.exports = Companies;