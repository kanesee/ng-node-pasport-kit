/*************************
 * Authentication module
 ************************/
var dbp = require('../shared/db-promise.js');

var bcrypt = require('bcrypt');
const saltRounds = 10;

var jwt = require('jsonwebtoken');
const JWT_EXPIRATION = (60 * 60); // one hour

var uuidv4 = require('uuid/v4');
const SERVER_SECRET = uuidv4();

exports.passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

/***************************************
 * Register user with hashed password
 **************************************/
exports.registerUser = function(req, res) {
  var userid = req.body.userid;
  var plaintextPassword = req.body.password;
  
  bcrypt.hash(plaintextPassword, saltRounds)
    .then(function(hash) {
      var sql = 'INSERT INTO user(userid,passhash) VALUES(?,?)';
      return dbp.pool.query(sql, [userid, hash]);
    })
    .then(function(result) {
      res.send('registered');
    })
    .catch(function(err) {
      if( err.code == 'ER_DUP_ENTRY' ) {
        res.status(409).send('UserId already taken');
      } else {
        console.log('failed registerUser');

        res.writeHead(500, {'Content-Type':'text/plain'});
        res.end(err);
      }
    });
}

/***************************************
 * Login methods
 **************************************/

/*************************************************
 * This gets called when passport.authenticate()
 * gets called.
 * 
 * This checks that the credentials are valid.
 * If so, passes the user info to the next middleware.
 ************************************************/
exports.passport.use(new BasicStrategy(
  function(userid, plainTextPassword, done) {
//    console.log('BasicStrategy: verifying credentials');
    var sql = 'SELECT *'
            +' FROM user'
            +' WHERE userid=?';

    dbp.pool.query(sql, [userid])
      .then(function(rows) {
        if( rows.length ) {
          var hashedPwd = rows[0].passhash;
          return bcrypt.compare(plainTextPassword, hashedPwd);
        } else {
          return false;
        }
      })
      .then(function(result) {
        var user = false;
        if( result == true ) {
          /******************************
           * You may add additional 
           * user info here such as
           * roles and permissions
           ******************************/
          user = {
              userid: userid
//            , role: role
          };
        }
        done(null, user);
      })
      .catch(function(err) {
        console.log(err);
        done(err, null);
      })
  }
));

/*************************************************************
 * This is a wrapper for auth.passport.authenticate().
 * We use this to change WWW-Authenticate header so
 * the browser doesn't pop-up challenge dialog box by default.
 * Browser's will pop-up up dialog when status is 401 and 
 * "WWW-Authenticate:Basic..."
 *************************************************************/
exports.authenticateViaPassport = function(req, res, next) {
  exports.passport.authenticate('basic',{session:false}, 
    function(err, user, info) {
      if(!user){
        res.set('WWW-Authenticate', 'x'+info); // change to xBasic
        res.status(401).send('Invalid Authentication');
      } else {
        req.user = user;
        next();
      }
    }
  )(req, res, next);
};

/**********************************
 * Generating/Signing a JWT token
 * And attaches the user info into
 * the payload to be sent on every
 * request.
 *********************************/
exports.generateJWT = function(req, res, next) {
  var payload = {
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION
    , user: req.user,
//    , role: role
  };
  req.token = jwt.sign(payload, SERVER_SECRET);
  next();  
}

exports.returnAuthResponse = function(req, res) {
  res.status(200).json({
    user: req.user,
    token: req.token
  });  
}

/***************************************
 * Authorization: middleware that checks the 
 * JWT token for validity before allowing
 * the user to access anything.
 *
 * It also passes the user object to the next
 * middleware through res.locals
 **************************************/
exports.ensureAuthenticatedElseError = function(req, res, next) {
  var token = getToken(req.headers);
  if( token ) {
    var payload = jwt.decode(token, SERVER_SECRET);
    if( payload ) {
//      console.log('payload: ' + JSON.stringify(payload));
      // check if user still exists in database if you'd like
      res.locals.user = payload.user;
      next();
    } else {
      res.status(401).send('Invalid Authentication');
    }
  } else {
    res.status(401).send('Missing Authorization header');
  }
}

function getToken(headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};


/**********************************************
 * Private Helpers
 **********************************************/

//bcrypt.hash('testpass', saltRounds, function(err, hash) {
//  console.log('hashed password: ' + hash)
//});