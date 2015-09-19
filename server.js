var finalhandler = require('finalhandler'),
	http         = require('http'),
	Router       = require('router'),
	stat 		 = require('node-static'),
	AWS			 = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});
var fileServer = new stat.Server(); 
var router = new Router();


var dynamodb = new AWS.DynamoDB.DocumentClient();

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

function queryForTicker(ticker, query, res){
	var table = {};
	var yearWriting = 2005;
	for(var year=2005; year<2015; year++){
		//console.log('Querying for year ' + year.toString());
		dynamodb.query(paramsFor(query.substring(7),year),function(err, data){
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
				console.log('\nFinal Table Data:\n\n' + JSON.stringify(table));
				var dat = JSON.stringify(table);
				res.writeHead(200, {"Content-Type": "text/plain"});
				console.log(dat);
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


router.get('/new/', function(req, res) {
	var query = decodeURI(req._parsedUrl.query);
	if(query === null){
		//console.log('Received ticker request with no query, ignoring.');
		return;
	} else if(((query.substring(0,7)) ==="ticker=")==false){
		//console.log('Received bad query "' + query + '", ignoring.');
		return;
	} else {
		
		queryForTicker(query.substring(7), query, res);
		
		
	}	
});



var server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res));
})
 
server.listen(8080);