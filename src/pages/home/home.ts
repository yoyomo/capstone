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
md: any = [];



 
  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth: AuthService, public alertCtrl: AlertController) {
    
    this.user = this.auth.getUserInfo();
    console.log(this.user);
    this.auth.getUserCrops(this.user).subscribe(data => {
      this.crops = data; 
      //this.md = data; 
      //this.filter();
      console.log(this.crops);
      //console.log(this.md);
        },
    error => {
      console.log(error);
    });
    

  }

// filter(){
    
// var cars = [{ make: 'audi', model: 'r8', year: '2012' }, { make: 'audi', model: 'rs5', year: '2013' }, { make: 'ford', model: 'mustang', year: '2012' }, { make: 'ford', model: 'fusion', year: '2015' }, { make: 'kia', model: 'optima', year: '2012' }],
//     result = this.md.reduce(function (r, a) {
//         r[a.category] = r[a.category] || [];
//         r[a.category].push(a);
//         return r;
//     }, Object.create(null));

// console.log(result);




// var myArray = [
//     {group: "one", color: "red"},
//     {group: "two", color: "blue"},
//     {group: "one", color: "green"},
//     {group: "one", color: "black"}
// ];

// var group_to_values = myArray.reduce(function(obj,item){
//     obj[item.group] = obj[item.group] || [];
//     obj[item.group].push(item.color);
//     return obj;
// }, {});

// var groups = Object.keys(group_to_values).map(function(key){
//     return {group: key, color: group_to_values[key]};
// });

// var pre = document.createElement('pre');
// pre.innerHTML = 'groups:\n\n' + JSON.stringify(groups, null, 4);
// document.body.appendChild(pre);



// var res = myArray.reduce(function(groups, currentValue) {
//     if ( groups.indexOf(currentValue.group) === -1 ) {
//       groups.push(currentValue.group);
//     }
//     return groups;
// }, []).map(function(group) {
//     return {
//         group: group,
//         color: myArray.filter(function(_el) {
//           return _el.group === group;
//         }).map(function(_el) { return _el.color; })
//     }
// });


// }

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
