import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { LoadingController, Loading } from 'ionic-angular';

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {

emailSentSuccess = false;
forgotPasswordCredentials = { email: '',password: ''};

  constructor(private nav: NavController, private auth: AuthService, 
  private alertCtrl: AlertController, private loadingCtrl: LoadingController) {}
  
 public resetPassword() {
   //reset the password

  this.auth.forgotPassword(this.forgotPasswordCredentials).subscribe(data => {
    this.auth.sendForgotPassword(this.forgotPasswordCredentials).subscribe(data => {
      if (data) {
        setTimeout(() => {
          
         this.emailSentSuccess = true;
          this.showPopup("Success", "Email Sent.")
        });
      } else {
        this.emailSentSuccess = false;
        this.showPopup("Error", "try again.")
      }
    },
    error => {
      this.showPopup("Error",error);
    });
  },
  error => {
    this.showPopup("Error",error);
  });
  }


  showPopup(title, text) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: [
       {
         text: 'OK',
         handler: data => {
           if (this.emailSentSuccess) {
             this.nav.popToRoot();
           }
         }
       }
     ]
    });
    alert.present();
  }
}

