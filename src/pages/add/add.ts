import { Component } from '@angular/core';
import { NavController, ModalController, NavParams,
   ViewController, LoadingController, Loading } from 'ionic-angular';
import { AddFarmPage } from '../add-farm/add-farm';
import { AddIrrigationZonePage } from '../add-irrigation-zone/add-irrigation-zone';
import { AuthService } from '../../providers/auth-service';
import { HomePage } from '../home/home';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})

export class AddPage {
loading: Loading;
user: any = [];
farms: any = [];
zones: any = [];
cropinfos: any = [];

farmname = '';
izname = '';
cropname = '';
crop:any = {  uid: 0,farmid: '',izid: '', infoid: ''};

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth:AuthService, 
   public viewCtrl: ViewController, public events: Events, 
   private loadingCtrl: LoadingController) {

    this.user = this.auth.getUserInfo();
    this.crop.uid = this.user.uid;
    this.loadCropInfos();
  }

  ionViewWillEnter(){
    this.loadFarms();
    this.loadZones();
  }

  loadFarms(){
    this.showLoading('Loading Farms...');
    this.auth.getUserFarms(this.user).subscribe(data => {
      this.farms = data;
      this.closeLoading();
    },
    error => {
      console.log(error);
    });
  }

  loadCropInfos(){
    this.showLoading('Loading Crop Information...');
    this.auth.getCropInfos().subscribe(data => {
      this.cropinfos = data;
      this.closeLoading();
    },
    error => {
      console.log(error);
    });
  }

  loadZones(){
    var iz = {
      uid:this.crop.uid,
      farmid:this.crop.farmid
    };
    if(!this.crop.farmid) return;

    this.showLoading('Loading Irrigation Zone...');
    this.auth.getUserZones(iz).subscribe(data => {
      this.zones = data;
      this.closeLoading();
    },
    error => {
      console.log(error);
    });
  }

  showLoading(text) {
    this.loading = this.loadingCtrl.create({
      content: text
    });
    this.loading.present();
  }

  closeLoading(){
    this.loading.dismiss();
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

}

