var finalhandler = require('finalhandler');
var http         = require('http');
var Router       = require('router');
var stat 		 = require('node-static');
var AWS			 = require('aws-sdk');

var fileServer = new stat.Server(); 
var router = new Router();


var dynamodb = new AWS.DynamoDB();

router.get('/', function (req, res) {
  fileServer.serve(req,res);
});
 


router.get('/new/', function(req, res){
	graphHandle(req, res);
});


function graphHandle(req, res){
	var query = req._parsedUrl.query;
	console.log(query.substring(0,3));
	if(!(query.substring(0,3))==="id="){
		console.log('Received bad query: "' + query + '", ignoring.');
		return;
	} else{
		console.log('Received valid request for new graph that is not: ' + query.substring(3));
	}
}


var server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res));
})
 
server.listen(8080);