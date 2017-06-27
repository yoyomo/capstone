/*************************************************************
 * ************************ SET UP ***************************
 *************************************************************
 */

var express = require('express');
var app = express();
var cors = require('cors');
var CryptoJS = require('crypto-js');
var hashkey = 'h2ocrop2017ICOM5047';
const setup = require('./updateServer.js');

app.use(express.static('www'));
app.use(cors());
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET,DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

app.set('port', process.env.PORT || 8080);
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

app.get('/send/alert/:alert',function(req,res){
	var alert = decryptToJSON(req.params.alert);
	var unsubscribe = setup.encrypt({"email":alert.email});
	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'h2ocrop.pr@gmail.com', // sender address
	    to: alert.email, // list of receivers
	    subject: 'Your crop needs irrigation!', // Subject line
	    //text: ''
	   	
	    //, // plaintext body
	    html: '<p>\
	    Hello '+alert.username+',\
	    <br><br>Your '+alert.cropname+' crop at '+alert.farmname+' \
	    needs irrigation.\
	    <br><br>Please use the \
	    <a href="https://h2ocrop.herokuapp.com">H2OCrop</a> \
	    application to irrigate the crop.\
	   	<br><br><br><small>If you wish to stop recieving alerts, \
	   	<a href="https://h2ocrop.herokuapp.com/db/unsubscribe/'+unsubscribe+'">Unsubscribe</a>\
	   	</p>'
	   	// html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	    res.writeHead(200, {'Content-Type': 'text/plain'});
		res.status(200).write(JSON.stringify({"message":"Alerted user "+alert.username+" at " + alert.email}, null, "    "));
		res.end();
	});
});
app.get('/send/verify/:verify',function(req,res){
	var verify = decryptToJSON(req.params.verify);
	var account = setup.encrypt({"email":verify.email});
	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'h2ocrop.pr@gmail.com', // sender address
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
	    <form action="https://h2ocrop.herokuapp.com/db/verifyaccount/'+account+'">\
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
		or click <a href="https://h2ocrop.herokuapp.com/db/verifyaccount/'+account+'">here</a>\
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

app.get('/send/forgotpassword/:forgotpassword',function(req,res){
	var forgotpassword = decryptToJSON(req.params.forgotpassword);
	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'h2ocrop.pr@gmail.com', // sender address
	    to: forgotpassword.email, // list of receivers
	    subject: 'Your new H2OCrop password', // Subject line
	    // text: 'Hello '+verify.username+',\
	    // \n\nPlease verify your account by clicking\
	    // '
	    // , // plaintext body
	    html: '<h1>H2OCrop</h1>\
	    </br></br>\
	    <p>Hello '+forgotpassword.email+',</br></br>\
	    Below you will find your new password. Please change in settings\
	     to not forget again. </br></br>'+forgotpassword.password+'\
	     \n\nPlease use the H2OCrop application to login and change the password.\
	   	\nhttp://h2ocrop.herokuapp.com\
	    </p>' // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('New password sent to ' + forgotpassword.email);
	    res.writeHead(200, {'Content-Type': 'text/plain'});
		res.status(200).write(JSON.stringify({"message":"New password sent to " + forgotpassword.email}, null, "    "));
		res.end();
	});
});

/*************************************************************
 * ************************ SET UP **************************
 *************************************************************
 */

// Update New Crop

app.get('/db/update/newcrop/:crop', function (req,res) {
	var crop = decryptToJSON(req.params.crop);
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

function callWithMessage(stringQuery,res,message){
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
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.status(200).write(message);
		res.end();  
	});
}
function decrypt(encryptedString){
	var decrypted = CryptoJS.AES.decrypt(encryptedString,hashkey);
	decrypted = decrypted.toString(CryptoJS.enc.Utf8);
	console.log(decrypted);
	return decrypted;
}

function decryptToJSON(encryptedJSONString) {
	return JSON.parse(decrypt(encryptedJSONString));
}

function encrypt(data){
	return CryptoJS.AES.encrypt(data,hashkey).toString();
}

app.get('/crypt/:crypto', function (req,res) {
	var crypto = encrypt(req.params.crypto);
	console.log(crypto);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.status(200).write(JSON.stringify(decryptToJSON(crypto)), null, "    ");
	res.end();
});

// Sign Up
app.get('/db/add/farmer/:farmer', function (req,res) {
	var farmer = decryptToJSON(req.params.farmer);
	call("insert into farmer (fullname, email, username, password)\
		values ('"+farmer.fullname+"','"+farmer.email+"',LOWER('"+farmer.username+"'),\
		crypt('"+farmer.password+"',gen_salt('bf',8)))\
		;",req,res);
});

// Verify Account
app.get('/db/verifyaccount/:verify', function (req,res) {
	var verify = decryptToJSON(req.params.verify);
	callWithMessage("update farmer\
		set verified='Yes'\
		where email='"+verify.email+"'\
		returning 'Account has successfully been verified! Please proceed to log in in the h2ocrop application or at https://h2ocrop.herokuapp.com' as message\
		;",res,'<p>\
		Account has successfully been verified! <br><br>\
		Please proceed to log in in the h2ocrop application <br>\
		or at <a href="https://h2ocrop.herokuapp.com">h2ocrop</a>\
		</p>');

}); 

// Forgot Password
app.get('/db/forgotpassword/:forgotpassword', function(req,res) {
	var forgotpassword = decryptToJSON(req.params.forgotpassword);
	var stringQuery = 
		"update farmer\
		set password=crypt('"+forgotpassword.password+"',gen_salt('bf',8))\
		where email='"+forgotpassword.email+"'\
		returning *\
		;";
	call(stringQuery, req, res);
});

// Unsubscribe from mail
app.get('/db/unsubscribe/:unsubscribe', function(req,res) {
	var unsubscribe = decryptToJSON(req.params.unsubscribe);
	var stringQuery = 
		"update farmer\
		set mailsubscription='Unsubscribed'\
		where email='"+unsubscribe.email+"'\
		returning 'User account successfully unsubscribed from mail.' as message\
		;";
	callWithMessage(stringQuery,res,
		'User account successfully unsubscribed from mail.');
});

// Subscribe to mail
app.get('/db/subscribe/:subscribe', function(req,res) {
	var subscribe = decryptToJSON(req.params.subscribe);
	var stringQuery = 
		"update farmer\
		set mailsubscription='Subscribed'\
		where email='"+subscribe.email+"'\
		returning 'User account successfully subscribed to mail.' as message\
		;";
	call(stringQuery,req,res);
});

// Log In login
app.get('/db/get/farmer/:farmer', function (req,res) {
	var farmer = decryptToJSON(req.params.farmer);
	call("select *\
		from farmer\
		where (LOWER(username)=LOWER('"+farmer.usernameORemail+"') or\
		 email='"+farmer.usernameORemail+"') \
		and password=crypt('"+farmer.password+"',password)\
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
	var farm = decryptToJSON(req.params.farm);
	call("insert into farm (uid,farmname,soiltype,latindex,lonindex)\
		values ("+farm.uid+",'"+farm.farmname+"',\
		'"+farm.soiltype+"',"+farm.latindex+","+farm.lonindex+")\
		;",req,res);
});

// Get user's farms
app.get('/db/get/farms/:farms', function (req,res) {
	var farms = decryptToJSON(req.params.farms);
	call("select *\
		from farm\
		where uid="+farms.uid+"\
		order by farmid desc\
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
	var iz = decryptToJSON(req.params.iz);
	call("insert into irrigationzone \
		(farmID,uID,izname,acres,waterflow,irrigationMethod,irrigationEfficiency)\
		values ("+iz.farmid+","+iz.uid+",'"+iz.izname+"',"+iz.acres+",\
		"+iz.waterflow+",'"+iz.irrigationmethod+"',"+iz.irrigationefficiency+")\
		;",req,res);
});

// Get user's irrigation zones by farm
app.get('/db/get/iz/:iz', function (req,res) {
	var iz = decryptToJSON(req.params.iz);
	call("select *\
		from irrigationzone\
		where farmid="+iz.farmid+" and uid="+iz.uid+"\
		order by izid desc\
		;",req,res);
});

// Get user's irrigation zones by farm
app.get('/db/get/izs/:izs', function (req,res) {
	var izs = decryptToJSON(req.params.izs);
	call("select *\
		from irrigationzone\
		where uid="+izs.uid+"\
		order by izid desc\
		;",req,res);
});

// Get all crop info
app.get('/db/get/cropinfo/', function (req,res) {
	call("select *\
		from cropinfo\
		order by category asc, infoid asc\
		;",req,res);
});

// Get all crop info categories
app.get('/db/get/cropinfo/category/', function (req,res) {
	call("select category\
		from cropinfo\
		group by category\
		order by category asc\
		;",req,res);
});



// Add Crop
app.get('/db/add/crop/:crop', function (req,res) {
	var crop = decryptToJSON(req.params.crop);
	call("insert into crop (izid,uid,infoid)\
		values ("+crop.izid+","+crop.uid+","+crop.infoid+")\
		;",req,res);
});

// Get logged in user
app.get('/db/get/farmer/:farmer', function (req,res) {
	var farmer = decryptToJSON(req.params.farmer);
	call("select *\
		from farmer\
		where uid="+farmer.uid+"\
		;",req,res);
});

// Get all user's crops
app.get('/db/get/crops/:crops', function (req,res) {
	var crops = decryptToJSON(req.params.crops);
	call("select *\
		from crop natural join farm natural join irrigationzone natural join cropinfo\
		where uid="+crops.uid+"\
		order by crop.dateplanted,crop.cropstatus desc\
		;",req,res);
});

// Edit Crop
app.get('/db/edit/crop/:crop', function (req,res) {
	var crop = decryptToJSON(req.params.crop);
	call("update crop\
		set izid="+crop.izid+",infoid="+crop.infoid+"\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;",req,res);
});

// Read Specific Crop Information
app.get('/db/get/crop/:crop', function (req,res) {
	var crop = decryptToJSON(req.params.crop);
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
	var history = decryptToJSON(req.params.history);
	call("insert into history (cropid,uid,recommendedet,irrigatedet,seasonday,rainfall)\
		values ("+history.cropid+","+history.uid+",\
		"+history.recommendedet+","+history.irrigatedet+","+history.seasonday+",\
		"+history.rainfall+")\
		;", req, res);
});

// Add to History Automatically
app.get('/db/add/auto/history/:history', function(req,res) {
	var history = decryptToJSON(req.params.history);
	call("insert into history (cropid,uid,recommendedet,irrigatedet,seasonday,histdate,rainfall)\
		values ("+history.cropid+","+history.uid+",\
		"+history.recommendedet+","+history.irrigatedet+","+history.seasonday+",\
		'"+history.histdate+"',"+history.rainfall+")\
		;", req, res);
});

// Get Crop's History
app.get('/db/get/history/:history', function(req,res) {
	var history = decryptToJSON(req.params.history);
	call("select *\
		from history\
		where cropid="+history.cropid+" and uid="+history.uid+"\
		order by histdate asc\
		;", req, res);
});

// Edit Crop's History 
/*
 * WARNING: CHANGING A CROP'S HISTORY AFFECTS THE CUMULATIVE ET
 */
app.get('/db/edit/history/:history', function(req,res) {
	var history = decryptToJSON(req.params.history);

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
	var farmer = decryptToJSON(req.params.farmer);
	var stringQuery = 
		"update farmer\
		set email='"+farmer.email+"',password=crypt('"+farmer.password+"',gen_salt('bf',8)),\
		username=LOWER('"+farmer.username+"'), fullname='"+farmer.fullname+"',\
		mailsubscription='"+farmer.mailsubscription+"'\
		where uid="+farmer.uid+" and password=crypt('"+farmer.currentpassword+"',password)\
		returning *\
		;";
	call(stringQuery, req, res);
});

// Update Crop (called when new data is calculated everyday)
app.get('/db/update/crop/:crop', function(req,res) {
	var crop = decryptToJSON(req.params.crop);
	var stringQuery = 
		"update crop\
		set currentday="+crop.currentday+", currentet="+crop.currentet+",\
		cumulativeet="+crop.cumulativeet+", currentkc="+crop.currentkc+",\
		cropstatus='"+crop.cropstatus+"',\
		rainfall="+crop.rainfall+", outofrange='"+crop.outofrange+"'\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;";
	call(stringQuery, req, res);
});

// Update All Other Crops (called when a crop has been irrigated2
app.get('/db/update/allothercrops/:crop', function(req,res) {
	var crop = decryptToJSON(req.params.crop);
	var stringQuery = 
		"with allOtherCrops as (update crop\
		set cumulativeet=cumulativeet-"+crop.irrigatedet+"\
		where izid="+crop.izid+" and cropid != "+crop.cropid+"\
		returning *) \
		insert into history (uid,cropid,recommendedet,irrigatedet,seasonday,rainfall)\
			select allOtherCrops.uid,allOtherCrops.cropid,\
			allOtherCrops.cumulativeet+"+crop.irrigatedet+","+crop.irrigatedet+",allOtherCrops.currentday,allOtherCrops.rainfall\
			from allOtherCrops\
		;";
	call(stringQuery, req, res);
});

// Edit Farm
app.get('/db/edit/farm/:farm', function (req,res) {
	var farm = decryptToJSON(req.params.farm);
	call("update farm\
		set farmname='"+farm.farmname+"', soiltype='"+farm.soiltype+"',\
		latindex="+farm.latindex+", lonindex="+farm.lonindex+"\
		where farmid="+farm.farmid+" and uid="+farm.uid+"\
		;",req,res);
});

// Edit Irrigation Zone
app.get('/db/edit/iz/:iz', function (req,res) {
	var iz = decryptToJSON(req.params.iz);
	call("update irrigationzone\
		set farmid="+iz.farmid+", izname='"+iz.izname+"', \
		acres="+iz.acres+", waterflow="+iz.waterflow+", \
		irrigationmethod='"+iz.irrigationmethod+"', irrigationefficiency="+iz.irrigationefficiency+"\
		where izid="+iz.izid+" and uid="+iz.uid+"\
		;",req,res);
});

// Delete User's Crop
app.get('/db/delete/crop/:crop', function (req,res) {
	var crop = decryptToJSON(req.params.crop);
	call("delete from crop\
		where cropid="+crop.cropid+" and uid="+crop.uid+" and izid="+crop.izid+"\
		;",req,res);
});

// Delete User's Irrigation Zone
app.get('/db/delete/iz/:iz', function (req,res) {
	var iz = decryptToJSON(req.params.iz);
	call("delete from irrigationzone\
		where uid="+iz.uid+" and farmid="+iz.farmid+" and izid="+iz.izid+"\
		;",req,res);
});

// Delete User's Farm
app.get('/db/delete/farm/:farm', function (req,res) {
	var farm = decryptToJSON(req.params.farm);
	call("delete from farm\
		where uid="+farm.uid+" and farmid="+farm.farmid+"\
		;",req,res);
});

/*************************************************************
 * ************************ HARDWARE *************************
 *********************** CONTROL SYSTEM **********************
 *************************************************************
 */

// Add Master Control
app.get('/db/add/mc/:mc', function (req,res) {
	var mc = decryptToJSON(req.params.mc);
	call("insert into mastercontrol (farmid, uid, ipaddress)\
		values ("+mc.farmid+","+mc.uid+",'"+mc.ipaddress+"')\
		;",req,res);
});

// Get user's Master Control
app.get('/db/get/mc/:mc', function (req,res) {
	var mc = decryptToJSON(req.params.mc);
	call("select *\
		from mastercontrol\
		where uid="+mc.uid+" and farmid="+mc.farmid+"\
		;",req,res);
});

// Edit user's Master Control
app.get('/db/edit/mc/:mc', function (req,res) {
	var mc = decryptToJSON(req.params.mc);
	call("update mastercontrol\
		set farmid="+mc.farmid+", ipaddress='"+mc.ipaddress+"'\
		where controlid="+mc.controlid+" and uid="+mc.uid+"\
		;",req,res);
});

// Add Valve to Master Control
app.get('/db/add/valve/:valve', function (req,res) {
	var valve = decryptToJSON(req.params.valve);
	call("insert into valvecontrol (uid,izid,controlid,valveid)\
		values ("+valve.uid+","+valve.izid+","+valve.controlid+","+valve.valveid+")\
		;",req,res);
});

// Get user's Valves of a Master Control
app.get('/db/get/valve/:valve', function (req,res) {
	var valve = decryptToJSON(req.params.valve);
	call("select *\
		from valvecontrol\
		where uid="+valve.uid+" and controlid="+valve.controlid+" and \
		izid="+valve.izid+"\
		;",req,res);
});

// Edit user's Valve
app.get('/db/edit/valve/:valve', function (req,res) {
	var valve = decryptToJSON(req.params.valve);
	call("update valvecontrol\
		set valveid="+valve.valveid+"\
		where uid="+valve.uid+" and controlid="+valve.controlid+" and izid="+valve.izid+"\
		;",req,res);
});

// Edit user's Valve & Master Control
app.get('/db/edit/valve/control/:valve', function (req,res) {
	var valve = decryptToJSON(req.params.valve);
	call("update valvecontrol\
		set valveid="+valve.valveid+", controlid="+valve.controlid+" \
		where uid="+valve.uid+" and izid="+valve.izid+"\
		;",req,res);
});

// Delete user's Master Control
app.get('/db/delete/mc/:mc', function (req,res) {
	var mc = decryptToJSON(req.params.mc);
	call("delete from mastercontrol\
		where controlid="+mc.controlid+"\
		;",req,res);
});

// Delete user's Valve Control
app.get('/db/delete/valve/:valve', function (req,res) {
	var valve = decryptToJSON(req.params.valve);
	call("delete from valvecontrol\
		where uid="+valve.uid+" and izid="+valve.izid+" \
		and controlid="+valve.controlid+"\
		;",req,res);
});

// Get Crop's IP Address and valve id
app.get('/db/get/crop/control/:crop', function (req,res) {
	var crop = decryptToJSON(req.params.crop);
	call("select *\
		from crop natural join irrigationzone natural join farm \
		natural join valvecontrol natural join mastercontrol\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;",req,res);
});

// Add Communication (Send Irrigation Amount)
app.get('/db/add/comm/:comm', function (req,res) {
	var comm = decryptToJSON(req.params.comm);
	call("insert into communication (uid,izid,comamount)\
		values ("+comm.uid+","+comm.izid+","+comm.comamount+")\
		;",req,res);
});

// Add Communication (Stop Irrigation)
app.get('/db/add/comm/stop/:comm', function (req,res) {
	var comm = decryptToJSON(req.params.comm);
	call("insert into communication (uid,izid,command,comamount)\
		values ("+comm.uid+","+comm.izid+",'Stop',0)\
		;",req,res);
});

// Get Communication between user and irrigation zone
app.get('/db/get/comm/:comm', function (req,res) {
	var comm = decryptToJSON(req.params.comm);
	call("select *\
		from communication natural join mastercontrol natural join valvecontrol\
		where uid="+comm.uid+" and izid="+comm.izid+"\
		;",req,res);
});

// Update Communication status to Received
app.get('/db/update/comm/received/:comm', function (req,res) {
	var comm = decryptToJSON(req.params.comm);
	call("update communication\
		set comstatus='Received', datereceived='now()'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});

// Update Communication to Irrigating
app.get('/db/update/comm/irrigating/:comm', function (req,res) {
	var comm = decryptToJSON(req.params.comm);
	call("update communication\
		set comstatus='Irrigating'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});

// Update Communication to Finished
app.get('/db/update/comm/finished/:comm', function (req,res) {
	var comm = decryptToJSON(req.params.comm);
	call("update communication\
		set comstatus='Finished'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});

// ******TEMP***********
// Send irrigation to microcontrol
app.get('/micro/:comm', function (req,res) {
	var comm = decryptToJSON(req.params.comm);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.status(200).write(JSON.stringify({"status":"received"}, null, "    "));
	res.end(); 
});


/*************************************************************
 * ************************ ADMIN ****************************
 ************************* CONTROL ***************************
 *************************************************************
 */

// Add Crop Info
app.get('/db/admin/add/cropinfo/:admin', function (req,res) {
	var admin = decryptToJSON(req.params.admin);
	call("insert into cropinfo (cropname,category,\
		lini,ldev,lmid,llate,total,\
		plantdate,region,kcini,kcmid,kcend,\
		maxcropheight,zr,p)\
		values('"+admin.cropname+"','"+admin.category+"',\
		"+admin.lini+","+admin.ldev+","+admin.lmid+","+admin.llate+","+admin.total+",\
		'"+admin.plantdate+"','"+admin.region+"',"+admin.kcini+","+admin.kcmid+","+admin.kcend+",\
		"+admin.maxcropheight+","+admin.zr+","+admin.p+")\
		;",req,res);
});

// Edit Crop Info
app.get('/db/admin/edit/cropinfo/:admin', function (req,res) {
	var admin = decryptToJSON(req.params.admin);
	call("update cropinfo \
		set cropname='"+admin.cropname+"',category='"+admin.category+"',\
		lini="+admin.lini+",ldev="+admin.ldev+",lmid="+admin.lmid+",llate="+admin.llate+",total="+admin.total+",\
		plantdate='"+admin.plantdate+"',region='"+admin.region+"',\
		kcini="+admin.kcini+",kcmid="+admin.kcmid+",kcend="+admin.kcend+",\
		maxcropheight="+admin.maxcropheight+",zr="+admin.zr+",p="+admin.p+"\
		where infoid="+admin.infoid+"\
		;",req,res);
});

// Delete Crop Info
app.get('/db/admin/delete/cropinfo/:admin', function (req,res) {
	var admin = decryptToJSON(req.params.admin);
	call("delete from cropinfo \
		where infoid="+admin.infoid+"\
		;",req,res);
});

// // Make Farmer Admin
// app.get('/db/admin/makeadmin/:admin', function (req,res) {
// 	var admin = decryptToJSON(req.params.admin);
// 	call("update farmer\
// 		set typeofuser='Admin'\
// 		where uid="+admin.uid+"\
// 		;",req,res);
// });

