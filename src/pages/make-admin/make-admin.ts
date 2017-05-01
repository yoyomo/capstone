import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-make-admin',
  templateUrl: 'make-admin.html'
})
export class MakeAdminPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
   public alertCtrl: AlertController) {
  	
  }

   addAdmin(){
    let prompt = this.alertCtrl.create({
            title: 'Add Admin',
            inputs: [{
                name: 'Username',
                placeholder: 'Username'
                
            },
            {
                name: 'Password',
                placeholder: 'Password',
                type: 'password'
                
            }
            ],
            buttons: [
                {
                    text: 'Add'
                },
                {
                    text: 'cancel',
                   }
            ]
        });
 
        prompt.present();       
 
    }  

  editAdmin(){
    let prompt = this.alertCtrl.create({
            title: 'Edit Admin',
            inputs: [{
                name: 'Username',
                value: '',
            },
            {
                name: 'Password',
                value: '',
            }
            ],
            buttons: [
                {
                    text: 'Edit'
                },
                {
                    text: 'cancel',
                   }
            ]
        });
 
        prompt.present();       
 
    }
  

  deleteAdmin(){
     let prompt = this.alertCtrl.create({
          title: 'Delete Crop?',
          message: "Are you sure you want to delete this admin user?",
          
          buttons: [
              {
                  text: 'Cancel'
              },
              {
                  text: 'Delete',
                  
                   }
          ]
      });

      prompt.present();  

  }

}
