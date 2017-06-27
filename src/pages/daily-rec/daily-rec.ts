import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Loading } from 'ionic-angular';
import { CropHistoryPage } from '../crop-history/crop-history';
import { AuthService } from '../../providers/auth-service';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';


@Component({

  selector: 'page-daily-rec',
  templateUrl: 'daily-rec.html'
})  
  
export class DailyRecPage {

public lineChartType:string = 'line';
public lineChartData:Array<any> = [{data: [18, 48, 27, 39, 10, 27, 40], label: 'Series'}];
public lineChartLabels:Array<any> = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun', 'July', 'Aug.','Sep.']; 

types = {gal: 'gallons', L: 'liters', hr: 'hours', mm: 'millimeters', in: 'inches'};
rec = {amount: 0, type: this.types.gal};
crop: any = [];
history = {cropid: '', uid: '', recommendedet: 0,
irrigatedet: 0, seasonday: 0, rainfall: 0};
settingUp = false;
loading: Loading;
stopIrrigationFlag = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private auth: AuthService, private loadingCtrl: LoadingController, public alertCtrl: AlertController) {
		this.crop = navParams.get("crop");
  }

  // Set Up if first time
  setup() {
    if(!this.settingUp){
      console.log('Setting up first irrigation...');
      this.settingUp = true;
      this.showSetup();
      this.auth.updateNewCrop(this.crop).subscribe(data => {
        console.log(data.message);
        this.loadCrop();
      },
      error => {
        console.log(error);
      });
    }
    else{
      //recheck until it has been updated
      this.loadCrop();
    }
  }

  // Loads all the data of the User's crop
  loadCrop(){
    this.auth.readSpecificCrop(this.crop).subscribe(data => {
      this.crop = data[0];
      if (this.auth.isDebug()) console.log(this.crop);

      if (this.crop.outofrange==='Yes'){
        this.closeSetup();
        this.showOutOfRange();
      }
      else if(this.crop.currentday ==0) {
        this.setup();
      }
      else {
        this.closeSetup();

        this.history.cropid = this.crop.cropid;
        this.history.uid = this.crop.uid;
        this.history.recommendedet = (this.crop.cumulativeet).toFixed(2);        
        this.history.seasonday = this.crop.currentday;
        this.history.rainfall = (this.crop.rainfall).toFixed(2);

        console.log("Daily Recommendation calculated.");
        //calculate the difference between etc and rainfall
        //and display amount
        this.changeRainfall();
      }
    },
    error => {
      console.log(error);
    });
  }

  // Reloads crop everytime the page is accessed
  ionViewWillEnter(){
    this.loadCrop();
  }

  // Converts millimeters to:
  // Gallons, Liters, Hours (if waterflow > 0), and Inches
  private getDailyRecommendation() {
    var D, A, Q, eff, G, T, L, mm, inch;

    D = this.history.irrigatedet;
    A = parseFloat(this.crop.acres);
    Q = parseFloat(this.crop.waterflow);
    eff = parseFloat(this.crop.irrigationefficiency);

    G = 1069.02 * (D * A) / eff;

    if (Q > 0) {
      T = G / (Q * 60);
    } else {
      T = 0;
    }

    L = 3.78541 * G;
    mm = D;
    inch = 0.0393701 * D;

    return {gal: G, hr: T, L: L, mm: mm, in: inch};
  }

  // Converts any type of amount (gallons,liters,hours,inches) to millimeters
  private reverse() {
    var A, Q, eff, G, T, L, mm, inch, amount;

    amount = this.rec.amount; // in gal,hr,L,mm or in
    A = parseFloat(this.crop.acres);
    Q = parseFloat(this.crop.waterflow);
    eff = parseFloat(this.crop.irrigationefficiency);

    // reverse of G = 1069.02 * (D * A) / eff
    G = (amount * eff) / (1069.02 * A);

    if (Q > 0) {
      // reverse of T = G / (Q * 60);
      T = G * (Q * 60);
    } else {
      // may cause error. should never reach this place.
      // no change
      T = amount; 
    }

    // reverse of L = 3.78541 * G;
    L = G / 3.78541;
    //no change
    mm = amount;
    // reverse of inch = 0.0393701 * D;
    inch = amount / 0.0393701;

    return {gal: G, hr: T, L: L, mm: mm, in: inch};
  }

  // Converts the value according to the chosen type
  public changeAmountType() {
    switch (this.rec.type){
      case this.types.gal:
        this.rec.amount = (this.getDailyRecommendation().gal).toFixed(0);
        break;
      case this.types.L:
        this.rec.amount = (this.getDailyRecommendation().L).toFixed(0);
        break;
      case this.types.hr:
        this.rec.amount = (this.getDailyRecommendation().hr).toFixed(2);
        break;
      case this.types.mm:
        this.rec.amount = (this.getDailyRecommendation().mm).toFixed(2);
        break;
      case this.types.in:
        this.rec.amount = (this.getDailyRecommendation().in).toFixed(2);
        break;
    }

  }

  // Converts the value to millimeters according to the type
  public changeAmount(){
    switch (this.rec.type){
      case this.types.gal:
        this.history.irrigatedet = this.reverse().gal;
        break;
      case this.types.L:
        this.history.irrigatedet = this.reverse().L;
        break;
      case this.types.hr:
        this.history.irrigatedet = this.reverse().hr;
        break;
      case this.types.mm:
        this.history.irrigatedet = this.reverse().mm;
        break;
      case this.types.in:
        this.history.irrigatedet = this.reverse().in;
        break;
    }
    console.log("Changed amount to " + this.history.irrigatedet);
  }

  // Recalculate the recommendation according to the rainfall and ETc
  public changeRainfall() {
    //history.irrigatedet is used because it is always in mm
    this.history.irrigatedet = this.history.recommendedet - this.history.rainfall;
    if(this.history.irrigatedet < 0) this.history.irrigatedet = 0;
    this.changeAmountType();
  }

  // Opens Crop History Page
  public cropHistory(){
    this.navCtrl.push(CropHistoryPage, {
      crop: this.crop
    });
  }

  // Completes the operation and irrigates the specified value to the crop
  public irrigate(){
    this.auth.addHistory(this.history).subscribe(data => {
      console.log("History added.");
    },
    error => {
      console.log(error);
    });

    this.crop.cumulativeet -= this.history.irrigatedet;
    this.crop.irrigatedet = this.history.irrigatedet;
    this.auth.updateCrop(this.crop).subscribe(data => {
      console.log("Crop updated.");
      //update other crop under the same irrigation zone
      
      this.auth.updateAllOtherCrops(this.crop).subscribe(data => {
        console.log("All other Crops updated.");
        this.loadCrop();
        //this.navCtrl.pop();
      },
      error => {
        console.log(error);
      });
    },
    error => {
      console.log(error);
    });

    /*
     * Send to microcontroller
     */
    if(this.auth.isHardware()) this.sendToMasterControl();
    
  }

  // Deletes a crop with confirmation
  deleteCrop(crop){
      let prompt = this.alertCtrl.create({
          title: 'Delete Crop Info?',
          message: "All User Crops and History under this Crop Info will also be deleted. Are you sure you want to delete this Crop Info?",
                    
          buttons: [
              {
                  text: 'Cancel'
              },
              {
                  text: 'Delete',
                  handler: data => {
                    this.auth.deleteCrop(crop).subscribe(data => {
                      console.log("Crop Info &Crops & \
                        all its History deleted.");
                      this.navCtrl.setRoot(HomePage);
                    },
                    error => {
                      console.log(error);
                    });
                  }
              }
          ]
      });

      prompt.present();
  }

  showSetup(){
    this.loading = this.loadingCtrl.create({
      content: 'Setting up first irrigation...'
    });
    this.loading.present();
  }

  closeSetup(){
    if(this.settingUp){
      this.settingUp = false;
      this.loading.dismiss();
    }
    
  }

  showOutOfRange(){
    let prompt = this.alertCtrl.create({
      title: 'Out of Range',
      message: "Farm is out of range. Please go back and change the Farm location inland.",
                
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.navCtrl.pop();
          }
        }
      ]
    });

    prompt.present();
  }

  comm:any ={
    uid: '',
    izid: '',
    comamount: '',
    ipaddress: '',
    valveid: ''
  };

  //Sends value in liters to the MasterControl Hardware System
  sendToMasterControl() {
    this.auth.getControl(this.crop).subscribe(data => {
      if(data.length != 0) {
        console.log("Control loaded.");
        this.comm.uid = this.crop.uid;
        this.comm.izid = this.crop.izid;
        this.comm.comamount = parseInt(this.getDailyRecommendation().L);
        this.comm.ipaddress = data[0].ipaddress;
        this.comm.valveid = data[0].valveid;

        if (this.auth.isDebug()) console.log(this.comm);

        this.auth.irrigateCommunication(this.comm).subscribe(data => {
          if (this.auth.isDebug()) console.log(data);
          console.log("Irrigate Communication sent.");
          
          this.auth.sendControl(this.comm).subscribe(data => {
            if (this.auth.isDebug()) console.log(data);
            console.log("Control sent.");
            //this.refreshStatus(data.status);
            this.stopIrrigationFlag = true;
          },
          error => {
            console.log(error);
            console.log("Control sent.");
            //this.refreshStatus(data.status);
            this.stopIrrigationFlag = true;
          });
        },
        error => {
          console.log(error);
        });
      }
      else{
        console.log('No hardware control found.');
      }
    },
    error => {
      console.log(error);
    });
  }

  // Stops the hardware irrigation
  public stopIrrigation(){
    this.auth.stopIrrigation(this.comm).subscribe(data => {
      console.log("Communication Stopped.");

      this.auth.stopControl(this.comm).subscribe(data => {
        console.log("Physical Irrigation Stopped.");
        this.stopIrrigationFlag = false;
      },
      error => {
        console.log(error);
        console.log("Physical Irrigation Stopped.");
        this.stopIrrigationFlag = false;
      });
    },
    error => {
      console.log(error);
    });
    // this.auth.getControl(this.crop).subscribe(data => {
    //   if(data.length != 0) {
    //     console.log("Control loaded.");
    //     this.comm.uid = this.crop.uid;
    //     this.comm.izid = this.crop.izid;
    //     this.comm.comamount = parseInt(this.getDailyRecommendation().L);
    //     this.comm.ipaddress = data[0].ipaddress;
    //     this.comm.valveid = data[0].valveid;

    //     if (this.auth.isDebug()) console.log(this.comm);

    //     this.auth.stopIrrigation(this.comm).subscribe(data => {
    //       console.log("Communication Stopped.");

    //       this.auth.stopControl(this.comm).subscribe(data => {
    //         console.log("Physical Irrigation Stopped.");
    //       },
    //       error => {
    //         console.log(error);
    //       });
    //     },
    //     error => {
    //       console.log(error);
    //     });
    //   }
    //   else{
    //     console.log('No hardware control found.');
    //   }
    // },
    // error => {
    //   console.log(error);
    // });
    
    
  }

  // Used when a value is returned from the MasterControl Hardware System
  // About the Status of the irrigation
  refreshStatus(status){
    if(status==='received'){
      this.auth.receivedCommunication(this.comm).subscribe(data => {
        if (this.auth.isDebug()) console.log(data);
        console.log("Received communication.");
        // recheck status from master control
        // and then call this.refreshStatus(status)
      },
      error => {
        console.log(error);
      });
    }
    else if(status === 'irrigating') {
      this.auth.irrigatingCommunication(this.comm).subscribe(data => {
        if (this.auth.isDebug()) console.log(data);
        console.log("Irrigating communication.");
        // recheck status from master control
        // and then call this.refreshStatus(status)
      },
      error => {
        console.log(error);
      });

    }
    else if(status==='finished'){
      this.auth.finishedCommunication(this.comm).subscribe(data => {
        if (this.auth.isDebug()) console.log(data);
        console.log("Finished communication.");
        // end refresh
      },
      error => {
        console.log(error);
      });
    }

  }

  // Displays information needed to guide the User
  info(){
    let prompt = this.alertCtrl.create({
          title: 'Information',
          message: `
        <ul>
          <li> ETc value of crop in millimeters is presented.</li>
          <li> Amount of rainfall in millimeters is given but user can change value if desired..</li>
          <li> Recommended amount of water to irrigate is given but user may change value if desired.</li>
          <li> Units of irrigation value may be changed by selecting it in the drop down menu which is located to the 
          right of the recommended field.</li>
                 
         <li>To irrigate crops and save information press the irrigate button found at the bottom of the page.</li>
      
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
  
