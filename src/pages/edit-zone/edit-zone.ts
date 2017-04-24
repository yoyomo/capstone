import { Component } from '@angular/core';
import { NavController, NavParams, ViewController,
 Loading, LoadingController} from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { AllFarmsPage } from '../all-farms/all-farms';
/*
  Generated class for the EditZone page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-edit-zone',
  templateUrl: 'edit-zone.html'
})
export class EditZonePage {

zone = { farmid: '', uid: '', izname: '',acres: '',
		waterflow: '0', irrigationmethod: '', irrigationefficiency: '' };
private irrigationMethods: any = [];
loadingMethods: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public viewCtrl: ViewController, private auth: AuthService,
  private loadingCtrl: LoadingController) {

  	this.zone = this.navParams.get("zone");

    this.showLoadingMethods();
  	this.auth.getIrrigationMethods().subscribe(data => {
      this.irrigationMethods = data;
      this.closeLoadingMethods();
    },
    error => {
      console.log(error);
    });
  }

  updateEfficiency() {
  	for(var i=0;i<this.irrigationMethods.length;i++){
  		if(this.irrigationMethods[i].irrigationmethod == this.zone.irrigationmethod){
  			this.zone.irrigationefficiency = this.irrigationMethods[i].ea;
  		}
  	}
  }

  editIrrigationZone() {
  	if(parseFloat(this.zone.irrigationefficiency) > 1 || parseFloat(this.zone.irrigationefficiency) < 0) return;
  	
  	this.auth.editIrrigationZone(this.zone).subscribe(data => {
      console.log("Irrigation Zone edited.");
      this.navCtrl.pop();
    },
    error => {
      console.log(error);
    });
  }

  showLoadingMethods() {
    this.loadingMethods = this.loadingCtrl.create({
      content: "Loading Irrigation Methods..."
    });
    this.loadingMethods.present();
  }

  closeLoadingMethods(){
    console.log("Irrigation Methods loaded.");
    this.loadingMethods.dismiss();
  }

}
