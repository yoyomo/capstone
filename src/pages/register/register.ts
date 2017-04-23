import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
 
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
  createSuccess = false;
  registerCredentials = {
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmpassword: ''};
 
  constructor(private nav: NavController, private auth: AuthService,
   private alertCtrl: AlertController) {}
 
  public register() {
    if(this.registerCredentials.password === this.registerCredentials.confirmpassword) {

      this.auth.register(this.registerCredentials).subscribe(success => {
        if (success.name === "error") {
          this.showPopup("Error", success.detail);
        } else {
          //console.log("Registered user: "+success)
          console.log(success);
          this.createSuccess = true;
          this.auth.sendVerify(this.registerCredentials).subscribe(data => {
            this.showPopup("Success", "Account created. Please verify your account in the email we sent you at "+this.registerCredentials.email+"");
          });
        }
      },
      error => {
        this.showPopup("Error", error);
      });
    }else{
      this.showPopup("Error", "Passwords must match");
    }
  }
 
  showPopup(title, text) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: [
       {
         text: 'OK',
         handler: data => {
           if (this.createSuccess) {
             this.nav.popToRoot();
           }
         }
       }
     ]
    });
    alert.present();
  }
}