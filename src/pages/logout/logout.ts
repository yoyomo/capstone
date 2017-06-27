import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { AuthService } from '../../providers/auth-service';

@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html',
})
export class LogoutPage {

  // Logs out the user
  constructor(public navCtrl: NavController, public navParams: NavParams, 
  	private auth: AuthService) {
  	this.auth.logout();
  	this.navCtrl.setRoot(LoginPage);
  }

}
