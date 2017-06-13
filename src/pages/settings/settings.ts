import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { AllCropInfoPage } from '../all-cropinfo/all-cropinfo';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  edit: boolean;
  changePassword: boolean;

  verifyPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  settings: any = {uid: 0, fullname : '', username: '', email: '', password: ''};


  constructor(public navCtrl: NavController, public navParams: NavParams,
   private auth: AuthService,public alertCtrl: AlertController) {
  
    this.settings = this.auth.getUserInfo();
   
  }

  showPopup(title, text) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: [{text: 'OK'}]
    });
    alert.present();
  }

  allCrops() {
    this.navCtrl.push(AllCropInfoPage);
  } 

  enable(){
    this.edit = true;
  }

  cancel(){
    this.edit = false;
    this.settings = this.auth.getUserInfo();
  }

  save(){
    
    //make sure current password is verified
    // if(this.verifyPassword===this.settings.password){
      this.settings.currentpassword = this.settings.password;
      //make sure change of password is desired
      if (this.changePassword) {
        if(this.newPassword && this.confirmNewPassword){
          if(this.newPassword===this.confirmNewPassword){
            this.settings.password = this.newPassword;
          }
          else{
            this.showPopup("New Password must be confirmed","If change of password is\
            desired, both New Password and Confirm New Password must match.");
            return;
          }
        }
        else{
          this.showPopup("New Password must be confirmed","If change of password is\
            desired, both New Password and Confirm New Password must match.");
          return;
        }
      }

      this.auth.editFarmer(this.settings).subscribe(data => {
        console.log("Settings saved.");
        //update local storage and authservice
        this.auth.createUser(this.settings.uid,this.settings.fullname,
          this.settings.username,this.settings.email,this.settings.password,
           this.settings.typeofuser);
        localStorage.setItem("loggedInUser",JSON.stringify(this.auth.getUserInfo()));
        this.edit = false;
      },
      error => {
        console.log(error);
        this.showPopup("Current Password must be verified","If change of settings is\
             desired, your account's password must be filled.");
      });
    // }
    // else{ // password was not met
    //   this.showPopup("Current Password must be verified","If change of settings is\
    //         desired, your account's password must be filled.");
    //       return;
    // }
  }
}


