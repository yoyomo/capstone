import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import { ViewChild } from '@angular/core';
@Component({
  selector: 'page-crop-history',
  templateUrl: 'crop-history.html'
})
export class CropHistoryPage {

 public lineChartType:string = 'line';
	public lineChartData:Array<any> = [{data: [18, 48, 27, 39, 10, 27, 40], label: 'Series'}];
	public lineChartLabels:Array<any> = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun', 'July']; 

  farmName = "";
  crop = '';

  public infoFarm1 = { farmName: '', irrigationZone: '', crop: ''};

  constructor(public navCtrl: NavController, public navParams: NavParams) {
   
    this.farmName = navParams.get("farmName"); 
		this.crop = navParams.get("crop"); 
      }


  ionViewDidLoad() {
    console.log('ionViewDidLoad LineChartPage'); 
  }

 
 
}
  
