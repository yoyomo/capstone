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
	crop.cropstatus = crop.cropstatus.replace(' ','%20');
	accessDatabase('/db/update/crop/'
		+crop.cropid+'/'+crop.uid+'/'+crop.currentday+'/'+crop.currentet+'/'
		+crop.currentkc+'/'+crop.cumulativeet+'/'+crop.cropstatus, function(result){
			console.log('Updated crop '+crop.cropid+': day '+crop.currentday,crop.currentet,crop.currentkc,crop.cumulativeet);
	});

	if(crop.cumulativeet >= RAW){
		//alert user to irrigate
		crop.farmname = crop.farmname.replace(' ','%20');
		accessDatabase('/sendAlert/'+crop.email+'/'+crop.username+'/'+crop.cropname+'/'+crop.farmname,function(result){
			console.log('Alerted user '+crop.username+' at '+crop.email);
		});
	}
	// if(true){
	// 	//alert user to irrigate
	// 	crop.farmname = crop.farmname.replace(' ','%20');
	// 	accessDatabase('/sendAlert/'+'armando.ortiz1@upr.edu'+'/'+crop.username+'/'+crop.cropname+'/'+crop.farmname,function(r){});
	// }

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
		crop.cropstatus = 'Finished';
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

serverUpdate();
