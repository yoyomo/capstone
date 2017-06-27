import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ViewController, Loading, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';

declare var google;

@Component({
  selector: 'page-edit-farm',
  templateUrl: 'edit-farm.html'
})
export class EditFarmPage {

@ViewChild('map') mapElement: ElementRef;
map: any;
soilTypes: any = [];
latitudes: any = [];
longitudes: any = [];
farm = {uid: 0, farmid: '', farmname : '', soiltype: '', latindex: '', lonindex: ''};
mastercontrols: any = [];
mastercontrol: any = {
  controlid: '',
  ipaddress: '',
  uid: '',
  farmid: ''
};

loadingSoils: Loading;
loadingLat: Loading;
loadingLon: Loading;

  // Initializes soils, latitudes and longitudes, and loads map
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public viewCtrl: ViewController, public geolocation: Geolocation, 
    private auth: AuthService, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) {
    this.farm = this.navParams.get("farm");
    console.log(this.farm);

    this.showLoadingSoils();
    this.auth.getSoils().subscribe(data => {
      this.soilTypes = data;
      this.closeLoadingSoils();
    },
    error => {
      console.log(error);
    });

    this.showLoadingLat();
    this.auth.getLatitudes().subscribe(data => {
      this.latitudes = data;
      this.closeLoadingLat();
      this.showLoadingLon();
      this.auth.getLongitudes().subscribe(data => {
        this.longitudes = data;
        this.closeLoadingLon();
        this.reloadMap();
      },
      error => {
        console.log(error);
      });
    },
    error => {
      console.log(error);
    });

    this.loadMasterControl();

    
  }

  // Completes the operation and edits the User's Farm
  editFarm() {

    this.auth.editFarm(this.farm).subscribe(data => {
        console.log("Farm edited.");
        this.navCtrl.pop();
      },
      error => {
        console.log(error);
      });
  }

  // Gets the GPS location of the User
  getGPS(){
    this.geolocation.getCurrentPosition().then((position) => {
      var GPS = { latitude: position.coords.latitude,
                  longitude: position.coords.longitude};
                  console.log(GPS);
      GPS = this.accommodateGPS(GPS);
      console.log(GPS);
      this.loadMap(GPS.latitude,GPS.longitude);
    }, (err) => {
      console.log(err);
    } );

  }

  // Accommodates the given latitudes and longitudes to the ones available at
  // the Hyroclimate Data Center
  accommodateGPS(GPS) {
    var latIndex, lonIndex, diff1, diff2;

    //Latitude Operation
    for (latIndex = 0; GPS.latitude > this.latitudes[latIndex].latcoordinate;latIndex++);
    if (GPS.latitude === this.latitudes[latIndex].latcoordinate){
      GPS.latitude = this.latitudes[latIndex].latcoordinate;
      this.farm.latindex = latIndex + 1;
    }
    else {
      if(latIndex === 0){
        console.log("GPS out of Puerto Rico.");
        return GPS;
      }
      diff1 = GPS.latitude - this.latitudes[latIndex-1].latcoordinate;
      diff2 = this.latitudes[latIndex].latcoordinate - GPS.latitude;
      if(diff1 < diff2){
        GPS.latitude = this.latitudes[latIndex-1].latcoordinate;
        this.farm.latindex = latIndex;
      }
      else{
        GPS.latitude = this.latitudes[latIndex].latcoordinate;
        this.farm.latindex = latIndex + 1;
      }
    }

    //Longitude Operation
    for (lonIndex = 0; GPS.longitude > this.longitudes[lonIndex].loncoordinate; lonIndex++);
    if (GPS.longitude === this.longitudes[lonIndex].loncoordinate){
      GPS.longitude = this.longitudes[lonIndex].loncoordinate;
      this.farm.lonindex = lonIndex + 1;
    }
    else {
      if(lonIndex === 0){
        console.log("GPS out of Puerto Rico.");
        return GPS;
      }
      diff1 = GPS.longitude - this.longitudes[lonIndex-1].loncoordinate;
      diff2 = this.longitudes[lonIndex].loncoordinate - GPS.longitude;
      if(diff1 < diff2){
        GPS.longitude = this.longitudes[lonIndex-1].loncoordinate;
        this.farm.lonindex = lonIndex;
      }
      else{
        GPS.longitude = this.longitudes[lonIndex].loncoordinate;
        this.farm.lonindex = lonIndex + 1;
      }
    }

    return GPS;
  }

  // Loads map with new coordinates
  reloadMap(){
    this.loadMap(this.latitudes[parseInt(this.farm.latindex)-1].latcoordinate,
     this.longitudes[parseInt(this.farm.lonindex)-1].loncoordinate);
  }

  // Loads map with given coordinates
  loadMap(lat,lon){
    let latLng = new google.maps.LatLng(lat, lon);
 
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker(); 
  }

  // Adds a marker indicating the specified location
  addMarker(){
   
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
   
    let content = "<h4>Your Farm's location</h4>"; 
    
    this.addInfoWindow(marker, content);           
    
  }

  // Displays information when user clicks on marker
  addInfoWindow(marker, content){
   
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
   
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }

  /*
   * Dislays all loading screens
   */
  showLoadingSoils() {
    this.loadingSoils = this.loadingCtrl.create({
      content: "Loading Soils..."
    });
    this.loadingSoils.present();
  }

  closeLoadingSoils(){
    console.log("Soils loaded.");
    this.loadingSoils.dismiss();
  }

  showLoadingLat() {
    this.loadingLat = this.loadingCtrl.create({
      content: "Loading Latitudes..."
    });
    this.loadingLat.present();
  }

  closeLoadingLat(){
    console.log("Latitudes loaded.");
    this.loadingLat.dismiss();
  }

  showLoadingLon() {
    this.loadingLon = this.loadingCtrl.create({
      content: "Loading Longitudes..."
    });
    this.loadingLon.present();
  }

  closeLoadingLon(){
    console.log("Longitudes loaded.");
    this.loadingLon.dismiss();
  }

  // Load the MasterControls in the farm
  loadMasterControl() {
    this.auth.getMasterControl(this.farm).subscribe(data => {
      this.mastercontrols = data;
      this.mastercontrol.uid = this.farm.uid;
      this.mastercontrol.farmid = this.farm.farmid;
    },
    error => {
      console.log(error);
    });
  }

  // Displays the IP addess of the chosen MasterControl
  getIP(){
    if(this.mastercontrol.controlid==='new') return;

    for(var i=0; i<this.mastercontrols.length;i++){
      if(this.mastercontrols[i].controlid===this.mastercontrol.controlid){
        this.mastercontrol.ipaddress = this.mastercontrols[i].ipaddress;
      }
    }
  }

  // Edits the IP address of the chosen MasterControl
  editMasterControl() {
    this.auth.editMasterControl(this.mastercontrol).subscribe(data => {
      if(data.length != 0){
        console.log(data);
        this.showPopup('ERROR',data.detail);
      }
      else{
        console.log('Master Control edited.');
        this.loadMasterControl();
        this.showPopup('Success!','Master Control edited.');
      }
    },
    error => {
      console.log(error);
    });
  }

  // Adds a new MasterControl
  addMasterControl() {
    this.auth.addMasterControl(this.mastercontrol).subscribe(data => {
      if(data.length != 0){
        console.log(data);
        this.showPopup('ERROR',data.detail);
      }
      else{
        console.log('Master Control added.');
        this.loadMasterControl();
        this.showPopup('Success!','Master Control added.');
      }
    },
    error => {
      console.log(error);
    });
  }

  // Deletes a chosen MasterControl
  deleteMasterControl() {
    this.auth.deleteMasterControl(this.mastercontrol).subscribe(data => {
      if(data.length != 0){
        console.log(data);
        this.showPopup('ERROR',data.detail);
      }
      else{
        console.log('Master Control deleted.');
        this.loadMasterControl();
        this.mastercontrol.controlid='';
      }
    },
    error => {
      console.log(error);
    });
  }

  // Confirms that the user wants to delete the MasterControl
  showConfirmDelete(){
     let prompt = this.alertCtrl.create({
          title: 'Delete Master Control?',
          message: 'Deleting this master control will also delete the underlying valve controls. Are you sure you want to delete this master control?',
          
          buttons: [
              {
                text: 'Cancel'
              },
              {
                text: 'Delete',
                handler: data => {
                  this.deleteMasterControl();
                }
              }
          ]
      });

      prompt.present();  

  }

  // Displays a message as a popup
  showPopup(title,message){
     let prompt = this.alertCtrl.create({
          title: title,
          message: message,
          
          buttons: [
              {
                text: 'OK'
              }
          ]
      });

      prompt.present();  

  }

  

}
