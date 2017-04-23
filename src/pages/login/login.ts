import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { RegisterPage } from '../register/register';
import { HomePage } from '../home/home';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
 
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  loading: Loading;
  registerCredentials = {usernameORmail: '', password: ''};
 
  constructor(private nav: NavController, private auth: AuthService, private alertCtrl: AlertController, private loadingCtrl: LoadingController) {
   
   var user = JSON.parse(localStorage.getItem("loggedInUser"));
    if(user){
      if(user.uid){
        this.auth.createUser(user.uid, user.fullname, user.username, user.email, user.password);
        this.nav.setRoot(HomePage);
      }
    } 
  }
 
  public createAccount() {
    this.nav.push(RegisterPage);
  }

  public forgotPassword() {
    this.nav.push(ForgotPasswordPage);
  }
 
  public login() {
    var user;
    this.showLoading();
    this.auth.login(this.registerCredentials).subscribe(data => {
      user = data[0];
      if (user) {
        if(user.verified==='Yes') {
          console.log('Logged in: '+user.fullname);
          this.auth.createUser(user.uid, user.fullname, user.username, user.email, user.password);
          setTimeout(() => {
            localStorage.setItem("loggedInUser",JSON.stringify(user));
          this.loading.dismiss();
          this.nav.setRoot(HomePage);
          });
        }
        else if (user.verified==='No'){
          console.log("User not verified.");
          this.auth.sendVerify(user).subscribe(data => {
            this.showError("Account is not verified.\n\
           Please check your email and click the verify button.");
          },
          error => {
            this.showError(error);
          });
        }

      } else {
        this.showError("Access Denied!\n\
          User does not exist. Please Create New Account.");
      }
    },
    error => {
      this.showError(error);
    });


  }
 
  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }
 
  showError(text) {
    setTimeout(() => {
      this.loading.dismiss();
    });
 
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }
}