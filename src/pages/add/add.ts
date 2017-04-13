import { Component } from '@angular/core';
import { NavController, ModalController, NavParams,
   ViewController } from 'ionic-angular';
import { AddFarmPage } from '../add-farm/add-farm';
import { AddIrrigationZonePage } from '../add-irrigation-zone/add-irrigation-zone';
import { AuthService } from '../../providers/auth-service';
import { HomePage } from '../home/home';


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
crop:any = {  uid: 0,
        farmid: 0,
        izid: 0,
        infoid: 0};

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, private auth:AuthService, public viewCtrl: ViewController) {

    this.user = this.auth.getUserInfo();
    this.crop.uid = this.user.uid;
    this.auth.getUserFarms(this.user).subscribe(data => {
      this.farms = data;
      console.log(this.farms);
    },
    error => {
      console.log(error);
    });

    this.auth.getCropInfos().subscribe(data => {
      this.cropinfos = data;
    },
    error => {
      console.log(error);
    });
  }

  loadZones(){
    var iz = {
      "uid":this.user.uid,
      "farmid":this.crop.farmid
    };

    this.auth.getUserZones(iz).subscribe(data => {
      this.zones = data;
      console.log(this.zones);
    },
    error => {
      console.log(error);
    });
  }

  launcharFarmPage(){
    let addFarmModal = this.modalCtrl.create(AddFarmPage);

    addFarmModal.onDidDismiss((data)=>{
      console.log("Data =>", data);
      console.log(data.farmName);
      this.farmname = data.farmName
        
      })
    addFarmModal.present();
  }

    launcharZonePage(){
    let addFarmModal = this.modalCtrl.create(AddIrrigationZonePage);

    addFarmModal.onDidDismiss((data)=>{
      console.log("Data =>", data);
      console.log(data.zoneName);
      this.izname = data.izname;

      })
    addFarmModal.present();
  }

add(){
  //this.viewCtrl.dismiss(this.add);

  this.auth.addCrop(this.crop).subscribe(data => {
      this.navCtrl.setRoot(HomePage);
    },
    error => {
      console.log(error);
    });

  
}

}

