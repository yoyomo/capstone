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
  categories: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
   public alertCtrl: AlertController, private auth: AuthService) {}

  // Loads all Crop Categories
  // Loads all Crop infos
  // And Sorts them by category
  ionViewWillEnter() {

    this.auth.getCropInfoCategory().subscribe(data => {
      this.categories = data;
      this.auth.getCropInfos().subscribe(data => {
        this.cropinfos = data;
        console.log("Crop Info loaded.");
        this.sortByCategory();
      },
      error => {
        console.log(error);
      });
    },
    error => {
      console.log(error);
    });
  }

  // Sorts Crops by their Category
  sortByCategory() {
    for(var i=this.categories.length-1; i>=0; i--){
      this.categories[i].cropinfos = [];
      for(var j=this.cropinfos.length-1; j>=0; j--){
        if(this.cropinfos[j].category===this.categories[i].category){
          this.categories[i].cropinfos.push(this.cropinfos[j]);
        }
      }
    }

    console.log("Crop Info sorted.");
  }

  // Opens Add CropInfo Page
  addCropInfo(){
    this.navCtrl.push(AddCropInfoPage);
  }

  // Opens Edit CropInfo Page
  editCropInfo(info){
    this.navCtrl.push(EditCropInfoPage, {
      info: info
    });
  }

  // Warns the Admin and deletes the crop info
  // *WARNING* VERY DANGEROUS
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
                handler: data => {
                  this.auth.deleteCropInfo(info).subscribe(data => {
                    this.navCtrl.setRoot(AllCropInfoPage);
                  },
                  error => {
                    console.log(error);
                  });
                }
              }
          ]
      });

      prompt.present();  

  }
  }


