var express = require('express');
var app = express();
app.use(express.static('www'));
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
	
    console.log('Express server listening on port ' + app.get('port'));
});
var fs = require("fs");
var pg, conString, client, query;
function clientConnect(){
	pg = require('pg');
	pg.defaults.ssl = true;          
	conString = process.env.DATABASE_URL ||
	  "postgres://oqxedspgwwlmvf:df7b498f7356c59b32c0077618de30d1605505dd8307c05551f8b0698e3e2c54@ec2-54-243-185-123.compute-1.amazonaws.com:5432/daqbimo6t7o2u9";
	client = new pg.Client(conString);
	client.connect();
}

clientConnect();

var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'bulletinboarduprm@gmail.com',
		pass:'announceit'
	}
});

app.get('/sendMail/:username/:email',function(req,res){
	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'bulletinboarduprm@gmail.com', // sender address
	    to: req.params.email, // list of receivers
	    subject: 'Welcome to Bulletin Board!', // Subject line
	    text: 'Hello '+req.params.username+',\
	    \nPlease verify your account by logging in: announceit.herokuapp.com/signup.html', // plaintext body
	    //html: '<b>Hello world ?</b>' // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	});
});


app.get('/db/get/soil', function (req,res) {
	//clientConnect();
	query = client.query(
		"select *\
		from soilwatercharacteristics\
		;"
	);  
	query.on('row', function(row, result) {
		result.addRow(row);
	});
   	query.on('end', function (result) {          
   		//client.end(); 
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(result.rows, null, "    "));
		console.log(result);
		res.end();  
	});
});
