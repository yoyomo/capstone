import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-add-irrigation-zone',
  templateUrl: 'add-irrigation-zone.html'
})
export class AddIrrigationZonePage {

public zoneInfo = { farmid: '', uid: '', izname: '',acres: '',
		waterflow: '0', irrigationmethod: '', irrigationefficiency: 50, controlID: '', valveID: '' };

private irrigationMethods: any = [];

  // Initialiazes irrigation methods
  constructor(public navCtrl: NavController, public navParams: NavParams,
  public viewCtrl: ViewController, private auth: AuthService, public alertCtrl: AlertController) {

  	var user, farmid;
  	user = this.auth.getUserInfo();
  	farmid = this.navParams.get("farmid");
  	this.zoneInfo.uid = user.uid;
  	this.zoneInfo.farmid = farmid;

  	this.auth.getIrrigationMethods().subscribe(data => {
      this.irrigationMethods = data;
    },
    error => {
      console.log(error);
    });
  }

  // Converts decimal to percentage
  makeIrrigationEfficiencyPercentage() {
    this.zoneInfo.irrigationefficiency *= 100; // make percentage
  }

  // Converts percentage to decimal
  makeIrrigationEfficiencyDecimal() {
    this.zoneInfo.irrigationefficiency /= 100; // make percentage
  }

  // Updates Irrigation Efficiency according to chosen Irrigation Method
  updateEfficiency() {
  	for(var i=0;i<this.irrigationMethods.length;i++){
  		if(this.irrigationMethods[i].irrigationmethod == this.zoneInfo.irrigationmethod){
  			this.zoneInfo.irrigationefficiency = this.irrigationMethods[i].ea;
        this.makeIrrigationEfficiencyPercentage();
  		}
  	}
  }

  // Completes the operation and adds Irrigation Zone to Farm
  addIrrigationZone() {
  	if(this.zoneInfo.irrigationefficiency > 100 || this.zoneInfo.irrigationefficiency < 0) return;
  	this.makeIrrigationEfficiencyDecimal();
    
  	this.auth.addIrrigationZone(this.zoneInfo).subscribe(data => {
      console.log("Irrigation Zone Added to farm "+this.zoneInfo.farmid);
      this.navCtrl.pop();
    },
    error => {
      console.log(error);
    });
  }

  // Displays information needed to guide the User
   info(){
    let prompt = this.alertCtrl.create({
          title: 'Information',
          message: `
        <ul>
          <li> Enter prefered zone name in the indicated field</li>
          <li> Enter amount of farm acres.</li>
          <li> Enter amount water flow in gal/min of irrigation method. If unsure of value enter an 
          estimated amount.</li>
          <li> Select and "Irrigation Method" from the drop down menu.</li>
          <li> Percentage of irrigation efficiency field is automatically filled based on selected Irrigation Method but 
          user may change value if desired.</li>
                 
         <li> Save information by pressing the "Add Zone" button found at the bottom of the page.</li>
      
        </ul>
        <ul>
        For more detailed information about H2O Crop see our user manual found in the side menu.
                 
        </ul>
      `,
          buttons: [
              {
                  text: 'Done'
              }
              
          ]
      });

      prompt.present();  

  }

}
