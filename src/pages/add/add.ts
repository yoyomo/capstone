import { Component } from '@angular/core';
import { NavController, ModalController, NavParams,
   ViewController } from 'ionic-angular';
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

user: any = [];
farms: any = [];
zones: any = [];
cropinfos: any = [];

farmname = '';
izname = '';
cropname = '';
crop:any = {  uid: 0,farmid: '',izid: '', infoid: ''};

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth:AuthService, public viewCtrl: ViewController,
   public events: Events) {

    this.user = this.auth.getUserInfo();
    this.crop.uid = this.user.uid;
    this.loadCropInfos();
  }

  ionViewWillEnter(){
    this.loadFarms();
    this.loadZones();
  }

  loadFarms(){
    this.auth.getUserFarms(this.user).subscribe(data => {
      this.farms = data;
      console.log(this.farms);
    },
    error => {
      console.log(error);
    });
  }

  loadCropInfos(){
    this.auth.getCropInfos().subscribe(data => {
      this.cropinfos = data;
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

    this.auth.getUserZones(iz).subscribe(data => {
      this.zones = data;
      console.log(this.zones);
    },
    error => {
      console.log(error);
    });
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

