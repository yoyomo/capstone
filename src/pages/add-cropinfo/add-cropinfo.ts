import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service'

@Component({
  selector: 'page-add-cropinfo',
  templateUrl: 'add-cropinfo.html'
})
export class AddCropInfoPage {

  public cropInfo = { infoid: '', cropname: '', category: '',lini: '',
		ldev: '', lmid: '', llate: '', total: '', plantdate: '', region: '', kcini: '', kcmid: '', kcend: '',
  maxcropheight: '', zr: '', p: '' };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private auth: AuthService) {
  }



  addCropInfo(){
    this.auth.addCropInfo(this.cropInfo).subscribe(data => {
      console.log("Crop Info added.");
      this.navCtrl.pop();
    },
    error => {
      console.log(error);
    });
    
  }

}
