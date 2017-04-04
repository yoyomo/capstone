import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
originalSets: any;

  name = "";
 lastName = '';
  username = '';
  email = '';
  password = '';

  settings: any = [];


  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService,public alertCtrl: AlertController) {

    let info = this.auth.getUserInfo();
    this.name = info.name;
    this.lastName = info.lastName;
    this.username = info.username;
    this.email = info.email;
    this.password = info.password;
    this.settings.push(info);
   
  }

 settingsDone() {
  
    this.navCtrl.setRoot(HomePage)
  }

  // editNote(){
 
  //       let prompt = this.alertCtrl.create({
  //           title: 'Edit Note',
  //           inputs: [{
  //               name: 'title'
  //           }],
  //           buttons: [
  //               {
  //                   text: 'Cancel'
  //               },
  //               {
  //                   text: 'Save',
  //                   handler: data => {
  //                       let index = this.notes.indexOf(note);
 
  //                       if(index > -1){
  //                         this.notes[index] = data;
  //                       }
  //                   }
  //               }
  //           ]
  //       });
 
  //       prompt.present();       
 
  //   }
  }


