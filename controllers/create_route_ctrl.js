'use strict';

exports.execute = (req, res) => {
    console.log("create_route route executing");


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