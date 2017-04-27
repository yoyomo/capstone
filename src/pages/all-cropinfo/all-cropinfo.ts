import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AddCropInfoPage } from '../add-cropinfo/add-cropinfo';
import { EditCropInfoPage } from '../edit-cropinfo/edit-cropinfo';
import { AlertController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service'


@Component({
  selector: 'page-all-cropinfo',
  templateUrl: 'all-cropinfo.html'
})
export class AllCropInfoPage {

  cropinfos: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
   public alertCtrl: AlertController, private auth: AuthService) {}

  ionViewWillEnter() {
    this.auth.getCropInfos().subscribe(data => {
      this.cropinfos = data;
      console.log("Crop Info loaded.");
      
    },
    error => {
      console.log(error);
    });
  }

  addCropInfo(){
    this.navCtrl.push(AddCropInfoPage);
  }

  editCropInfo(info){
    this.navCtrl.push(EditCropInfoPage, {
      info: info
    });
  }

  deleteCropInfo(info){
     let prompt = this.alertCtrl.create({
          title: 'Delete Crop?',
          message: "This crop being used by any user will be deleted. Are you sure you want to delete this crop?",
          
          buttons: [
              {
                  text: 'Cancel'
              },
              {
                  text: 'Delete',
                  
                   }
          ]
      });

      prompt.present();  

  }
  }


