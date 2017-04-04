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
forgotPasswordCredentials = {name: '', lastName: '', username: '', email: '', password: ''};

  constructor(private nav: NavController, private auth: AuthService, 
  private alertCtrl: AlertController, private loadingCtrl: LoadingController) {}



 
  
 public resetPassword() {
   this.auth.forgotPassword(this.forgotPasswordCredentials).subscribe(success => {
      if (success) {
        setTimeout(() => {
          
         this.emailSentSuccess = true;
          this.showPopup("Success", "Email Sent.")
        });
      } else {
        this.emailSentSuccess = false;
        this.showPopup("Error", "try agian.")
        //this.emailSentSuccess = false;
        //this.showPopup("Error", "Email does not exist.");
      }
    },
    error => {
      this.showPopup("Error","error");
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

