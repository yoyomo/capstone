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

  public headers:Array<any> = ['Season Day','Date\n(DD-MM)','Recommended\n(mm)','Irrigated\n(mm)'];
  public trueHeaders:Array<any> = ['seasonday','cleandate','recommended','irrigatedet'];

  crop:any = [];
  history: any = [];
  dateModule = 7;

  constructor(public navCtrl: NavController, public navParams: NavParams,
   private auth: AuthService, public alertCtrl: AlertController) {
		this.crop = navParams.get("crop"); 
  }


  ionViewWillEnter() {
    this.auth.getHistory(this.crop).subscribe(data => {
      this.history = data;
      console.log("History loaded.");
      this.displayData();
    },
    error => {
      console.log(error);
    });
  }

  displayData() {
    var recommended = [], irrigated = [], dates = [];
    var h, date;
    var recommendedSum = 0, irrigatedSum = 0;
    for(var i=0; i < this.history.length; i++){
      h = this.history[i];

      date = new Date(h.histdate);
      if(i % this.dateModule ===0){
        dates.push(date.getDate()+'/'+date.getMonth());
      }else{
        dates.push('');
      }

      h.recommended = parseFloat((h.recommendedet - h.rainfall).toFixed(2));
      if(h.recommended < 0) h.recommended = 0;
      h.irrigatedet = parseFloat(h.irrigatedet);

      recommendedSum += h.recommended;
      irrigatedSum += h.irrigatedet;

      recommended.push((recommendedSum).toFixed(2));
      irrigated.push((irrigatedSum).toFixed(2));
      
      //h.cleandate = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear().toString().substr(-2);
      h.cleandate = date.getDate()+'-'+date.getMonth();
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

  info(){
    let prompt = this.alertCtrl.create({
          title: 'Information',
          message: `
        <ul>
          <li> Graph of amount of water irrigated versus recommended amount of water to irrigate is presented.</li>

          <li>A table is presented with the date of season, date of irrigation, irrigation amount recommended and actual irrigation amount 
          given.</li>

          <li> Swipe table items to the left < to  edit.</li>

          
                 
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
  
