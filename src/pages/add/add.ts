import { Component } from '@angular/core';
import { NavController, ModalController, NavParams,
   ViewController, LoadingController, Loading } from 'ionic-angular';
import { AddFarmPage } from '../add-farm/add-farm';
import { AddIrrigationZonePage } from '../add-irrigation-zone/add-irrigation-zone';
import { AuthService } from '../../providers/auth-service';
import { HomePage } from '../home/home';
import { Events } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})

export class AddPage {
loadingCropInfo: Loading;
loadingFarms: Loading;
loadingZones: Loading;

user: any = [];
farms: any = [];
zones: any = [];
farmZones: any = [];
cropinfos: any = [];
allcropinfos: any = [];

farmname = '';
izname = '';
cropname = '';
searchCropString = '';
crop:any = {  uid: 0,farmid: '',izid: '', infoid: ''};

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth:AuthService, 
   public viewCtrl: ViewController, public events: Events, 
   private loadingCtrl: LoadingController, public alertCtrl: AlertController) {

    this.user = this.auth.getUserInfo();
    this.crop.uid = this.user.uid;
    this.loadCropInfos();
  }

  ionViewWillEnter(){
    this.loadFarms();
    
  }

  loadFarms(){
    this.showLoadingFarms();
    this.auth.getUserFarms(this.user).subscribe(data => {
      this.farms = data;
      this.crop.farmid = this.farms[0].farmid;
      this.closeLoadingFarms();
      this.loadZones();
    },
    error => {
      console.log(error);
    });
  }

  loadCropInfos(){
    this.showLoadingCropInfo();
    this.auth.getCropInfos().subscribe(data => {
      this.allcropinfos = data;
      this.cropinfos = data;
      this.closeLoadingCropInfo();
    },
    error => {
      console.log(error);
    });
  }

  loadZones(){
    this.showLoadingZones();
    this.auth.getUserZones(this.user).subscribe(data => {
      this.zones = data;
      console.log(this.zones);
      this.loadFarmZones();
      this.closeLoadingZones();
    },
    error => {
      console.log(error);
    });
  }

  loadFarmZones(){
    if(!this.crop.farmid) return;

    this.farmZones = [];
    for(var zoneIndex = this.zones.length - 1; zoneIndex >= 0; zoneIndex--) {
      if(this.zones[zoneIndex].farmid === this.crop.farmid){
        this.farmZones.push(this.zones[zoneIndex]);
      }
    }
    if(this.farmZones.length > 0) {
      this.crop.izid = this.farmZones[this.farmZones.length-1].izid;
    }
    
  }

  launcharFarmPage(){
    this.navCtrl.push(AddFarmPage);
  }

  launcharZonePage(){
    console.log(this.crop.farmid);
    this.navCtrl.push(AddIrrigationZonePage,{
      farmid: this.crop.farmid
    });
  }

  searchCrop(){
    // reset countries list with initial call
    this.cropinfos = this.allcropinfos;
    // set q to the value of the searchbar
    var q = this.searchCropString;

    // if the value is an empty string don't filter the items
    if (q.trim() == '') {
        return;
    }

    this.cropinfos = this.allcropinfos.filter((v) => {
        if (v.cropname.toLowerCase().indexOf(q.toLowerCase()) > -1) {
            return true;
        }
        return false;
    });

    if(this.cropinfos.length===0){
      this.cropinfos.push({
        infoid: null,
        cropname: "Crop not found, please try a similar crop.",
        plantdate: '',
        region: ''
      });
    }
  }

  addCrop(){

    if(!this.crop.farmid || !this.crop.izid || !this.crop.infoid){
      alert("Must select every field");
      return;
    }
    this.auth.addCrop(this.crop).subscribe(data => {
        this.navCtrl.setRoot(HomePage);
      },
      error => {
        console.log(error);
      });
  }

  showLoadingCropInfo() {
    this.loadingCropInfo = this.loadingCtrl.create({
      content: 'Loading Crop Information...'
    });
    this.loadingCropInfo.present();
  }

  closeLoadingCropInfo(){
    console.log('Crop Info loaded.');
    this.loadingCropInfo.dismiss();
  }

  showLoadingFarms() {
    this.loadingFarms = this.loadingCtrl.create({
      content: 'Loading Farms...'
    });
    this.loadingFarms.present();
  }

  closeLoadingFarms(){
    console.log('Farms loaded.');
    this.loadingFarms.dismiss();
  }

  showLoadingZones() {
    this.loadingZones = this.loadingCtrl.create({
      content: 'Loading Irrigation Zones...'
    });
    this.loadingZones.present();
  }

  closeLoadingZones(){
    console.log('Irrigation Zones loaded.');
    this.loadingZones.dismiss();
  }

  info(){
    let prompt = this.alertCtrl.create({
          title: 'Information',
          message: `
        <ul>
          <li> Begin by selecting a farm from the drop down menu titled "Farm Name".
          If no farm has beed added click the plus + sign button found next to the drop down menu to 
          add a farm. Then proceed to select farm added from drop down menu.
           Once farm is selected continue by doing the same with "Irrigation Zone"</li>

          <li> Irrigation Zone and Crop are disabled until Farm Name is selected.</li>

          <li> Once Irrigation Zone is selected search for crop and select it from drop down menu.</li>
          
          <li> If crop is not found in list select a similar crop.</li>

          <li> Save information by pressing the "Add" button found at the bottom of the page.</li>

                 
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

