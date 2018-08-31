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
'use strict';
/*
* method for get information about the program
*/
exports.execute = (req, res) => {
    console.log("get_info route executing");
    res.status(200).json(
        {
            "name":"eazyBuzy",
            "version":"1.0",
            "authors":[
                "Alexander Djura",
                "Shamir Kritzler",
                "Nir Mekin"
            ],
            "description":"task managment system based GPS position and constraints - Server Side"
        }
    );
};