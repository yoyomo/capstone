import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { AddPage } from '../add/add';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';
import { DailyRecPage } from '../daily-rec/daily-rec';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

user: any = [];
crops: any = [];
farms: any = [];

zone: any = {
  izid: '',
  farmid: '',
  uid: '',
  izname: '',
  acres: '',
  waterflow: '',
  irrigationmethod: '',
  irrigationefficiency: '',
  crops: []
};

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth: AuthService, public alertCtrl: AlertController) {
    
    this.user = this.auth.getUserInfo();
    console.log(this.user);
    this.auth.getUserCrops(this.user).subscribe(data => {
      this.crops = data; 
      console.log(this.crops);
      this.sortCards();
    },
    error => {
      console.log(error);
    });
    

  }

  sortCards() {
    var info:any = [], farmIndex,zoneIndex;
    for(var i = this.crops.length-1; i >= 0; i--){
      info = this.crops[i];

      //create farm in farms if not existing and get farmIndex
      //create zone in farm if not existing and get zoneIndex
      //add crop to zone
      farmIndex = this.getFarmIndex(info);
      zoneIndex = this.getZoneIndex(info,farmIndex);
      this.farms[farmIndex].zones[zoneIndex].crops.push(info);
    }


  }

  //passes farm & zon values from info to current farm & zone
  passFarm(farmInfo) {
    return {
      farmid : farmInfo.farmid,
      uid : farmInfo.uid,
      farmname : farmInfo.farmname,
      soiltype : farmInfo.soiltype,
      latindex : farmInfo.latindex,
      lonindex : farmInfo.lonindex,
      zones : []
    };
  }

  //passes farm & zon values from info to current farm & zone
  passZone(zoneInfo) {
    return {
      izid : zoneInfo.izid,
      farmid : zoneInfo.farmid,
      uid : zoneInfo.uid,
      izname : zoneInfo.izname,
      acres : zoneInfo.acres,
      waterflow : zoneInfo.waterflow,
      irrigationmethod : zoneInfo.irrigationmethod,
      irrigationefficiency : zoneInfo.irrigationefficiency,
      crops: []
    };
  }

  //returns index of farm in farms
  getFarmIndex(info) {
    var farmFound, farmIndex;
    farmFound = this.farms.find(function(item, i){
      if(item.farmid === info.farmid){
        farmIndex = i;
        return i;
      }
    });
    if(!farmFound){
      this.farms.push(this.passFarm(info));
      farmIndex = 0;
    }
    
    console.log(farmFound);
    console.log(farmIndex);
    return farmIndex;

  }

  //returns index of zone in farm
  getZoneIndex(info, farmIndex){
    var zoneFound, zoneIndex;
    zoneFound = this.farms[farmIndex].zones.find(function(item, i){
      if(item.izid === info.izid){
        zoneIndex = i;
        return i;
      }
    });
    if(!zoneFound){
      this.farms[farmIndex].zones.push(this.passZone(info));
      zoneIndex = 0;
    }
    
    console.log(zoneFound);
    console.log(zoneIndex);
    return zoneIndex;
  }

  launcharAddPage(){
    this.navCtrl.push(AddPage);
  }

  dailyRec(crop){
    this.navCtrl.push(DailyRecPage, {
      crop: crop
    });

  }

editCrop(note){
 
        let prompt = this.alertCtrl.create({
            title: 'Edit Note',
            inputs: [{
                 name: 'farmName',
                 value: note.farmName
           },
            {
                name: "irrigationZone",
                value: note.irrigationZone
            },
            {
                name: 'crop',
                value: note.crop
            }],
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Save',
                    handler: data => {
                        let index = this.crops.indexOf(note);
 
                        if(index > -1){
                          this.crops[index] = data;
                        }
                    }
                }
            ]
        });
 
        prompt.present();       
 
    }
 
    deleteCrop(crop){
 
        let index = this.crops.indexOf(crop);
 
        if(index > -1){
            this.crops.splice(index, 1);
        }
    }


}
