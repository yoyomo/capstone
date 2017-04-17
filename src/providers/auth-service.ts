import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';


export class User {
  uid: number;
  fullname: string;
  username: string;
  email: string;
  password: string;
 
  constructor(uid: number, fullname: string, username: string, email: string, password:string) {
    this.uid = uid;
    this.fullname = fullname;
    this.username = username;
    this.email = email;
    this.password = password;
    
  }
}
 
@Injectable()
export class AuthService {
  currentUser: User;

  constructor(private http:Http) {
      
    }

  public createUser(uid, fullname, username, email, password){
    this.currentUser = new User(uid, fullname, username, email, password);
  }


  private accessDatabase(url) {
    return this.http.get(url).map(res => res.json());
  }
 
  public login(credentials) {
    if (credentials.email === null || credentials.password === null) {
      return Observable.throw("Please insert credentials");
    } else {
      var url = '/db/get/farmer/'+JSON.stringify(credentials);
      return this.accessDatabase(url);
    }
  }
 
  public register(credentials) {
    if (credentials.name === null || credentials.lastname === null || credentials.email == null || 
    credentials.email === null || credentials.password === null) {
      return Observable.throw("Please insert credentials");
    } else {
      // At this point store the credentials to your backend!
      var url = '/db/add/farmer/'+JSON.stringify(credentials);
      return this.accessDatabase(url);
    }
  }

  public forgotPassword(credentials) {
    if ( credentials.email === null || credentials.email != "illary.lopes@gmail.com") {
      return Observable.throw("Please insert credentials");
    } else {
      // At this point store the credentials to your backend!
      return Observable.create(observer => {
        let success = (credentials.email === "illary.lopes@gmail.com")
        observer.next(success);
        observer.complete();
      });
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
    var url = '/db/get/crops/'+JSON.stringify(user);
    return this.accessDatabase(url);
  }

  public getUserFarms(user) {
    var url = '/db/get/farms/'+JSON.stringify(user);
    return this.accessDatabase(url);
  }

  public getUserZones(iz) {
    var url = '/db/get/iz/'+JSON.stringify(iz);
    return this.accessDatabase(url);
  }

  public getCropInfos() {
    var url = '/db/get/cropinfo';
    return this.accessDatabase(url);
  }

  public addCrop(crop) {
    var url = '/db/add/crop/'+JSON.stringify(crop);
    return this.accessDatabase(url);
  }

  public getSoils() {
    var url = '/db/get/soils';
    return this.accessDatabase(url);
  }

  public getLatitudes() {
    var url = '/db/get/latitude';
    return this.accessDatabase(url);
  }

  public getLongitudes() {
    var url = '/db/get/longitude';
    return this.accessDatabase(url);
  }

  public addFarm(farm) {
    var url = '/db/add/farm/'+JSON.stringify(farm);
    return this.accessDatabase(url);
  }

  public getIrrigationMethods() {
    var url = '/db/get/irrigationmethod';
    return this.accessDatabase(url);
  }

  public addIrrigationZone(iz) {
    var url = '/db/add/iz/'+JSON.stringify(iz);
    return this.accessDatabase(url);
  }

  public readSpecificCrop(crop) {
    var url = '/db/get/crop/'+JSON.stringify(crop);
    return this.accessDatabase(url);
  }

  public addHistory(history) {
    var url = '/db/add/history/'+JSON.stringify(history);
    return this.accessDatabase(url);
  }

  public updateCrop(crop) {
    var url = '/db/update/crop/'+JSON.stringify(crop);
    return this.accessDatabase(url);
  }

  
}