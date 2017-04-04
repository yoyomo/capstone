import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-add-farm',
  templateUrl: 'add-farm.html'
})
export class AddFarmPage {
public farmInfo = { farmName: '', soilType: '', lattitude: '', longitude: ''  };

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {}

  ionViewDidLoad() {
    console.log(this.navParams.get('title'));
  }
closeModal(){
  
   this.viewCtrl.dismiss(this.farmInfo);

}

closeModal1(){
  
   this.viewCtrl.dismiss();

}

}
