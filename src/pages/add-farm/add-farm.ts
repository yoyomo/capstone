import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AuthService } from '../../providers/auth-service';

 
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

public farm = {uid: 0, farmname : '', soiltype: '', latindex: 0, lonindex: 0};

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public viewCtrl: ViewController, public geolocation: Geolocation, 
    private auth: AuthService) {
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
        this.farm.latindex = 1;
        this.farm.lonindex = 1;
        this.reloadMap();
      },
      error => {
        console.log(error);
      });
    },
    error => {
      console.log(error);
    });
  }

  addFarm() {

    this.auth.addFarm(this.farm).subscribe(data => {
        console.log("Farm added.");
        this.navCtrl.pop();
      },
      error => {
        console.log(error);
      });
  }

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

  reloadMap(){
    this.loadMap(this.latitudes[this.farm.latindex-1].latcoordinate,
     this.longitudes[this.farm.lonindex-1].loncoordinate);
  }

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

  addMarker(){
   
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
   
    let content = "<h4>Your Farm's location</h4>"; 
    
    this.addInfoWindow(marker, content);           
    
  }

  addInfoWindow(marker, content){
   
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
   
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
   
  }
  
  
  }


