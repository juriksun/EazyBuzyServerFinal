'use strict';
const   express     = require('express'),
        bodyParser  = require('body-parser'),
        port        = process.env.PORT || 3000,
        app         = express();


const   get_info_ctrl       = require('./controllers/get_info_ctrl'),
        create_route_ctrl   = require('./controllers/create_route_ctrl'),
        get_route_ctrl      = require('./controllers/get_route_ctrl'),
        get_all_tasks_crtl  = require('./controllers/get_all_tasks_ctrl');

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
app.use('/create_route', create_route_ctrl.execute);
app.use('/get_route', get_route_ctrl.execute);
app.use('/get_all_tasks', get_all_tasks_crtl.execute);

// app.use('/search', controller.getSearchResult);

// app.use('/admin_login', controller.adminLogin);
// app.use('/set_new_admin_user', controller.setNewAdminUser);

// app.use('/add_documents', controller.setNewDocuments);
// // // app.use('/remove_document', controller.removeDocument);
// app.use('/edit_document_summary', controller.editDocumentSummary);

// app.use('/get_all_documents', controller.getAllDocuments);

// app.use('/get_document', controller.getDocument);


//response friendly 404 Page
app.all('*', (req, res) => {
    console.log('Wrong Page Address - friendly 404. Check URL Address');
    res.status(404).send('Got Lost? This is a friendly 404 Page');
});

app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
});