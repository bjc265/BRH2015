var finalhandler = require('finalhandler'),
	http         = require('http'),
	Router       = require('router'),
	stat 		 = require('node-static'),
	AWS			 = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});
var fileServer = new stat.Server(); 
var router = new Router();


var dynamodb = new AWS.DynamoDB.DocumentClient();

var year = '2012';


function paramsFor(ticker, year){
	var params = {
		TableName : year,
		KeyConditionExpression : '#t=:ticker',
		ExpressionAttributeNames : {
			'#t' : 'Ticker'
		},
		ExpressionAttributeValues : {
			':ticker' : ticker
		}
	};
	return params;
}


router.get('/', function (req, res) {
  fileServer.serve(req,res);
});
 

router.get('/new/', function(req, res) {
	var query = req._parsedUrl.query;
	if(query != null){
		if((query.substring(0,3))==="id="){
			console.log('Received valid request for new graph that is not: ' + query.substring(3));
		} else
			console.log('Received bad query: "' + query + '", ignoring.'); 
	} else
		console.log('Received request with no query');
	dynamodb.query(paramsFor('ACRDBT Index','2005'),function(err, data){
		console.log("Attempted database query");
		if(err) console.log(err, err.stack);
		else {
			console.log(data);
			res.writeHead(200, {"Content-Type": "text/plain"});
			res.end(JSON.stringify(data));
		}
	});
});


var server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res));
})
 
server.listen(8080);