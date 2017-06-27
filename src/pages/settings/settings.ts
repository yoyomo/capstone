import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  edit: boolean;
  changePassword: boolean;
  username = '';
  mailsubscription: boolean;
  verifyPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  settings: any = {uid: 0, fullname : '', username: '', email: '', password: '', currentpassword: '', mailsubscription: ''};


  constructor(public navCtrl: NavController, public navParams: NavParams,
   private auth: AuthService,public alertCtrl: AlertController) {
      this.settings = this.auth.getUserInfo();
      if(this.settings.mailsubscription === 'Subscribed')
        this.mailsubscription = true;
      else if (this.settings.mailsubscription === 'Unsubscribed')
        this.mailsubscription = false;
      this.username = this.settings.username;
  }



  // Displays a message as a popup
  showPopup(title, text) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: [{text: 'OK'}]
    });
    alert.present();
  }

  // Enables Edit Mode
  enable(){
    this.edit = true;
  }

  // Cancels Edit Mode
  cancel(){
    this.edit = false;
    this.settings = JSON.parse(localStorage.getItem("loggedInUser"));
    this.auth.createUser(this.settings.uid, this.settings.fullname, this.settings.username,
     this.settings.email, this.settings.password, this.settings.typeofuser, this.settings.mailsubsciption);
  }

  // Saves any updated data
  save(){
    
    //make sure current password is verified
    // if(this.verifyPassword===this.settings.password){
      this.settings.currentpassword = this.verifyPassword;
      this.settings.password = this.settings.currentpassword;

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

      if(this.mailsubscription) 
        this.settings.mailsubscription = 'Subscribed';
      else 
        this.settings.mailsubscription = 'Unsubscribed';

      this.auth.editFarmer(this.settings).subscribe(data => {
        
        if(data.length===0){
          this.showPopup("Current Password must be verified","If change of settings is\
             desired, your account's current password must be filled.");
        }
        else if(typeof data[0] === 'undefined'){
          console.log(data);
          this.showPopup("Username already exists","the new username is already being used by another user");
        }
        else{
          console.log("Settings saved.");
          //update local storage and authservice
          if (this.auth.isDebug()) console.log(data[0]);
          this.auth.createUser(data[0].uid,data[0].fullname,
            data[0].username,data[0].email,data[0].password,
             data[0].typeofuser, data[0].mailsubscription);
          localStorage.setItem("loggedInUser",JSON.stringify(this.auth.getUserInfo()));
          this.verifyPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
          this.settings = this.auth.getUserInfo();
          this.changePassword = false;
          this.edit = false;
        }
      },
      error => {
        console.log(error);
      });
    // }
    // else{ // password was not met
    //   this.showPopup("Current Password must be verified","If change of settings is\
    //         desired, your account's password must be filled.");
    //       return;
    // }
  }
}


