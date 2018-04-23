let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

    // ShareSchema = new Schema({
    //     username: { type : String , required : true },
    //     share_status: { type : String , required : true }
    // })
    // EditTimeSchema = new Schema({
    //     create: { type : Number , required : true },
    //     last_edited: { type : Number , required : true }
    // })
    // TimeSchema = new Schema({
    //     start_hour: { type : Number , required : true },
    //     end_hour: { type : Number , required : true },
    //     duration: { type : Number , required : true }
    // })
    // TaskPlaceSchema = new Schema({
    //     place_type : { type : String , required : true },
    //     place_key_word : { type : String , required : true }
    // })
    // CoordinateSchema = new Schema({
    //     lat : { type : Number , required : true },
    //     long : { type : Number , required : true }
    // }),
    // LocationSchema = new Schema({
    //     address : { type : String , required : true },
    //     place_id : { type : String , required : true },
    //     coordinate : CoordinateSchema
    // }),
    // TaskSchema = new Schema({
    //     name : { type : String},
    //     type: { type : String},
    //     status : { type : String},
    //     priority : { type : Number},
    //     share : ShareSchema,
    //     edit_time : EditTimeSchema,
    //     time : TimeSchema,
    //     task_place : TaskPlaceSchema,
    //     location : LocationSchema
    // });

    DurationSchema = new Schema({
        way: Number, //V
        execution: Number //V
    });

    LocationSchema = new Schema({
        lat: Number, //V
        lng: Number //V
    });

    PointScheme = new Schema({
        address: String, //V
        place_id: String, //V
        geometry: LocationSchema //V
    });

    SegmentSchema = new Schema({
        start_point: PointScheme, //V
        end_point: PointScheme, //V
        duration: DurationSchema, //V
        // task: TaskSchema, 
        // place: PlaceSchema,
        // steps: [ StepsSchema ],
    });

    RouteSchema = new Schema({
        start_point: PointScheme, //V
        end_point: PointScheme, //V
        user_token_id : String , //V
        duration: DurationSchema, //V
        distance: Number, //V
        status: String, //V
        // segments: [ SegmentSchema ],
        // tasks: [ TaskSchema ],
        // 
    },
    {   strict: false},
    {   collection: 'routs' });

let Route = mongoose.model('Routs', RouteSchema);

module.exports = Route;