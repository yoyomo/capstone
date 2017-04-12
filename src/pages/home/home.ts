import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { AddFarmPage } from '../add-farm/add-farm';
import { IrrigationZonePage } from '../irrigation-zone/irrigation-zone';
import { AddPage } from '../add/add';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';
import { DailyRecPage } from '../daily-rec/daily-rec';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

farmName = " ";
farmZone = " ";
farmCrop = " ";

user: any = [];

notes: any = [];

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth: AuthService, public alertCtrl: AlertController) {
    
    this.user = this.auth.getUserInfo();
    console.log(this.user);
    this.auth.getUserCrops(this.user).subscribe(data => {
      this.notes = data;
      console.log(this.notes);
    },
    error => {
      console.log(error);
    });
    

  }

  launcharAddPage(){
    let addModal = this.modalCtrl.create(AddPage);

    addModal.onDidDismiss((data)=>{
      if (data != null){
      console.log("Data =>", data);
      this.farmName = data.farmName
      this.farmZone = data.irrigationZone
      this.farmCrop = data.crop
      this.notes.push(data);}
      else{
        // don't add anything
      }
 
      })
    addModal.present();
 
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
                        let index = this.notes.indexOf(note);
 
                        if(index > -1){
                          this.notes[index] = data;
                        }
                    }
                }
            ]
        });
 
        prompt.present();       
 
    }
 
    deleteNote(note){
 
        let index = this.notes.indexOf(note);
 
        if(index > -1){
            this.notes.splice(index, 1);
        }
    }

    public dailyRec(note){
    this.navCtrl.push(DailyRecPage, note)

  }


}
