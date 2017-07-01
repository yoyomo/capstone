import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/*
  Generated class for the Guide page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-guide',
  templateUrl: 'guide.html'
})
export class GuidePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,  private iab:InAppBrowser) {}

  ionViewDidLoad() {
    this.info();
  }

  // Loads PDF
  info(){
    const browser = this.iab.create('https://drive.google.com/file/d/0B3Z6VcmEaTdPTVJBLWtUOG5Ld28/view?usp=sharing');
    browser.show();
  }

}
