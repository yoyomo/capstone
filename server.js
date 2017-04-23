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
		user: 'h2ocrop.pr@gmail.com',
		pass:'efficientirrigationsystem'
	}
});

app.get('/sendAlert/:alert',function(req,res){
	var alert = JSON.parse(req.params.alert);
	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'h2ocrop.pr@gmail.com', // sender address
	    to: alert.email, // list of receivers
	    subject: 'Your crop needs irrigation!', // Subject line
	    text: 'Hello '+alert.username+',\
	    \n\nYour '+alert.cropname+' crop at '+alert.farmname+' \
	    needs irrigation.\
	    '
	    //, // plaintext body
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

app.get('/sendVerify/:verify',function(req,res){
	var verify = JSON.parse(req.params.verify);
	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'bulletinboarduprm@gmail.com', // sender address
	    to: verify.email, // list of receivers
	    subject: 'Welcome to H2OCrop, '+verify.username+'!', // Subject line
	    // text: 'Hello '+verify.username+',\
	    // \n\nPlease verify your account by clicking\
	    // '
	    // , // plaintext body
	    html: '<h1>H2OCrop</h1>\
	    </br></br>\
	    <p>Hello '+verify.username+',</br></br>\
	    Please click the button below to verify your account</br></br>\
	    <form action="https://h2ocrop.herokuapp.com/db/verifyaccount/{%22email%22:%22'+verify.email+'%22}">\
		    <input type="submit" \
		    style="background-color: #006699;\
		    border: none;\
		    color: white;\
		    padding: 15px 32px;\
		    text-align: center;\
		    text-decoration: none;\
		    display: inline-block;\
		    font-size: 16px;\
		    margin: 4px 2px;\
		    cursor: pointer;" value="Verify" />\
		</form>\
	    </p>' // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Verify account message sent to ' + verify.email);
	    res.writeHead(200, {'Content-Type': 'text/plain'});
		res.status(200).write(JSON.stringify({"message":"Verify account message sent to " + verify.email}, null, "    "));
		res.end();
	});
});

/*************************************************************
 * ************************ SET UP **************************
 *************************************************************
 */

// Update New Crop
const setup = require('./updateServer.js');
app.get('/db/update/newcrop/:crop', function (req,res) {
	var crop = JSON.parse(req.params.crop);
	setup.serverUpdateNewCrop(crop);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.status(200).write(JSON.stringify({"message":"Calculated first rec for crop " + crop.cropid}, null, "    "));
	res.end();
});


/*************************************************************
 * ************************ QUERIES **************************
 *************************************************************
 */

function call(stringQuery,req,res){
	//clientConnect();
	query = client.query(stringQuery);
	query.on('error', function(error) {
		console.log(error);
		res.write(JSON.stringify(error, null, "    "));
		res.end();
	});  
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
app.get('/db/add/farmer/:farmer', function (req,res) {
	var farmer = JSON.parse(req.params.farmer);
	call("insert into farmer (fullname, email, username, password)\
		values ('"+farmer.fullname+"','"+farmer.email+"','"+farmer.username+"',\
		'"+farmer.password+"')\
		;",req,res);
});

// Verify Account
app.get('/db/verifyaccount/:verify', function (req,res) {
	var verify = JSON.parse(req.params.verify);
	call("update farmer\
		set verified='Yes'\
		where email='"+verify.email+"'\
		;",req,res); 
}); 

// Forgot Password
app.get('/db/forgotpassword/:farmer', function(req,res) {
	var farmer = JSON.parse(req.params.farmer);
	var stringQuery = 
		"update farmer\
		set password='"+farmer.password+"'\
		where email='"+farmer.email+"'\
		;";
	call(stringQuery, req, res);
});

// Log In
app.get('/db/get/farmer/:farmer', function (req,res) {
	var farmer = JSON.parse(req.params.farmer);
	call("select *\
		from farmer\
		where (username='"+farmer.usernameORemail+"' or email='"+farmer.usernameORemail+"') and password='"+farmer.password+"'\
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
app.get('/db/add/farm/:farm', function (req,res) {
	var farm = JSON.parse(req.params.farm);
	call("insert into farm (uid,farmname,soiltype,latindex,lonindex)\
		values ("+farm.uid+",'"+farm.farmname+"',\
		'"+farm.soiltype+"',"+farm.latindex+","+farm.lonindex+")\
		;",req,res);
});

// Get user's farms
app.get('/db/get/farms/:farms', function (req,res) {
	var farms = JSON.parse(req.params.farms);
	call("select *\
		from farm\
		where uid="+farms.uid+"\
		;",req,res);
});

// Get all irrigation methods
app.get('/db/get/irrigationmethod/', function (req,res) {
	call("select *\
		from fieldapplicationefficiency\
		;",req,res);
});

// Add Irrigation Zone
app.get('/db/add/iz/:iz', function (req,res) {
	var iz = JSON.parse(req.params.iz);
	call("insert into irrigationzone \
		(farmID,uID,izname,acres,waterflow,irrigationMethod,irrigationEfficiency)\
		values ("+iz.farmid+","+iz.uid+",'"+iz.izname+"',"+iz.acres+",\
		"+iz.waterflow+",'"+iz.method+"',"+iz.eff+")\
		;",req,res);
});

// Get user's irrigation zones by farm
app.get('/db/get/iz/:iz', function (req,res) {
	var iz = JSON.parse(req.params.iz);
	call("select *\
		from irrigationzone\
		where farmid="+iz.farmid+" and uid="+iz.uid+"\
		;",req,res);
});

// Get all crop info
app.get('/db/get/cropinfo/', function (req,res) {
	call("select *\
		from cropinfo\
		;",req,res);
});

// Add Crop
app.get('/db/add/crop/:crop', function (req,res) {
	var crop = JSON.parse(req.params.crop);
	call("insert into crop (izid,uid,infoid)\
		values ("+crop.izid+","+crop.uid+","+crop.infoid+")\
		;",req,res);
});

// Get logged in user
app.get('/db/get/farmer/:farmer', function (req,res) {
	var farmer = JSON.parse(req.params.farmer);
	call("select *\
		from farmer\
		where uid="+farmer.uid+"\
		;",req,res);
});

// Get all user's crops
app.get('/db/get/crops/:crops', function (req,res) {
	var crops = JSON.parse(req.params.crops);
	call("select *\
		from crop natural join farm natural join irrigationzone natural join cropinfo\
		where uid="+crops.uid+"\
		order by crop.dateplanted desc\
		;",req,res);
});

// Edit Crop
app.get('/db/edit/crop/:crop', function (req,res) {
	var crop = JSON.parse(req.params.crop);
	call("update crop\
		set izid="+crop.izid+",infoid="+crop.infoid+"\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;",req,res);
});

// Read Specific Crop Information
app.get('/db/get/crop/:crop', function (req,res) {
	var crop = JSON.parse(req.params.crop);
	call("select *\
		from crop natural join cropinfo natural join irrigationzone \
		 natural join farm natural join soilwatercharacteristics \
		 natural join latitude natural join longitude\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;",req,res);
});

// Read All Crops' Information that are not Finished
app.get('/db/get/allcrops', function (req,res) {
	call("select *\
		from farmer natural join crop natural join cropinfo natural join irrigationzone natural join\
		farm natural join soilwatercharacteristics natural join latitude natural join longitude\
		where cropstatus='On Going'\
		;",req,res);
});

// Add to History
app.get('/db/add/history/:history', function(req,res) {
	var history = JSON.parse(req.params.history);
	call("insert into history (cropid,uid,recommendedet,irrigatedet,seasonday)\
		values ("+history.cropid+","+history.uid+",\
		"+history.recommendedet+","+history.irrigatedet+","+history.seasonday+")\
		;", req, res);
});

// Get Crop's History
app.get('/db/get/history/:history', function(req,res) {
	var history = JSON.parse(req.params.history);
	call("select *\
		from history\
		where cropid="+history.cropid+" and uid="+history.uid+"\
		;", req, res);
});

// Edit Crop's History 
/*
 * WARNING: CHANGING A CROP'S HISTORY AFFECTS THE CUMULATIVE ET
 */
app.get('/db/edit/history/:history', function(req,res) {
	var history = JSON.parse(req.params.history);

	// first update cumulative crop with respect to old written value
	var firstQuery = 
		"update crop\
		set cumulativeet=(cumulativeet-"+history.irrigatedet+"\
		+(select irrigatedet\
			from history\
			where histid="+history.histid+" and cropid="+history.cropid+" and uid="+history.uid+"))\
		where cropid="+history.cropid+" and uid="+history.uid+";";

	// then update history values with new one
	var secondQuery = 
		"update history\
		set irrigatedet="+history.irrigatedet+"\
		where histid="+history.histid+" and cropid="+history.cropid+" and uid="+history.uid+"\
		;";
	call(firstQuery + secondQuery, req, res);
});

// Edit Farmer (used for settings)
app.get('/db/edit/farmer/:farmer', function(req,res) {
	var farmer = JSON.parse(req.params.farmer);
	var stringQuery = 
		"update farmer\
		set email='"+farmer.email+"',password='"+farmer.password+"',\
		username='"+farmer.username+"', fullname='"+farmer.fullname+"'\
		where uid="+farmer.uid+"\
		;";
	call(stringQuery, req, res);
});

// Update Crop (called when new data is calculated everyday)
app.get('/db/update/crop/:crop', function(req,res) {
	var crop = JSON.parse(req.params.crop);
	var stringQuery = 
		"update crop\
		set currentday="+crop.currentday+", currentet="+crop.currentet+",\
		cumulativeet="+crop.cumulativeet+", currentkc="+crop.currentkc+",\
		cropstatus='"+crop.cropstatus+"'\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;";
	call(stringQuery, req, res);
});

// Edit Farm
app.get('/db/edit/farm/:farm', function (req,res) {
	var farm = JSON.parse(req.params.farm);
	call("update farm\
		set farmname='"+farm.farmname+"', soiltype='"+farm.soiltype+"',\
		latindex="+farm.latindex+", lonindex="+farm.lonindex+"\
		where farmid="+farm.farmid+" and uid="+farm.uid+"\
		;",req,res);
});

// Edit Irrigation Zone
app.get('/db/edit/iz/:iz', function (req,res) {
	var iz = JSON.parse(req.params.iz);
	call("update irrigationzone\
		set farmid="+iz.farmid+", izname='"+iz.izname+"', \
		acres="+iz.acres+", waterflow="+iz.waterflow+", \
		irrigationmethod='"+iz.method+"', irrigationefficiency="+iz.eff+"\
		where izid="+iz.izid+" and uid="+iz.uid+"\
		;",req,res);
});

// Delete User's Crop
app.get('/db/delete/crop/:crop', function (req,res) {
	var crop = JSON.parse(req.params.crop);
	call("delete from crop\
		where cropid="+crop.cropid+" and uid="+crop.uid+" and izid="+crop.izid+"\
		;",req,res);
});

/*************************************************************
 * ************************ HARDWARE *************************
 *********************** CONTROL SYSTEM **********************
 *************************************************************
 */

// Add Master Control
app.get('/db/add/mc/:mc', function (req,res) {
	var mc = JSON.parse(req.params.mc);
	call("insert into mastercontrol (farmid, uid, ipaddress)\
		values ("+mc.farmid+","+mc.uid+",'"+mc.ipaddress+"')\
		;",req,res);
});

// Get user's Master Control
app.get('/db/get/mc/:mc', function (req,res) {
	var mc = JSON.parse(req.params.mc);
	call("select *\
		from mastercontrol\
		where uid="+mc.uid+"\
		;",req,res);
});

// Edit user's Master Control
app.get('/db/edit/mc/:mc', function (req,res) {
	var mc = JSON.parse(req.params.mc);
	call("update mastercontrol\
		set farmid="+mc.farmid+", ipaddress='"+mc.ipaddress+"'\
		where controlid="+mc.controlid+" and uid="+mc.uid+"\
		;",req,res);
});

// Add Valve to Master Control
app.get('/db/add/valve/:valve', function (req,res) {
	var valve = JSON.parse(req.params.valve);
	call("insert into valvecontrol (uid,izid,controlid,valveid)\
		values ("+valve.uid+","+valve.izid+","+valve.controlid+","+valve.valveid+")\
		;",req,res);
});

// Get user's Valves of a Master Control
app.get('/db/get/valve/:valve', function (req,res) {
	var valve = JSON.parse(req.params.valve);
	call("select *\
		from valvecontrol\
		where uid="+valve.uid+" and controlid="+valve.controlid+"\
		;",req,res);
});

// Edit user's Valve
app.get('/db/edit/valve/:valve', function (req,res) {
	var valve = JSON.parse(req.params.valve);
	call("update valvecontrol\
		set valveid="+valve.valveid+"\
		where uid="+valve.uid+" and controlid="+valve.controlid+" and izid="+valve.izid+"\
		;",req,res);
});

// Add Communication (Send Irrigation Amount)
app.get('/db/add/comm/:comm', function (req,res) {
	var comm = JSON.parse(req.params.comm);
	call("insert into communication (uid,izid,comamount)\
		values ("+comm.uid+","+comm.izid+","+comm.comamount+")\
		;",req,res);
});

// Add Communication (Send Irrigation Amount)
app.get('/db/add/comm/:comm/stop', function (req,res) {
	var comm = JSON.parse(req.params.comm);
	call("insert into communication (uid,izid,command,comamount)\
		values ("+comm.uid+","+comm.izid+",'Stop',0)\
		;",req,res);
});

// Get Communication between user and irrigation zone
app.get('/db/get/comm/:comm', function (req,res) {
	var comm = JSON.parse(req.params.comm);
	call("select *\
		from communication\
		where uid="+comm.uid+" and izid="+comm.izid+"\
		;",req,res);
});

// Update Communication status to Received
app.get('/db/update/comm/:comm/received', function (req,res) {
	var comm = JSON.parse(req.params.comm);
	call("update communication\
		set comstatus='Received', datereceived='now()'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});

// Update Communication to Irrigating
app.get('/db/update/comm/:comm/irrigating', function (req,res) {
	var comm = JSON.parse(req.params.comm);
	call("update communication\
		set comstatus='Irrigating'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});

// Update Communication to Finished
app.get('/db/update/comm/:comm/finished', function (req,res) {
	var comm = JSON.parse(req.params.comm);
	call("update communication\
		set comstatus='Finished'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});


/*************************************************************
 * ************************ ADMIN ****************************
 ************************* CONTROL ***************************
 *************************************************************
 */

// Add Crop Info
app.get('/db/admin/add/cropinfo/:admin', function (req,res) {
	var admin = JSON.parse(req.params.admin);
	call("insert into cropinfo (infoid,cropname,category,\
		lini,ldev,lmid,llate,total,\
		plantdate,region,kcini,kcmid,kcend,\
		maxcropheight,zr,p)\
		values("+admin.infoid+",'"+admin.cropname+"','"+admin.category+"',\
		"+admin.lini+","+admin.ldev+","+admin.lmid+","+admin.llate+","+admin.total+",\
		'"+admin.plantdate+"','"+admin.region+"',"+admin.kcini+","+admin.kcmid+","+admin.kcend+",\
		"+admin.maxcropheight+","+admin.zr+","+admin.p+")\
		;",req,res);
});

// Edit Crop Info
app.get('/db/admin/edit/cropinfo/:admin', function (req,res) {
	var admin = JSON.parse(req.params.admin);
	call("update cropinfo \
		set cropname='"+admin.cropname+"',category='"+admin.category+"',\
		lini="+admin.lini+",ldev="+admin.ldev+",lmid="+admin.lmid+",llate="+admin.llate+",total="+admin.total+",\
		plantdate='"+admin.plantdate+"',region='"+admin.region+"',\
		kcini="+admin.kcini+",kcmid="+admin.kcmid+",kcend="+admin.kcend+",\
		maxcropheight="+admin.maxcropheight+",zr="+admin.zr+",p="+admin.p+"\
		where infoid="+admin.infoid+"\
		;",req,res);
});

// Make Farmer Admin
app.get('/db/admin/makeadmin/:admin', function (req,res) {
	var admin = JSON.parse(req.params.admin);
	call("update farmer\
		set typeofuser='Admin'\
		where uid="+admin.uid+"\
		;",req,res);
});

