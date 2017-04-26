import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AllCropsPage } from '../all-crops/all-crops';

@Component({
  selector: 'page-add-crops',
  templateUrl: 'add-crops.html'
})
export class AddCropsPage {

  public cropInfo = { infoid: '', cropname: '', category: '',lini: '',
		ldev: '', lmid: '', llate: '', total: '', plantdate: '', region: '', kcini: '', kcmid: '', kcend: '',
  maxcropheight: '', zr: '', p: '' };

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddCropsPage');
  }

backToCrops(){
    this.navCtrl.push(AllCropsPage)
  }

}
