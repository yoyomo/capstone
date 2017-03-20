/*************************************************************
 * ************************ SET UP ***************************
 *************************************************************
 */

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

/*************************************************************
 * ************************ EMAILS ***************************
 *************************************************************
 */
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

/*************************************************************
 * ************************ QUERIES **************************
 *************************************************************
 */

function call(stringQuery,req,res){
	//clientConnect();
	query = client.query(stringQuery);  
	query.on('row', function(row, result) {
		result.addRow(row);
	});
   	query.on('end', function (result) {          
   		//client.end(); 
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.status(200).write(JSON.stringify(result.rows, null, "    "));
		res.end();  
	});
}

// Sign Up
app.get('/db/add/farmer/:fullname/:email/:username/:password/:phonenumber', function (req,res) {
	var farmer = req.params;
	call("insert into farmer (fullname, email, username, password, phonenumber)\
		values ('"+farmer.fullname+"','"+farmer.email+"','"+farmer.username+"',\
		'"+farmer.password+"','"+farmer.phonenumber+"')\
		;",req,res);
});

// Log In
app.get('/db/get/farmer/:username/:password', function (req,res) {
	var farmer = req.params;
	call("select *\
		from farmer\
		where username='"+farmer.username+"' and password='"+farmer.password+"'\
		;",req,res);
});

// Gets Latitude values
app.get('/db/get/latitude', function (req,res) {
	call("select *\
		from latitude\
		;",req,res);
});

// Gets Longitude values
app.get('/db/get/longitude', function (req,res) {
	call("select *\
		from longitude\
		;",req,res);
});


// Gets Soil Water Characteristics for Farms
app.get('/db/get/soils', function (req,res) {
	call("select *\
		from soilwatercharacteristics\
		;",req,res);
});

// Add Farm
app.get('/db/add/farm/:uid/:farmname/:soiltype/:latindex/:lonindex', function (req,res) {
	var farm = req.params;
	call("insert into farm (uid,farmname,soiltype,latindex,lonindex)\
		values ("+farm.uid+",'"+farm.farmname+"',\
		'"+farm.soiltype+"',"+farm.latindex+","+farm.lonindex+")\
		;",req,res);
});

// Get user's farms
app.get('/db/get/farms/:uid', function (req,res) {
	var farms = req.params;
	call("select *\
		from farm\
		where uid="+farms.uid+"\
		;",req,res);
});

// Get all irrigation methods
app.get('/db/get/irrigationmethod/', function (req,res) {
	var farms = req.params;
	call("select *\
		from fieldapplicationefficiency\
		;",req,res);
});

// Add Irrigation Zone
app.get('/db/add/iz/:farmid/:uid/:izname/:acres/:waterflow/:method/:eff', function (req,res) {
	var iz = req.params;
	call("insert into irrigationzone \
		(farmID,uID,izname,acres,waterflow,irrigationMethod,irrigationEfficiency)\
		values ("+iz.farmid+","+iz.uid+",'"+iz.izname+"',"+iz.acres+",\
		"+iz.waterflow+",'"+iz.method+"',"+iz.eff+")\
		;",req,res);
});

// Get user's irrigation zones by farm
app.get('/db/get/iz/:farmid/:uid', function (req,res) {
	var iz = req.params;
	call("select *\
		from irrigationzone\
		where farmid="+iz.farmid+" and uid="+iz.uid+"\
		;",req,res);
});

// Get all crop info
app.get('/db/get/cropinfo/', function (req,res) {
	var farms = req.params;
	call("select *\
		from cropinfo\
		;",req,res);
});

// Add Crop
app.get('/db/add/crop/:izid/:uid/:infoid', function (req,res) {
	var crop = req.params;
	call("insert into crop (izid,uid,infoid)\
		values ("+crop.izid+","+crop.uid+","+crop.infoid+")\
		;",req,res);
});

// Get logged in user
app.get('/db/get/farmer/:uid', function (req,res) {
	var farmer = req.params;
	call("select *\
		from farmer\
		where uid="+farmer.uid+"\
		;",req,res);
});

// Get all user's crops
app.get('/db/get/crops/:uid', function (req,res) {
	var crops = req.params;
	call("select *\
		from crop\
		where uid="+crops.uid+"\
		;",req,res);
});

// Edit Crop
app.get('/db/edit/crop/:cropid/:uid/:izid/:infoid', function (req,res) {
	var crop = req.params;
	call("update crop\
		set izid="+crop.izid+",infoid="+crop.infoid+"\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;",req,res);
});

// Read Specific Crop Information
app.get('/db/get/crop/:cropid/:uid', function (req,res) {
	var crop = req.params;
	call("select *\
		from crop natural join irrigationzone\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;",req,res);
});

// Read All Crops' Information that are not Finished
app.get('/db/get/allcrops', function (req,res) {
	var crop = req.params;
	call("select *\
		from crop natural join cropinfo natural join irrigationzone natural join\
		farm natural join soilwatercharacteristics natural join latitude natural join longitude\
		where cropstatus='On Going'\
		;",req,res);
});

