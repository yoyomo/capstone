import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';
import { Chart } from 'chart.js';

@Component({
  selector: 'page-crop-history',
  templateUrl: 'crop-history.html'
})
export class CropHistoryPage {
  @ViewChild('historyCanvas') historyCanvas;
  historyChart: any;

  public headers:Array<any> = ['Season Day','Date\n(DD-MM-YY)','Recommended\n(mm)','Irrigated\n(mm)'];
  public trueHeaders:Array<any> = ['seasonday','cleandate','recommendedet','irrigatedet'];

  crop:any = [];
  history: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
   private auth: AuthService, public alertCtrl: AlertController) {
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
      dates.push(date.getDate()+'/'+date.getMonth());
      recommended.push(h.recommendedet);
      irrigated.push(h.irrigatedet);
      
      h.cleandate = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear().toString().substr(-2);
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

  editHistory(history){
 
    let prompt = this.alertCtrl.create({
      title: 'Edit Irrigation Amount at \n'+history.histdate,
      inputs: [{
        name: 'editedAmount',
        value: history.irrigatedet
      }],
      buttons: [
        {
          text: 'Edit',
          handler: data => {
            history.irrigatedet = data.editedAmount;
            this.auth.editHistory(history).subscribe(data => {
              console.log("History edited");
              this.displayData();
            },
            error => {
              console.log(error);
            });
          }
        },
        {
          text: 'cancel',
        }
      ]
    });
 
    prompt.present();       
 
  }

}
  
