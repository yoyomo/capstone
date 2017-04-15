import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
 
declare var google;

@Component({
  selector: 'page-add-farm',
  templateUrl: 'add-farm.html'
})
export class AddFarmPage {

@ViewChild('map') mapElement: ElementRef;
map: any;


public farmInfo = { farmName: '', soilType: '', lattitude: '', longitude: ''  };
public lat: number = 0;
public lng: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public geolocation: Geolocation) {}

  ionViewDidLoad() {
    console.log(this.navParams.get('title'));
    this.loadMap();
    
  }

closeModal(){
  
   this.viewCtrl.dismiss(this.farmInfo);

}

closeModal1(){
  
   this.viewCtrl.dismiss();

}

loadMap(){
 
   this.geolocation.getCurrentPosition().then((position) => {
 
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
  
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.addMarker(); 
      //this.addFarmLocation();

    }, (err) => {
      console.log(err);
    } );

}

 addFarmLocation(){
  

 }



addMarker(){
 
  let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: this.map.getCenter()
  });
 
  let content = "<h4>Information!</h4>"; 
  
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


