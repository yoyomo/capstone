import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AddAdminPage } from '../add-admin/add-admin';
import { AddCropsPage } from '../add-crops/add-crops';
import { EditCropsPage } from '../edit-crops/edit-crops';
import { AlertController } from 'ionic-angular';


@Component({
  selector: 'page-all-crops',
  templateUrl: 'all-crops.html'
})
export class AllCropsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad AllCropsPage');
  }

  addAdmin(){
    this.navCtrl.push(AddAdminPage)
  }

  addCrops(){
    this.navCtrl.push(AddCropsPage)
  }

  editCrop(){
    this.navCtrl.push(EditCropsPage)
  }

  deleteCrop(){
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


