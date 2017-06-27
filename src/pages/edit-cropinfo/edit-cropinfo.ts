import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {AuthService } from '../../providers/auth-service'

@Component({
  selector: 'page-edit-cropinfo',
  templateUrl: 'edit-cropinfo.html'
})
export class EditCropInfoPage {

public cropInfo = { infoid: '', cropname: '', category: '',lini: '',
		ldev: '', lmid: '', llate: '', total: '', plantdate: '', region: '', kcini: '', kcmid: '', kcend: '',
  maxcropheight: '', zr: '', p: '' };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private auth: AuthService) {
    this.cropInfo = this.navParams.get("info");
  }

  // Completes the operation and edits the Crop Info data already created
  editCropInfo(){
    this.auth.editCropInfo(this.cropInfo).subscribe(data => {
      console.log('Crop Information edited.');
      this.navCtrl.pop();
    });
  }

}
