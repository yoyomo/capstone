import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { Chart } from 'chart.js';

@Component({
  selector: 'page-crop-history',
  templateUrl: 'crop-history.html'
})
export class CropHistoryPage {
  @ViewChild('historyCanvas') historyCanvas;
  historyChart: any;

  public headers:Array<any> = ['Season Day','Date','Recommended','Irrigated'];
  public trueHeaders:Array<any> = ['seasonday','histdate','recommendedet','irrigatedet'];

  crop:any = [];
  history: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
   private auth: AuthService) {
		this.crop = navParams.get("crop"); 
  }


  ionViewWillEnter() {
    this.auth.getHistory(this.crop).subscribe(data => {
      this.history = data;
      this.displayData();
    },
    error => {
      console.log(error);
    });
  }

  displayData() {
    var recommended = [], irrigated = [], dates = [];
    var h, date;
    for(var i=0; i < this.history.length; i++){
      h = this.history[i];
      date = new Date(h.histdate);
      recommended.push(h.recommendedet);
      irrigated.push(h.irrigatedet);
      dates.push(date.getDate()+'/'+date.getMonth());
    }

    this.historyChart = new Chart(this.historyCanvas.nativeElement, {
      type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: "Recommended",
              fill: false,
              lineTension: 0.1,
              backgroundColor: "rgba(0,0,0,0.4)",
              borderColor: "rgba(0,0,0,1)",
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: "rgba(0,0,0,1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(0,0,0,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: recommended,
              spanGaps: false,
            },
            {
              label: "Irrigated",
              fill: false,
              lineTension: 0.1,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: "rgba(75,192,192,1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(75,192,192,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: irrigated,
              spanGaps: false,
            }
          ]
        }
      });
    
  }
}
  
