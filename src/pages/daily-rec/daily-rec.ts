import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CropHistoryPage } from '../crop-history/crop-history';
import { Chart } from 'chart.js';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'page-daily-rec',
  templateUrl: 'daily-rec.html'
})  
  
export class DailyRecPage {

  public lineChartType:string = 'line';
	public lineChartData:Array<any> = [{data: [18, 48, 27, 39, 10, 27, 40], label: 'Series'}];
	public lineChartLabels:Array<any> = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun', 'July', 'Aug.','Sep.']; 

  farmName = "";
  crop = '';

public infoFarm = { farmName: '', irrigationZone: '', crop: ''};
//public infoFarm= { farmName: '', irrigationZone: '', crop: ''};
  constructor(public navCtrl: NavController, public navParams: NavParams) {
   
    this.farmName = navParams.get("farmName"); 
		this.crop = navParams.get("crop"); 
    //this.infoFarm.farmName = navParams.get("farmName"); 
    //this.infoFarm.crop =navParams.get("crop");
    this.infoFarm.farmName = navParams.get("farmName");
    this.infoFarm.crop = navParams.get("crop")
    
  }

  public cropHistory(){
    this.navCtrl.push(CropHistoryPage, this.infoFarm)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LineChartPage'); 
  }
  
  public irrigated(){
    this.navCtrl.pop()
  }
   
}
  