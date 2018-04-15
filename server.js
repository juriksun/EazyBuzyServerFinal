'use strict';
const   express     = require('express'),
        bodyParser  = require('body-parser'),
        port        = process.env.PORT || 3000,
        app         = express();


const   get_info_ctrl       = require('./controllers/get_info_ctrl'),
        create_route_ctrl   = require('./controllers/create_route_ctrl'),
        get_route_ctrl      = require('./controllers/get_route_ctrl'),
        tasks_crtl          = require('./controllers/tasks_crtl'),
        users_ctrl           = require('./controllers/users_ctrl')

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());

app.set('port', port);
//app.use('/', express.static('./public'));//for API
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    res.set("Content-Type", "Application/json");
    next();
});

/*** All routes ***/
// app.get('/', (req, res)=>{res.status(200).sendFile(__dirname + "public/api.html")});//for api
app.use('/info', get_info_ctrl.execute);
// ROUTES
app.use('/create_route', create_route_ctrl.execute);
//app.use('/get_route', get_route_ctrl.execute);

// USERS
app.use('/get_user', users_ctrl.getUser);

// TASKS
app.use('/get_all_tasks', tasks_crtl.getAllTasks);
app.use('/create_task', tasks_crtl.createTask);
app.use('/delete_task', tasks_crtl.deleteTask);



//response friendly 404 Page
app.all('*', (req, res) => {
    console.log('Wrong Page Address - friendly 404. Check URL Address');
    res.status(404).send('Got Lost? This is a friendly 404 Page');
});

app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
});