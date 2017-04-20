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

inputDisabled: boolean;
unHide: boolean;

  fullname = '';
  username = '';
  email = '';
  password = '';
  settings: any = [];

  public userInfo = {uid: 1, fullname : '', username: '', email: '', password: ''};


  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService,public alertCtrl: AlertController) {
  
    let info = this.auth.getUserInfo();
    this.fullname = info.fullname;
    this.username = info.username;
    this.email = info.email;
    this.password = info.password;
    this.settings.push(info);
   
  }

 settingsDone() {
  
    this.navCtrl.setRoot(HomePage)
  }  
enable(){
  this.inputDisabled = true;
  this.unHide = true;
}

cancel(){
  this.inputDisabled = false;
  this.unHide = false;
}

save(){
  this.inputDisabled = false;
  this.unHide = false;
}
}


