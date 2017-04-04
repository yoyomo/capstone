import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-add-irrigation-zone',
  templateUrl: 'add-irrigation-zone.html'
})
export class AddIrrigationZonePage {

public farmInfo = { zoneName: '', acre: '', waterFlow: '',
 irrigationMeth: '', irrigationEff: '' };

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public viewCtrl: ViewController) {}


closeModal(){
  
   this.viewCtrl.dismiss(this.farmInfo);

 }
}
