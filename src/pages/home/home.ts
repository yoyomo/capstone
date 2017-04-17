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

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth: AuthService, public alertCtrl: AlertController) {
    
    this.user = this.auth.getUserInfo();
    console.log(this.user);
    this.auth.getUserCrops(this.user).subscribe(data => {
      this.crops = data;
      console.log(this.crops);
    },
    error => {
      console.log(error);
    });
    

  }

  launcharAddPage(){
    this.navCtrl.push(AddPage);
  }

  dailyRec(crop){
    this.navCtrl.push(DailyRecPage, {
      crop: crop
    });

  }

editNote(note){
 
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
 
    deleteNote(crop){
 
        let index = this.crops.indexOf(crop);
 
        if(index > -1){
            this.crops.splice(index, 1);
        }
    }


}
