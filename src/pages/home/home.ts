import { Component } from '@angular/core';
import { NavController, ModalController, NavParams, MenuController} from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';


import { AddPage } from '../add/add';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';
import { DailyRecPage } from '../daily-rec/daily-rec';
import { AllCropInfoPage } from '../all-cropinfo/all-cropinfo';
import { EditFarmPage } from '../edit-farm/edit-farm';
import { EditZonePage } from '../edit-zone/edit-zone';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

user: any = [];
crops: any = [];
zones: any = [];
farms: any = [];

  //Initializes User Farms, Irrigation Zones, and Crops and sorts them all algorithmically
  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams,private menuCtrl: MenuController, private auth: AuthService, public alertCtrl: AlertController, private iab:InAppBrowser) {

    this.menuCtrl.enable(true); 
    this.user = this.auth.getUserInfo();
    if(this.auth.isDebug()) console.log(this.user);
    this.auth.getUserFarms(this.user).subscribe(data => {
      this.farms = data;

      this.auth.getUserZones(this.user).subscribe(data => {
        this.zones = data;

        this.auth.getUserCrops(this.user).subscribe(data => {
          this.crops = data; 
          if (this.auth.isDebug()) console.log(this.crops);

          this.includeCropsToZones();
          this.includeZonesToFarms();
        },
        error => {
          console.log(error);
        });
      },
      error => {
        console.log(error);
      });
    },
    error => {
      console.log(error);
    });
  }

  // Sort all crops to their respective irrigation zones
  includeCropsToZones() {

    for(var zoneIndex = this.zones.length-1; zoneIndex >= 0; zoneIndex--) {
      this.zones[zoneIndex].crops = [];
      for(var cropIndex = this.crops.length-1; cropIndex >= 0; cropIndex--) {
        if(this.crops[cropIndex].izid === this.zones[zoneIndex].izid){
          this.zones[zoneIndex].crops.push(this.crops[cropIndex]);
        }
      }
    }
  }

  // Sorts all Zones to their respective farms
  includeZonesToFarms() {
    for(var farmIndex = this.farms.length-1; farmIndex >= 0; farmIndex--) {
      this.farms[farmIndex].zones = [];
      for(var zoneIndex = this.zones.length-1; zoneIndex >= 0; zoneIndex--) {
        if(this.zones[zoneIndex].farmid === this.farms[farmIndex].farmid){
          this.farms[farmIndex].zones.push(this.zones[zoneIndex]);
        }
      }
    }
  }

  //Opens Add Crop Page
  launcharAddPage(){
    this.navCtrl.push(AddPage);
  }

  // Opens Daily Recommendation Page
  dailyRec(crop){
    this.navCtrl.push(DailyRecPage, {
      crop: crop
    });
  }

  // Opens all cropInfo Page if admin
  allCrops() {
    this.navCtrl.push(AllCropInfoPage);
  }

  //Opens Edit Farm Page
  editFarm(farm){
    this.navCtrl.push(EditFarmPage, {
      farm: farm
    });
  }

  // Opens Edit Irrigation Zone Page
  editZone(zone){
    this.navCtrl.push(EditZonePage, {
      zone: zone
    });
  }

  // Displays information needed to guide the user
  info(){
    let prompt = this.alertCtrl.create({
          title: 'Information',
          message: `
        <ul>
          <li> Press the plus + sign icon found in the page header to add crops.</li>

          <li> Press the 3 lined icon found in the page header to open side menu or Swipe
          page to the right.</li>

          <li> Swipe list items to the left < to delete or edit farm, zone or crop.</li>

          <li> Press selected crop to see recommended irrigation value.</li>
                 
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
