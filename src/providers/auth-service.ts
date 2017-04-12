import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';


export class User {
  fullname: string;
  username: string;
  email: string;
  password: string;
 
  constructor(fullname: string, username: string, email: string, password:string) {
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

  public createUser(fullname, username, email, password){
    this.currentUser = new User(fullname, username, email, password);
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
      var url = '/db/add/farmer/:fullname/:email/:username/:password/:phonenumber'
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
    return Observable.create(observer => {
      this.currentUser = null;
      observer.next(true);
      observer.complete();
    });
  }
}