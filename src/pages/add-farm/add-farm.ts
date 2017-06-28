import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';

 
declare var google;

@Component({
  selector: 'page-add-farm',
  templateUrl: 'add-farm.html'
})
export class AddFarmPage {

@ViewChild('map') mapElement: ElementRef;
map: any;
user: any = [];
soilTypes: any = [];
latitudes: any = [];
longitudes: any = [];
latitude: number = 0;
longitude:number = 0;

public farm = {uid: 0, farmname : '', soiltype: '', latindex: 0, lonindex: 0};

  // Initializes soils, latitudes and longitudes, and loads map
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public viewCtrl: ViewController, public geolocation: Geolocation, 
    private auth: AuthService, public alertCtrl: AlertController) {
    var user = this.auth.getUserInfo();
    this.farm.uid = user.uid;

    this.auth.getSoils().subscribe(data => {
      this.soilTypes = data;
    },
    error => {
      console.log(error);
    });

    this.auth.getLatitudes().subscribe(data => {
      this.latitudes = data;
      this.auth.getLongitudes().subscribe(data => {
        this.longitudes = data;
        this.farm.latindex = Math.floor(this.latitudes.length/2);
        this.farm.lonindex = Math.floor(this.longitudes.length/2);
        this.latitude = this.latitudes[this.farm.latindex-1].latcoordinate;
        this.longitude = this.longitudes[this.farm.lonindex-1].loncoordinate;
        this.reloadMapWithInput();

        this.getGPS();
      },
      error => {
        console.log(error);
      });
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
      if (this.auth.isDebug()) console.log(GPS);
      //GPS = this.accommodateGPS(GPS);
      if (this.auth.isDebug()) console.log(GPS);
      this.latitude = GPS.latitude;
      this.longitude = GPS.longitude;
      this.reloadMapWithInput();
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
    this.loadMap(this.latitudes[this.farm.latindex-1].latcoordinate,
     this.longitudes[this.farm.lonindex-1].loncoordinate);
  }

  // Loads map with new input coordinates
  reloadMapWithInput(){
    this.loadMap(this.latitude,this.longitude);
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

  // Completes the operation and adds a Farm to the User
  addFarm() {
    var coords = { latitude: this.latitude,
                  longitude: this.longitude};
    this.accommodateGPS(coords);
    this.auth.addFarm(this.farm).subscribe(data => {
        console.log("Farm added.");
        this.navCtrl.pop();
      },
      error => {
        console.log(error);
      });
  }

  // Displays information needed to help guide the User
  info(){
    let prompt = this.alertCtrl.create({
          title: 'Information',
          message: `
        <ul>
          <li> Enter prefered farm name in the indicated field</li>
          <li> Select a "Soil Type" from the drop down menu. If not sure of farm soil type, select one similar to what
          is observed.</li>
          <li> Press GPS Location button to aquire current farm location. Latitudes and Longitudes may be changed 
          by the user.</li>
                 
         <li> Save information by pressing the "Add Farm" button found at the bottom of the page.</li>
      
        </ul>
        <ul>
        For more detailed information about H2O Crop see our user manual found in the side menu.
                 
        </ul>
      `,
          buttons: [
              {
                  text: 'Done'
              }
              
          ]
      });

      prompt.present();  

  }
  
  
  }


