const express = require('express'),
    app = express(),
    cors = require('cors'),
    mongoose = require('mongoose'),
    uptime = require('@mitchallen/uptime'),

    personRouter = require('./modules/person-router.js')
    importer = require('./modules/ged-importer')

    PORT = process.env.PORT || 3030;

var configDB = require('./config/database.js');

const GED_FILE_1 = 'data/snell-1.ged';
const GED_FILE_2 = 'data/parents.ged';
const GED_FILE_3 = 'data/family.ged';

const APP_NAME = 'kinship-parse';
const APP_VERSION = require("./../package").version;   
const PATH = '/v1'

// configuration ===============================================================
mongoose.connect(configDB.url, {
    useNewUrlParser: true
    // useMongoClient: true
}); // connect to our database

var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use( PATH, personRouter );

// app.use( PATH, emptyRecords );
// app.use( PATH, randomWords );
// app.use( PATH, randomValue );
// app.use( PATH, randomCoord );
// app.use( PATH, randomPersons );

app.get('/', function(req, res) {
    res.json({ 
        status: 'OK', 
        app: APP_NAME, 
        version: APP_VERSION, 
        uptime: uptime.toHHMMSS(),
        route: "/",
     });   
});

// Just a get for now

// curl http://localhost:3030/import

app.get('/import', (req, res, next) => {

    console.log('calling split')

    // TODO - get from UI / bucket
    importer.import({ filename: __dirname + '/' + GED_FILE_1 } );

    res.json({'message': 'imported file'});
});


// ----------------------------------

// 404 - MUST BE LAST
app.get('*', function(req, res) {
    res.status( 404 ).json({ 
        status: '404', 
        error: 'not found',
        app: APP_NAME, 
        version: APP_VERSION
     });   
});

app.listen(PORT, () => console.log(`${APP_NAME}:${APP_VERSION} - listening on port ${PORT}!`))