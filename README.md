# angularjs-nodejs-passport-starter-kit

Starter kit for angular/nodejs app with passport/jwt authentication

## Quick Start
To run this template as is, you'll need to do the following:
1. Create a table with userid and passhash as columns. Here's the mysql script for that:
```
CREATE TABLE `user` (
  `userid` varchar(100) NOT NULL DEFAULT '',
  `passhash` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB DEFAULT;
```
2. edit shared/db-promise.js and change exports.pool database properties
3. Run `npm install` to install the dependences
4. Run `node server.js` to start the server
5. Go to `http://localhost:3333`
