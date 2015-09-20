

function submitQuery(){

resetDisplay();

//retrieve data
$.ajax({
		type: 'get',
	url: 'http://localhost:8080/new',
	success: function(data, textStatus, jqXHR) {
		//$('#wrapper').append('<p>' + data + '</p>');
		var parsed = JSON.parse(data).Items;

		// ie COWSTOTT Index
		var index_id = parsed[0].Ticker;

		// Get table description
		$.ajax({
   			type: 'get',
    		url: '/info/',
    		data: 'ticker=' + encodeURI(index_id),
    		success: function(data, textStatus, jqXHR) {
    			var inparsed = JSON.parse(data);
    			var title = inparsed.Description;
    			$('#title').html(title);
    			

    			// Get details
    			var freq = inparsed.Fields.Value.Frequency;
    			var units = inparsed.Fields.Value.Units;
    			$("#details").html((units != null ? units : '') + ' ' + freq);
    			generateGraph(parsed);
    		}
		});
		
	}
});


//retrieve data
/*$.getJSON('/new/', function(data){
	$('#wrapper').append(JSON.stringify(data));
});*/
}

// Creates the c3 graph
function generateGraph(parsed){
	
	var graph_data = [];

	for (var i = 0; i < parsed.length; i++){
		var obj = {date: parsed[i].Date, value: parsed[i].Value};
		graph_data.push(obj);
	}

	var chart = c3.generate({
	    data: {
	        json: graph_data,
            keys: {
				x: 'date', // it's possible to specify 'x' when category axis
                x_format: '%Y-%m-%d',
                value: ['value'],
            }
	    },
	    axis : {
	    	x : {
	    		type: 'timeseries',
	    		tick: {
	                format: '%m/%Y'
	            },
	            label : {
	            	text : $('#details').html().substring($('#details').html().indexOf(' '))
	            }
	    	},
	    	y : {
	    		label : {
	    			text : $('#details').html().substring(0,$('#details').html().indexOf(' '))
	    		}
	    	}
	    },
	    legend : {
	    	hide : true
	    }
	    
	});
}

// Clears display and indicates loading
function resetDisplay(){
	$("#title").html("");
	$("#details").html("");
	$("#chart").html("<img src='images/loading.gif' class='loading-gif'>");
}