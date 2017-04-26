import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AllCropsPage } from '../all-crops/all-crops';

@Component({
  selector: 'page-edit-crops',
  templateUrl: 'edit-crops.html'
})
export class EditCropsPage {

public cropInfo = { infoid: '', cropname: '', category: '',lini: '',
		ldev: '', lmid: '', llate: '', total: '', plantdate: '', region: '', kcini: '', kcmid: '', kcend: '',
  maxcropheight: '', zr: '', p: '' };

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditCropsPage');
  }

  backToCrops(){
    this.navCtrl.push(AllCropsPage)
  }

}
