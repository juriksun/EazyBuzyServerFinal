module.exports = {
    "tasks": [
        {
            "id": 1,
            "name": "go to bank leumi",
            "type": "bank",
            "status": "wait",
            "edit_time": {
                "create": 12344566,
                "last_edited": 123444566
            },
            "time": {
                "start_hour": 231321321,
                "end_hour": 32134254,
                "duration": 2345678
            },
            "place": {
                "type": "bank",
                "key_words": ["leumi"],
                "location": {
                    "address": "string",
                    "place_id": "string",
                    "coordinate": {
                        "lat": "number",
                        "lng": "number"
                    }
                }
            }
        },
        {
            "id": 2,
            "name": "go to pharmacy",
            "type": "health",
            "status": "wait",
            "edit_time": {
                "create": 12344566,
                "last_edited": 123444566
            },
            "time": {
                "start_hour": 231321321,
                "end_hour": 32134254,
                "duration": 2345678
            },
            "place": {
                "type": "pharmacy",
                "key_words": ["clalit"],
                "location": {
                    "address": "string",
                    "place_id": "string",
                    "coordinate": {
                        "lat": "number",
                        "lng": "number"
                    }
                }
            }
        }
    ],
    "start_place": {
        "address": "Anne Frank St 12, Ramat Gan, Israel",
        "coordinate": {
            "lat": 32.0900011,
            "lng": 34.8030246   
        },
        "place_id": "ChIJEUjyOsRLHRURe25DzdVkh18",
    },
    "end_place": {
        "address": "Hertsel St 1, Ramat Gan, Israel",
        "coordinate": {
            "lat": 32.08051859999999,
            "lng": 34.8196098
        },
        "place_id": "ChIJLXgkPjVKHRURN1jg_EdA7I4",
    }
};