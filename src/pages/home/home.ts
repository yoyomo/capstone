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

fullname = '';
username = '';
email = '';
password = '';

notes: any = [];

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth: AuthService, public alertCtrl: AlertController) {
    
    let info = this.auth.getUserInfo();
    console.log(info);
    this.fullname = info.fullname;
    this.username = info.username;
    this.email = info.email;
    this.password = info.password;

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
        this.notes.push({    
        farmName: " ",
        farmZone: " ",
        farmCrop: " "
                         });
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

    public dailyRec(notes){
    this.navCtrl.push(DailyRecPage, notes)

  }


}
