import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

declare var require: any;


export class User {
  uid: number;
  fullname: string;
  username: string;
  email: string;
  password: string;
  typeofuser: string;
 
  constructor(uid: number, fullname: string, username: string, 
    email: string, password:string, typeofuser: string) {
    this.uid = uid;
    this.fullname = fullname;
    this.username = username;
    this.email = email;
    this.password = password;
    this.typeofuser = typeofuser
    
  }
}
 
@Injectable()
export class AuthService {
  currentUser: User;

  constructor(private http: Http) {
      
  }

  public createUser(uid, fullname, username, email, password, typeofuser){
    this.currentUser = new User(uid, fullname, username, email, password, typeofuser);
  }

  private clearURL(string){
    string = string.split('%').join('%25');
    string = string.split('/').join('%2F');
    string = string.split('+').join('%2B');
    return string;
  }

  public clearJSON(data){
    for(var d in data){
      if(typeof data[d] === "string") {
        data[d] = this.clearURL(data[d]);

      }else if(Array.isArray(data[d])){
        for(var i=0;i<data[d].length;i++) {
          data[d][i] = this.clearJSON(data[d][i]);
        }
      }
    }
    return data;
  }

  private encryptToString(data){
    var CryptoJS = require('crypto-js');
    var encrypted;
    encrypted = CryptoJS.AES.encrypt(JSON.stringify(data),'h2ocrop2017ICOM5047').toString();
    return encrypted;
  }

  private encryptToURL(data) {
    var encrypted;
    encrypted = this.encryptToString(data);
    encrypted = this.clearURL(encrypted);
    return encrypted;
  }

  private accessDatabaseURL(url) {
    return this.http.get(url).map(res => res.json());
  }
  
  private accessDatabase(url, data) {
    var encrypted = this.encryptToURL(data);
    url = url+encrypted;
    return this.accessDatabaseURL(url);
  }
 
  public login(credentials) {
    if (credentials.email === null || credentials.password === null) {
      return Observable.throw("Please insert credentials");
    } else {
      var url = '/db/get/farmer/';
      return this.accessDatabase(url,credentials);
    }
  }
 
  public register(credentials) {
    if (credentials.name === null || credentials.lastname === null || credentials.email == null || 
    credentials.email === null || credentials.password === null) {
      return Observable.throw("Please insert credentials");
    } else {
      // At this point store the credentials to your backend!
      var url = '/db/add/farmer/';
      return this.accessDatabase(url,credentials);
    }
  }
 
  public getUserInfo() : User {
    return this.currentUser;
  }
 
  public logout() {
    console.log("Logging out...");
    localStorage.setItem("loggedInUser",null);
    this.currentUser = null;
    return;
  }

  public getUserCrops(user) {
    var url = '/db/get/crops/';
    return this.accessDatabase(url,user);
  }

  public getUserFarms(farms) {
    var url = '/db/get/farms/';
    return this.accessDatabase(url,farms);
  }

  public getFarmZones(iz) {
    var url = '/db/get/iz/';
    return this.accessDatabase(url,iz);
  }

  public getUserZones(izs) {
    var url = '/db/get/izs/';
    return this.accessDatabase(url,izs);
  }

  public getCropInfos() {
    var url = '/db/get/cropinfo';
    return this.accessDatabaseURL(url);
  }

  public getCropInfoCategory() {
    var url = '/db/get/cropinfo/category';
    return this.accessDatabaseURL(url);
  }

  public addCrop(crop) {
    var url = '/db/add/crop/';
    return this.accessDatabase(url,crop);
  }

  public getSoils() {
    var url = '/db/get/soils';
    return this.accessDatabaseURL(url);
  }

  public getLatitudes() {
    var url = '/db/get/latitude';
    return this.accessDatabaseURL(url);
  }

  public getLongitudes() {
    var url = '/db/get/longitude';
    return this.accessDatabaseURL(url);
  }

  public addFarm(farm) {
    var url = '/db/add/farm/';
    return this.accessDatabase(url,farm);
  }

  public getIrrigationMethods() {
    var url = '/db/get/irrigationmethod';
    return this.accessDatabaseURL(url);
  }

  public addIrrigationZone(iz) {
    var url = '/db/add/iz/';
    return this.accessDatabase(url,iz);
  }

  public readSpecificCrop(crop) {
    var url = '/db/get/crop/';
    return this.accessDatabase(url,crop);
  }

  public addHistory(history) {
    var url = '/db/add/history/';
    return this.accessDatabase(url,history);
  }

  public updateCrop(crop) {
    var url = '/db/update/crop/';
    return this.accessDatabase(url,crop);
  }

  public updateAllOtherCrops(crop) {
    var url = '/db/update/allothercrops/';
    return this.accessDatabase(url,crop);
  }

  public getHistory(history) {
    var url = '/db/get/history/';
    return this.accessDatabase(url,history);
  }

  public updateNewCrop(crop) {
    var url = '/db/update/newcrop/';
    return this.accessDatabase(url,crop);
  }

  public sendVerify(verify) {
    var url = '/send/verify/';
    return this.accessDatabase(url,verify);
  }

  public forgotPassword(forgotpassword) {
    var url = '/db/forgotpassword/';
    return this.accessDatabase(url,forgotpassword);
  }

  public sendForgotPassword(forgotpassword) {
    var url = '/send/forgotpassword/';
    return this.accessDatabase(url,forgotpassword);
  }

  public editFarmer(farmer) {
    var url = '/db/edit/farmer/';
    return this.accessDatabase(url,farmer);
  }

  public editFarm(farm) {
    var url = '/db/edit/farm/';
    return this.accessDatabase(url,farm);
  }

  public editIrrigationZone(iz) {
    var url = '/db/edit/iz/';
    return this.accessDatabase(url,iz);
  }

  public deleteFarm(farm) {
    var url = '/db/delete/farm/';
    return this.accessDatabase(url,farm);
  }

  public deleteIrrigationZone(iz) {
    var url = '/db/delete/iz/';
    return this.accessDatabase(url,iz);
  }

  public deleteCrop(crop) {
    var url = '/db/delete/crop/';
    return this.accessDatabase(url,crop);
  }

  public editHistory(history) {
    var url = '/db/edit/history/';
    return this.accessDatabase(url,history);
  }

  public editCropInfo(cropinfo) {
    var url = '/db/admin/edit/cropinfo/';
    return this.accessDatabase(url,cropinfo);
  }

  public addCropInfo(cropinfo) {
    var url = '/db/admin/add/cropinfo/';
    return this.accessDatabase(url,cropinfo);
  }

  public deleteCropInfo(cropinfo) {
    var url = '/db/admin/delete/cropinfo/';
    return this.accessDatabase(url,cropinfo);
  }

  public getMasterControl(mc) {
    var url = '/db/get/mc/';
    return this.accessDatabase(url,mc);
  }

  public addMasterControl(mc) {
    var url = '/db/add/mc/';
    return this.accessDatabase(url,mc);
  }

  public editMasterControl(mc) {
    var url = '/db/edit/mc/';
    return this.accessDatabase(url,mc);
  }

  public getValveControl(valve) {
    var url = '/db/get/valve/';
    return this.accessDatabase(url,valve);
  }

  public addValveControl(valve) {
    var url = '/db/add/valve/';
    return this.accessDatabase(url,valve);
  }

  public editValveControl(valve) {
    var url = '/db/edit/valve/';
    return this.accessDatabase(url,valve);
  }

  public editValveIPControl(valve) {
    var url = '/db/edit/valve/control/';
    return this.accessDatabase(url,valve);
  }

  public getControl(crop) {
    var url = '/db/get/crop/control/';
    return this.accessDatabase(url,crop);
  }

  public sendControl(comm) {
    var url = 'http://'+comm.ipaddress+'/micro/irrigate/'+
    JSON.stringify({"valveid":comm.valveid,"amount":comm.comamount});
    return this.accessDatabaseURL(url);
  }

  public stopControl(comm){
    var url = 'http://'+comm.ipaddress+'/micro/stop/'+
    JSON.stringify({"valveid":comm.valveid});
    return this.accessDatabaseURL(url);
  }

  public irrigateCommunication(comm) {
    var url = '/db/add/comm/';
    return this.accessDatabase(url,comm);
  } 

  public stopIrrigation(comm) {
    var url = '/db/add/comm/stop/';
    return this.accessDatabase(url,comm);
  } 

  public receivedCommunication(comm) {
    var url = '/db/update/comm/received/';
    return this.accessDatabase(url,comm);
  } 

  public irrigatingCommunication(comm) {
    var url = '/db/update/comm/irrigating/';
    return this.accessDatabase(url,comm);
  } 

  public finishedCommunication(comm) {
    var url = '/db/update/comm/finished/';
    return this.accessDatabase(url,comm);
  }  

  public deleteMasterControl(mc) {
    var url = '/db/delete/mc/';
    return this.accessDatabase(url,mc);
  } 

  public deleteValveControl(valve) {
    var url = '/db/delete/valve/';
    return this.accessDatabase(url,valve);
  } 
  
}