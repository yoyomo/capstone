/*************************************************************
 * ************************ SERVER ***************************
 ************************** UPDATE ***************************
 *************************************************************
 */
const request = require('request');
const csv = require('csvtojson');
var http = require('http');
var CryptoJS = require('crypto-js');

var urlET = 'http://academic.uprm.edu/hdc/GOES-PRWEB_RESULTS/reference_ET_PenmanMonteith/reference_ET_PenmanMonteith';
var urlRainfall = 'http://academic.uprm.edu/hdc/GOES-PRWEB_RESULTS/rainfall/rainfall'
var referenceET = [];
var rainfall = [];
var setup = false;
var newCrop = [];

// Returns a date in yyymmdd format
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

// Downloads a file from a specified url
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

// Downloads all necessary files from the Hydroclimate Data Center
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

			if(!setup){
				// Read All Crops
				readAllCrops();
			}else{
				updateNewData(newCrop);
			}
		});
	});

	return;
}

// Calls the RESTful API initialized at server.js
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

// Exports the encryptToString function for external use
exports.encrypt = function(data){
	return encryptToString(data);
}

// Encrypts any JSON data to a string
function encryptToString(data) {
	var encrypted;
	encrypted = CryptoJS.AES.encrypt(JSON.stringify(data),'h2ocrop2017ICOM5047').toString();
	encrypted = clearURL(encrypted);
	return encrypted;
}

// Gets all On Going crops from the database
// and updates the history and the crop data 
// with the newly acquired files
function readAllCrops() {
    accessDatabase('/db/get/allcrops',function(result) {
    	var allcrops = result;
        for(var i=0;i<allcrops.length;i++){
        	//updateHistory(allcrops[i]);
        	updateNewData(allcrops[i]);
        }
    });
}

// Prepares a string for URL launch
function clearURL(string){
	string = string.split('%').join('%25');
	string = string.split('/').join('%2F');
	string = string.split(' ').join('%20');
	return string;
}

// Prepares a JSON variable for URL launch
function clearJSON(data){
	for(d in data){
		if(typeof data[d] === "string") {
			data[d] = clearURL(data[d]);
		}
	}
}

// Makes sure the history of the crop is being updated every day
function updateHistory(crop) {
	var prevDay, rec, history = [];

	//store values before launching asynchronous call
	// to avoid update of new data
	prevDay = crop.currentday;
	rec = crop.cumulativeet;

	// check if it has been irrigated
	accessDatabase('/db/get/history/'+encryptToString(crop), function(result){

		history = result[result.length-1];
		if(!history) { //there is no history... make first
			history = {
				cropid: crop.cropid,
				uid: crop.uid,
				seasonday: prevDay - 1,
				recommendedet: 0,
				irrigatedet: 0
			};
			
		}

		if(prevDay > history.seasonday){
			history.recommendedet = rec;
			history.irrigatedet = 0; // assumes it was not irrigated
			history.seasonday = prevDay;
			history.rainfall = crop.rainfall;

			var date = new Date();
			date.setDate(date.getDate() - 1);
			date.setHours(23,59,59);
			history.histdate = date;
			
			accessDatabase('/db/add/auto/history/'+encryptToString(history), function(result) {
				console.log('Updated history of crop '+history.cropid+
				' rec '+history.recommendedet+
				' irrigated '+history.irrigatedet+
				' for day '+history.seasonday+
				' at '+history.histdate);
			});
		}
	});
}

// Updates a crop's ETc and notifies the user if it has exceeded the Readily Available Water (RAW)
function updateNewData(crop){
	var calculated, irrigationDepth, Kc, rainfall, adjusted,ETcadj,RAW;
	var olddata = {
		currentet: crop.currentet,
		cumulativeet: crop.cumulativeet,
		rainfall: crop.rainfall,
		currentday: crop.currentday
	};

	console.log('Updating data for crop '+crop.cropid+' ...');
	calculated = getIrrigationDepth(crop);
	irrigationDepth = calculated.irrigationDepth;
	Kc = calculated.Kc;
	rainfall = calculated.rainfall;
	crop.currentet = irrigationDepth;
	crop.currentkc = Kc;
	crop.rainfall = rainfall;

	adjusted = adjustIrrigationDepth(crop);
	ETcadj = adjusted.ETcadj;
	RAW = adjusted.RAW;
	crop.cumulativeet += ETcadj;

	if(crop.cropid==58){

	//checks if farm is out of range (NaN)
	if(!crop.currentet){
		//reverts everything back
		console.log("Crop "+crop.cropid+" is out of range");
		crop.currentet = olddata.currentet;
		crop.cumulativeet = olddata.cumulativeet;
		crop.rainfall = olddata.rainfall;
		crop.currentday = olddata.currentday;
		crop.outofrange = 'Yes';
	}
	else{
		crop.outofrange = 'No';
	}

	//update crop in database
	accessDatabase('/db/update/crop/'+encryptToString(crop), function(result){
		console.log('Updated crop '+crop.cropid+': day '+crop.currentday+
			' ETc '+crop.currentet+' Kc '+crop.currentkc+' Cumu '+crop.cumulativeet,
			' rainfall '+crop.rainfall);
		console.log(result);
	});
}

	if(crop.cumulativeet >= RAW){
		//check if user is subscribed
		if (crop.mailsubscription==='Subscribed') {
			//alert user to irrigate
			accessDatabase('/send/alert/'+encryptToString(crop),function(result){
				console.log(result.message);
			});
		}
	}

}

// Calculates the Kc and the ETc of a crop
function getIrrigationDepth(crop){
	var latIndex, lonIndex, ETo, Kc, ETc, irrigationDepth;
	crop.kcini = parseFloat(crop.kcini);
	crop.kcmid = parseFloat(crop.kcmid);
	crop.kcend = parseFloat(crop.kcend);
	crop.lini = parseFloat(crop.lini);
	crop.ldev = parseFloat(crop.ldev);
	crop.lmid = parseFloat(crop.lmid);
	crop.llate = parseFloat(crop.llate);

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
		crop.cropstatus = 'Finished';
	}

	ETc = Kc * ETo;
	irrigationDepth = ETc;

	return {irrigationDepth: irrigationDepth, Kc: Kc,
	 rainfall: rainfall[latIndex][lonIndex]};
}

// Adjusts the ETc according to the Readily Available Water (RAW)
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

	ETcadj = Ks * crop.currentet;

	return {ETcadj: ETcadj, RAW: RAW};
}

//to be called once at ~2am everyday
exports.serverUpdate = function(){
	setup = false;
	getTodaysFiles();
}

// To be called when a user creates a new crop and clicks it for the first time
exports.serverUpdateNewCrop = function(crop){
	setup = true;
	newCrop = crop;
	console.log(newCrop);
	getTodaysFiles();
}