import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { HomePage } from '../home/home';
import { EditFarmPage } from '../edit-farm/edit-farm';
import { EditZonePage } from '../edit-zone/edit-zone';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-all-farms',
  templateUrl: 'all-farms.html'
  
})
export class AllFarmsPage {

  user: any = [];
  farms: any = [];
  // pipes: [Sorting]

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, public alertCtrl: AlertController) {

    this.user = this.auth.getUserInfo();
    this.auth.getUserFarms(this.user).subscribe(data => {
      this.farms = data;
      for(var i =0;i< this.farms.length; i++){
        this.auth.getUserZones(this.farms[i]).subscribe(data => {
          this.includeZonesToFarm(data);
        },
        error => {
          console.log(error);
        });
      }
    },
    error => {
      console.log(error);
    });
  }

  includeZonesToFarm(data){
    var lostIndex;
    if(data[0]) {
      this.farms.find(function(item, i){
        if(item.farmid === data[0].farmid){
          lostIndex = i;
          return i;
        }
      });
      this.farms[lostIndex].zones = data;
    }
  }

  home() {
    this.navCtrl.setRoot(HomePage)
  }

  editFarm(farm){
    this.navCtrl.push(EditFarmPage, {
      farm: farm
    });
  }
  editZone(zone){
    this.navCtrl.push(EditZonePage, {
      zone: zone
    });
  }
 
  deleteFarm(farm){
    let prompt = this.alertCtrl.create({
          title: 'Delete Farm?',
          message: "All Irrigation Zones & Crops & History under this Farm will also be deleted. Are you sure you want to delete this Farm?",
          
          buttons: [
              {
                  text: 'Cancel'
              },
              {
                  text: 'Delete',
                  handler: data => {
                    this.auth.deleteFarm(farm).subscribe(data => {
                      console.log("Farm & all its irrigation zones & \
                        all its crops & all its histories deleted.");
                      this.navCtrl.setRoot(AllFarmsPage);
                    },
                    error => {
                      console.log(error);
                    });
                  }
              }
          ]
      });

      prompt.present();  

  }

  deleteZone(zone){
    let prompt = this.alertCtrl.create({
          title: 'Delete Irrigation Zone?',
          message: "All Crops & History under this Irrigation Zone will also be deleted. Are you sure you want to delete this Irrigation Zone?",
          
          buttons: [
              {
                  text: 'Cancel'
              },
              {
                  text: 'Delete',
                  handler: data => {
                    this.auth.deleteIrrigationZone(zone).subscribe(data => {
                      console.log("Irrigation Zone & all its crops & \
                        all its histories deleted.");
                      this.navCtrl.setRoot(AllFarmsPage);
                    },
                    error => {
                      console.log(error);
                    });
                  }
              }
          ]
      });

      prompt.present(); 

  }

    
// okay(){

// var group_to_values = this.crops.reduce(function(obj,item){
//   obj[item.farmname] = obj[item.farmname] && obj[item.izname] || [] ;
//     //obj[item.farmname] = obj[item.farmname] || [] ;
//     obj[item.farmname].push(item.izname);
//     //obj[item.farmname].push(item.cropname);
 
//     return obj;
// }, {});

// var groups = Object.keys(group_to_values).map(function(key){
//     return {farmname: key, izname: group_to_values[key]};


       
// });

// var pre = document.createElement('pre');
// pre.innerHTML = 'groups:\n\n' + JSON.stringify(groups, null, 4);
// document.body.appendChild(pre);

// this.groups = groups;

// console.log(groups);
// console.log(group_to_values);
// }

// filter(){
    
// // var cars = [],
// //     result = this.crops.reduce(function (r, a) {
// //         r[a.cropname] = r[a.cropname] || [];
// //         r[a.cropname].push(a);
// //         return r;
// //     }, Object.create(null));

// // console.log(result);
// var groupArray = require('group-array');
// groupArray(this.crops, 'farmname', 'izname', 'cropname');
// console.log(groupArray);
// }

}





    

