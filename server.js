//var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression')
var auth = require('./shared/auth');
var myroute = require('./routes/sampleroute');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

app.use(auth.passport.initialize());

/*********************************
 * Serve all other content under /html
 *********************************/
app.use(compression());
app.use(express.static(__dirname+'/html'));

app.post('/auth/register'
        , auth.registerUser);
app.post('/auth/login'
//        , auth.passport.authenticate('basic',{session:false}) // causes challenge pop-up on 401
        , auth.authenticateViaPassport
        , auth.generateJWT
        , auth.returnAuthResponse
        );

/*************************
 * Route REST calls
 ************************/
// app.get('*', auth.passport.authenticate('basic', { session: false }))
app.get('/stuff/:stuffId'
      , auth.ensureAuthenticatedElseError
      , myroute.getStuff);


/*************************
 * Start Server
 ************************/


var httpPort = 3333;

app.listen(httpPort);

console.log('Listening on port '+httpPort);

