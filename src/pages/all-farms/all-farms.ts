import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { Sorting } from "../../pipes/sorting";
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
crops: any = [];
pipes: [Sorting]
groups: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, public alertCtrl: AlertController) {

    this.user = this.auth.getUserInfo();
    console.log(this.user);
    this.auth.getUserCrops(this.user).subscribe(data => {
    this.crops = data; 
    //this.filter();
    this.okay();

       },
    error => {
      console.log(error);
    });
  }

okay(){

var group_to_values = this.crops.reduce(function(obj,item){
  obj[item.farmname] = obj[item.farmname] && obj[item.izname] || [] ;
    //obj[item.farmname] = obj[item.farmname] || [] ;
    obj[item.farmname].push(item.izname);
    //obj[item.farmname].push(item.cropname);
 
    return obj;
}, {});

var groups = Object.keys(group_to_values).map(function(key){
    return {farmname: key, izname: group_to_values[key]};


       
});

var pre = document.createElement('pre');
pre.innerHTML = 'groups:\n\n' + JSON.stringify(groups, null, 4);
document.body.appendChild(pre);

this.groups = groups;

console.log(groups);
console.log(group_to_values);
}

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

  home(){
    this.navCtrl.setRoot(HomePage)
  }

editFarm(crops){
  this.navCtrl.push(EditFarmPage, {
      crop: crops
    });

}
  editZone(crops){
    this.navCtrl.push(EditZonePage, {
      crop: crops
    });
 
           
 
    }
 
    deleteFarm(crop){
      let prompt = this.alertCtrl.create({
            title: 'Delete Farm',
            message: "All Zones and Crops under this farm will also be deleted. Are you sure you want to delete this Farm?",
            
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Delete',
                    handler: data => {
                       //add delete actions here
                    }
                }
            ]
        });
 
        prompt.present();  
 
    }

    deleteZone(crop){
      let prompt = this.alertCtrl.create({
            title: 'Delete Zone',
            message: "All  Crops under this farm will also be deleted. Are you sure you want to delete this Zone?",
            
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Delete',
                    handler: data => {
                       //add delete actions here
                    }
                }
            ]
        });
 
        prompt.present(); 
 
    }

    


}





    

