var finalhandler = require('finalhandler');
var http         = require('http');
var Router       = require('router');
var stat 		 = require('node-static');
var AWS			 = require('aws-sdk');

var fileServer = new stat.Server(); 
var router = new Router();

//loads access keys from config.json
AWS.config.loadFromPath('./config.json');

var dynamodb = new AWS.DynamoDB();

router.get('/', function (req, res) {
  fileServer.serve(req,res);
})
 





var server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res));
})
 
server.listen(8080);