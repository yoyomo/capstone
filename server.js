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

app.get('/sendAlert/:email/:username/:cropname/:farmname',function(req,res){
	var alert = req.params;
	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'bulletinboarduprm@gmail.com', // sender address
	    to: alert.email, // list of receivers
	    subject: 'Your crop needs irrigation!', // Subject line
	    text: 'Hello '+alert.username+',\
	    \nYour '+alert.cropname+' crop at '+alert.farmname+' \
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
		from farmer natural join crop natural join cropinfo natural join irrigationzone natural join\
		farm natural join soilwatercharacteristics natural join latitude natural join longitude\
		where cropstatus='On Going'\
		;",req,res);
});

// Add to History
app.get('/db/add/history/:cropid/:uid/:recommendedet/:irrigatedet/:seasonday', function(req,res) {
	var history = req.params;
	call("insert into history (cropid,uid,recommendedet,irrigatedet,seasonday)\
		values ("+history.cropid+","+history.uid+",\
		"+history.recommendedet+","+history.irrigatedet+","+history.seasonday+")\
		;", req, res);
});

// Get Crop's History
app.get('/db/get/history/:cropid/:uid', function(req,res) {
	var history = req.params;
	call("select *\
		from history\
		where cropid="+history.cropid+" and uid="+history.uid+"\
		;", req, res);
});

// Edit Crop's History 
/*
 * WARNING: CHANGING A CROP'S HISTORY AFFECTS THE CUMULATIVE ET
 */
app.get('/db/edit/history/:histid/:cropid/:uid/:irrigatedet', function(req,res) {
	var history = req.params;

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

// Edit Farmer (used for settings/forgotten)
app.get('/db/edit/farmer/:uid/:email/:password/:username/:phonenumber/:fullname', function(req,res) {
	var farmer = req.params;
	var stringQuery = 
		"update farmer\
		set email='"+farmer.email+"',password='"+farmer.password+"',\
		username='"+farmer.username+"',phonenumber='"+farmer.phonenumber+"',\
		fullname='"+farmer.fullname+"'\
		where uid="+farmer.uid+"\
		;";
	call(stringQuery, req, res);
});

// Update Crop (called when new data is calculated everyday)
app.get('/db/update/crop/:cropid/:uid/:currentday/:currentet/:currentkc/:cumulativeet', function(req,res) {
	var crop = req.params;
	var stringQuery = 
		"update crop\
		set currentday="+crop.currentday+", currentet="+crop.currentet+",\
		cumulativeet="+crop.cumulativeet+", currentkc="+crop.currentkc+"\
		where cropid="+crop.cropid+" and uid="+crop.uid+"\
		;";
	call(stringQuery, req, res);
});

// Edit Farm
app.get('/db/edit/farm/:farmid/:uid/:farmname/:soiltype/:latindex/:lonindex', function (req,res) {
	var farm = req.params;
	call("update farm\
		set farmname='"+farm.farmname+"', soiltype='"+farm.soiltype+"',\
		latindex="+farm.latindex+", lonindex="+farm.lonindex+"\
		where farmid="+farm.farmid+" and uid="+farm.uid+"\
		;",req,res);
});

// Edit Irrigation Zone
app.get('/db/edit/iz/:izid/:uid/:farmid/:izname/:acres/:waterflow/:method/:eff', function (req,res) {
	var iz = req.params;
	call("update irrigationzone\
		set farmid="+iz.farmid+", izname='"+iz.izname+"', \
		acres="+iz.acres+", waterflow="+iz.waterflow+", \
		irrigationmethod='"+iz.method+"', irrigationefficiency="+iz.eff+"\
		where izid="+iz.izid+" and uid="+iz.uid+"\
		;",req,res);
});

/*************************************************************
 * ************************ HARDWARE *************************
 *********************** CONTROL SYSTEM **********************
 *************************************************************
 */

// Add Master Control
app.get('/db/add/mc/:farmid/:uid/:ipaddress', function (req,res) {
	var mc = req.params;
	call("insert into mastercontrol (farmid, uid, ipaddress)\
		values ("+mc.farmid+","+mc.uid+",'"+mc.ipaddress+"')\
		;",req,res);
});

// Get user's Master Control
app.get('/db/get/mc/:uid', function (req,res) {
	var mc = req.params;
	call("select *\
		from mastercontrol\
		where uid="+mc.uid+"\
		;",req,res);
});

// Edit user's Master Control
app.get('/db/edit/mc/:controlid/:uid/:farmid/:ipaddress', function (req,res) {
	var mc = req.params;
	call("update mastercontrol\
		set farmid="+mc.farmid+", ipaddress='"+mc.ipaddress+"'\
		where controlid="+mc.controlid+" and uid="+mc.uid+"\
		;",req,res);
});

// Add Valve to Master Control
app.get('/db/add/valve/:uid/:izid/:controlid/:valveid', function (req,res) {
	var valve = req.params;
	call("insert into valvecontrol (uid,izid,controlid,valveid)\
		values ("+valve.uid+","+valve.izid+","+valve.controlid+","+valve.valveid+")\
		;",req,res);
});

// Get user's Valves of a Master Control
app.get('/db/get/valve/:uid/:controlid', function (req,res) {
	var valve = req.params;
	call("select *\
		from valvecontrol\
		where uid="+valve.uid+" and controlid="+valve.controlid+"\
		;",req,res);
});

// Edit user's Valve
app.get('/db/edit/valve/:uid/:izid/:controlid/:valveid', function (req,res) {
	var valve = req.params;
	call("update valvecontrol\
		set valveid="+valve.valveid+"\
		where uid="+valve.uid+" and controlid="+valve.controlid+" and izid="+valve.izid+"\
		;",req,res);
});

// Add Communication (Send Irrigation Amount)
app.get('/db/add/comm/:uid/:izid/irrigate/:comamount', function (req,res) {
	var comm = req.params;
	call("insert into communication (uid,izid,comamount)\
		values ("+comm.uid+","+comm.izid+","+comm.comamount+")\
		;",req,res);
});

// Add Communication (Send Irrigation Amount)
app.get('/db/add/comm/:uid/:izid/stop', function (req,res) {
	var comm = req.params;
	call("insert into communication (uid,izid,command,comamount)\
		values ("+comm.uid+","+comm.izid+",'Stop',0)\
		;",req,res);
});

// Get Communication between user and irrigation zone
app.get('/db/get/comm/:uid/:izid', function (req,res) {
	var comm = req.params;
	call("select *\
		from communication\
		where uid="+comm.uid+" and izid="+comm.izid+"\
		;",req,res);
});

// Update Communication status to Received
app.get('/db/update/comm/:uid/:izid/received', function (req,res) {
	var comm = req.params;
	call("update communication\
		set comstatus='Received', datereceived='now()'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});

// Update Communication to Irrigating
app.get('/db/update/comm/:uid/:izid/irrigating', function (req,res) {
	var comm = req.params;
	call("update communication\
		set comstatus='Irrigating'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});

// Update Communication to Finished
app.get('/db/update/comm/:uid/:izid/finished', function (req,res) {
	var comm = req.params;
	call("update communication\
		set comstatus='Finished'\
		where comid=(select max(comid)\
			from communication\
			where uid="+comm.uid+" and izid="+comm.izid+")\
		;",req,res);
});

/*************************************************************
 * ************************ SERVER ***************************
 ************************** UPDATE ***************************
 *************************************************************
 */
const request = require('request');
const csv = require('csvtojson');
var http = require('http');

var urlET = 'http://academic.uprm.edu/hdc/GOES-PRWEB_RESULTS/reference_ET_PenmanMonteith/reference_ET_PenmanMonteith';
var urlRainfall = 'http://academic.uprm.edu/hdc/GOES-PRWEB_RESULTS/rainfall/rainfall'
var referenceET = [];
var rainfall = [];

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

function downloadFile(urlOfFile,day,callback){
	var matrix = [];

	return csv({noheader:true})
	.fromStream(request.get(urlOfFile + day + '.csv'))
	.on('csv',(csvRow, rowIndex)=>{
		// csvRow is an array
		matrix.push(csvRow);
	})
	.on('end',(error)=>{
		if(matrix.length < 101){
			console.log(day +'\'s file is not ready.');
			matrix = [];
			day--;
			downloadFile(urlOfFile,day,callback);
		}
		else{
			callback(matrix,day);
		}
		
	});
}

function getTodaysFiles(){
	var date = new Date();
	var today = date.yyyymmdd();
	today = parseInt(today);

	// Get Reference ET data
	downloadFile(urlET,today,function(matrix,day){
		referenceET = matrix;
		console.log(day+': ReferenceET downloaded into matrix.');

		// Get Rainfall data
		downloadFile(urlRainfall,day,function(matrix,day){
			rainfall = matrix;
			console.log(day+': Rainfall downloaded into matrix.');

			// Read All Crops
			readAllCrops();
		});
	});

	return;
}

function accessDatabase(restfulAPI,callback){
	return http.get({
        host: 'h2ocrop.herokuapp.com',
        path: restfulAPI
    }, function(response) {
    	response.setEncoding('utf8');
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var parsed;
            try{
                parsed = JSON.parse(body);
            }catch(error){
            	parsed = body;
            }
            callback(parsed);
        });
    });
}

function readAllCrops() {
    accessDatabase('/db/get/allcrops',function(result) {
    	var allcrops = result;
        for(var i=0;i<allcrops.length;i++){
        	updateNewData(allcrops[i]);
        }
    });

}

function updateNewData(crop){
	var calculated, irrigationDepth, Kc, adjusted,ETcadj,RAW;

	console.log('Updating data for crop '+crop.cropid+' ...');
	calculated = getIrrigationDepth(crop);
	irrigationDepth = calculated.irrigationDepth;
	Kc = calculated.Kc;
	crop.currentet = irrigationDepth;
	crop.currentkc = Kc;

	adjusted = adjustIrrigationDepth(crop);
	ETcadj = adjusted.ETcadj;
	RAW = adjusted.RAW;
	crop.cumulativeET += ETcadj;

	//update crop in database
	accessDatabase('/db/update/crop/'
		+crop.cropid+'/'+crop.uid+'/'+crop.currentday+'/'+crop.currentet+'/'
		+crop.currentkc+'/'+crop.cumulativeet, function(result){
			console.log('Updated crop '+crop.cropid+': day '+crop.currentday+crop.currentet,crop.currentkc,crop.cumulativeet);
	});

	// if(crop.cumulativeet >= RAW){
	// 	//alert user to irrigate
	// 	crop.farmname = crop.farmname.replace(' ','%20');
	// 	accessDatabase('/sendAlert/'+crop.email+'/'+crop.username+'/'+crop.cropname+'/'+crop.farmname,function(r){});
	// }
	if(true){
		//alert user to irrigate
		crop.farmname = crop.farmname.replace(' ','%20');
		accessDatabase('/sendAlert/'+'armando.ortiz1@upr.edu'+'/'+crop.username+'/'+crop.cropname+'/'+crop.farmname,function(r){});
	}

}

function getIrrigationDepth(crop){
	var latIndex, lonIndex, ETo, Kc, ETc, irrigationDepth;

	latIndex = crop.latindex-1;
	lonIndex = crop.lonindex-1;
	ETo = referenceET[latIndex][lonIndex];
	crop.currentday++;

	if(crop.currentday <= crop.lini){
		Kc = crop.kcini;
	}
	else if(crop.currentday <= (crop.lini + crop.ldev)){
		Kc = crop.kcini + ((crop.currentday - crop.lini) / crop.ldev) * (crop.kcmid - crop.kcini);
	}
	else if(crop.currentday <= (crop.lini+crop.ldev+crop.lmid)){
		Kc = crop.kcmid;
	}
	else if(crop.currentday <= (crop.lini+crop.ldev+crop.lmid+crop.llate)){
		Kc = crop.kcmid + ((crop.currentday - crop.lini+crop.ldev+crop.lmid) / crop.llate) * (crop.kcend - crop.kcmid);
	}
	else{
		Kc = crop.kcend;
		crop.status = 'Finished';
	}

	ETc = Kc * ETo;
	irrigationDepth = ETc - rainfall[latIndex][lonIndex];

	if(irrigationDepth < 0){
		irrigationDepth = 0;
	}
	return {irrigationDepth: irrigationDepth, Kc: Kc};
}

function adjustIrrigationDepth(crop){
	var TAW, p, RAW, ETcadj, Ks;
	crop.p = parseFloat(crop.p);
	crop.qfc = parseFloat(crop.qfc);
	crop.qwp = parseFloat(crop.qwp);
	crop.zr = parseFloat(crop.zr);

	TAW = 1000 * (crop.qfc - crop.qwp) * crop.zr;
	p = (crop.p) + (0.04 * (5 - crop.currentet));

	if(p < 0.1){
		p = 0.1;
	}
	else if(p > 0.8){
		p = 0.8;
	}

	RAW = p * TAW;

	if(crop.cumulativeet < RAW){
		Ks = 1;
	}
	else{
		Ks = (TAW - crop.cumulativeet) / (TAW - RAW);
	}

	ETcadj = Ks * crop.currentkc * crop.currentet;

	return {ETcadj: ETcadj, RAW: RAW};
}

//to be called once at ~2am everyday
function serverUpdate(){
	getTodaysFiles();
}

setInterval(function(){
	var hour = new Date().getHours();
	if(hour == 2){
		serverUpdate();
	}
}, 1000*60);