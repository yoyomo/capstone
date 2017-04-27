import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service'
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-add-cropinfo',
  templateUrl: 'add-cropinfo.html'
})
export class AddCropInfoPage {

  public cropInfo = { infoid: '', cropname: '', category: '',lini: '',
		ldev: '', lmid: '', llate: '', total: '', plantdate: '', region: '', kcini: '', kcmid: '', kcend: '',
  maxcropheight: '', zr: '', p: '' };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, private auth: AuthService) {
    this.cropInfo = this.navParams.get("info");
  }



  addCropInfo(){
    this.auth.addCropInfo(this.cropInfo).subscribe(data => {
      console.log(data);
      if(data){
        console.log(data);
        this.showError(data.detail);
      }
      else{
        console.log("Crop Info added.");
        this.navCtrl.pop();
      }
      
    },
    error => {
      console.log(error);
    });
    
  }

  showError(error){
     let prompt = this.alertCtrl.create({
          title: 'ERROR',
          message: error,
          
          buttons: [
              {
                text: 'OK'
              }
          ]
      });

      prompt.present();  

  }

}
