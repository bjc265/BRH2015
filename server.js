var finalhandler = require('finalhandler'),
	http         = require('http'),
	Router       = require('router'),
	stat 		 = require('node-static'),
	AWS			 = require('aws-sdk');

AWS.config.update({ "accessKeyId": "AKIAJABTN4P5HXP5JLHQ", "secretAccessKey": "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", "region": "us-east-1" });

var fileServer = new stat.Server('static'); 
var router = new Router();


//use for query calls
var dynamodbdc = new AWS.DynamoDB.DocumentClient();
//use for everything else
var dynamodb = new AWS.DynamoDB();

var tickerTable;
loadTickerTable(function(err){});

function loadTickerTable(callback){
	dynamodb.scan({TableName : 'Catalog'},function(err,data){
		if(err){
			console.log(err,err.stack);
			return;
		} else {
			tickerTable = new Array(data.Items.length);
			for(var i=0;i<data.Items.length;i++){
				tickerTable[i] = data.Items[i].Ticker.S; 
			} 
			callback(err);
		}
	});
}


function paramsFor(ticker, year){
	//console.log('Evaluating params for ticker "' + ticker + '" for year ' + year);
	var params = {
		TableName : year.toString(),
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

function queryForTicker(ticker, res){
	var table = {};
	var yearWriting = 2005;
	for(var year=2005; year<2015; year++){
		//console.log('Querying for year ' + year.toString());
		dynamodbdc.query(paramsFor(ticker,year),function(err, data){
			if(err){
				console.log(err, err.stack);
				return;
			} else {
				
				//console.log(data);
				
				table.Count = (table.Count==null) ? data.Count : table.Count + data.Count;
				table.ScannedCount = (table.ScannedCount==null) ? data.ScannedCount : table.ScannedCount + data.ScannedCount;
				table.Items = (table.Items==null) ? data.Items : table.Items.concat(data.Items);
				yearWriting++;
				
			}

			if(yearWriting==2015) {
				//console.log('\nFinal Table Data:\n\n' + JSON.stringify(table));
				var dat = JSON.stringify(table);
				res.writeHead(200, {"Content-Type": 'text/JSON'});
				//console.log(dat);
				res.write(dat);
				res.end();
	console.log('Ended response');
			}
		});
	}
	
	
}



router.get('/', function (req, res) {
	fileServer.serve(req,res);
});

router.get('/js/*', function (req, res) {
	fileServer.serve(req,res);
});

router.get('/css/*', function (req, res) {
	fileServer.serve(req,res);
});

router.get('/images/*', function(req, res) {
	fileServer.serve(req,res);
});

router.get('/new/', function(req, res) {
	if(tickerTable == null)
		loadTickerTable(function(err){
			console.log(tickerTable.length);
			var n = Math.floor(Math.random() * (tickerTable.length));
			console.log('Randomly selected ticker "' + tickerTable[n] + '".');
			queryForTicker(tickerTable[n], res);
		});
	else {
		console.log(tickerTable.length);
		var n = Math.floor(Math.random() * (tickerTable.length));
		console.log('Randomly selected ticker "' + tickerTable[n] + '".');
		queryForTicker(tickerTable[n], res);
	}
	
		
});

router.get('/info/', function(req, res) {
	var query = decodeURI(req._parsedUrl.query);
	var p = {TableName : 'Catalog'};
	if(query.substring(7) === ''){
		console.log('Received ticker info request with no query, ignoring.');
		
	} else if(((query.substring(0,7)) ==="ticker=")==false){
		console.log('Received bad query "' + query + '", ignoring.');
		
	} else {
		console.log('Received valid info request with query "' + query.substring(7)+'".');
		if(tickerTable == null)
			loadTickerTable(function(err){
				dynamodbdc.query(paramsFor(query.substring(7),'Catalog'),function(err,data){
					if(err){
						console.log(err,err.stack);
						return;
					} else{
						res.writeHead(200, {"Content-Type": 'text/JSON'});
						res.end(JSON.stringify(data.Items[0]));
					}
				});
			});
		else{
			dynamodbdc.query(paramsFor(query.substring(7),'Catalog'),function(err,data){
				if(err){
					console.log(err,err.stack);
					return;
				} else{
					res.writeHead(200, {"Content-Type": 'text/JSON'});
					res.end(JSON.stringify(data.Items[0]));
				}
			});
		}
		
	}	
});

router.get('/list/', function(req, res) {
	if(tickerTable == null)
		loadTickerTable(function(err){
			res.writeHead(200, {"Content-Type": 'text/JSON'});
			res.end(JSON.stringify(tickerTable));
		});
	else{
		res.writeHead(200, {"Content-Type": 'text/JSON'});
		res.end(JSON.stringify(tickerTable));
	}
});


var server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res));
});
 
server.listen(8080);