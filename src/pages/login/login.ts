import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, MenuController } from 'ionic-angular';
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
 
   //Checks if user is already logged in
  constructor(private nav: NavController,private menuCtrl: MenuController, private auth: AuthService, private alertCtrl: AlertController, private loadingCtrl: LoadingController) {
   this.menuCtrl.enable(false);

   var user = JSON.parse(localStorage.getItem("loggedInUser"));
    if(user){
      if(user.uid){
        this.auth.createUser(user.uid, user.fullname, user.username, user.email, user.password, user.typeofuser, user.mailsubscription);
        this.nav.setRoot(HomePage);
      }
    } 
  }
 
 // Opens Create Account Page
  public createAccount() {
    this.nav.push(RegisterPage);
  }

  // Opens Forgot Password page
  public forgotPassword() {
    this.nav.push(ForgotPasswordPage);
  }
 
 // Tries to log in the user
  public login() {
    var user;
    this.showLoading();
    this.auth.login(this.registerCredentials).subscribe(data => {
      user = data[0];
      if (user) {
        if(user.verified==='Yes') {
          console.log('Logged in: '+user.username);
          this.auth.createUser(user.uid, user.fullname, user.username, user.email, user.password, user.typeofuser, user.mailsubscription);
          setTimeout(() => {
            localStorage.setItem("loggedInUser",JSON.stringify(user));
          this.loading.dismiss();
          this.nav.setRoot(HomePage);
          });
        }
        else if (user.verified==='No'){
          console.log("User not verified.");
          this.auth.sendVerify(user).subscribe(data => {
            this.showError("Account is not verified!",
           "Please look for the email we sent you and click the verify button to verify your account.\n If no email from h2ocrop is found please check the junk mail. \n");
          },
          error => {
            this.showError("Fail!",error);
          });
        }

      } else {
        this.showError("Access Denied!",
          "username or password not found. If you are new, please Create New Account.");
      }
    },
    error => {
      this.showError('Fail!',error);
    });


  }
 
   // Shows Loading Screen
  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }
 
   // Displays an error
  showError(title,text) {
    setTimeout(() => {
      this.loading.dismiss();
    });
 
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }
}