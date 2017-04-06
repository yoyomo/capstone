import { Component } from '@angular/core';
import { NavController, ModalController, NavParams,
   ViewController } from 'ionic-angular';
import { AddFarmPage } from '../add-farm/add-farm';
import { AddIrrigationZonePage } from '../add-irrigation-zone/add-irrigation-zone';


@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})
export class AddPage {
farmName = " ";
farmZone = " ";

public add = { farmName: '', irrigationZone: '', crop: ''};
  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
   public navParams: NavParams, public viewCtrl: ViewController) {
    
  }

  launcharFarmPage(){
    let addFarmModal = this.modalCtrl.create(AddFarmPage);

    addFarmModal.onDidDismiss((data)=>{
      console.log("Data =>", data);
      console.log(data.farmName);
      this.farmName = data.farmName
      this.add.farmName = data.farmName
        
      })
    addFarmModal.present();
  }

    launcharZonePage(){
    let addFarmModal = this.modalCtrl.create(AddIrrigationZonePage);

    addFarmModal.onDidDismiss((data)=>{
      console.log("Data =>", data);
      console.log(data.zoneName);
      this.farmZone = data.zoneName
      this.add.irrigationZone = data.zoneName

      })
    addFarmModal.present();
  }

closeModal(){
    this.viewCtrl.dismiss(this.add);
}

closeModal1(){
    this.viewCtrl.dismiss();
}

}

