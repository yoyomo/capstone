import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule, JsonpModule } from '@angular/http';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { HomePage } from "../pages/home/home";
import { AddPage } from '../pages/add/add';
import { AddFarmPage } from '../pages/add-farm/add-farm';
import { AddIrrigationZonePage } from '../pages/add-irrigation-zone/add-irrigation-zone';
import { CropHistoryPage } from '../pages/crop-history/crop-history';
import { DailyRecPage } from '../pages/daily-rec/daily-rec';
import { AuthService } from '../providers/auth-service';
import { SettingsPage } from '../pages/settings/settings';
import { ChartsModule } from 'ng2-charts';
import 'chart.js'

import { Geolocation } from '@ionic-native/geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    HomePage,
    AddPage,
    AddFarmPage,
    AddIrrigationZonePage,
    CropHistoryPage,
    DailyRecPage,
    SettingsPage
  
  ],
  imports: [
    IonicModule.forRoot(MyApp), ChartsModule, HttpModule, JsonpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    HomePage,
    AddPage,
    AddFarmPage,
    AddIrrigationZonePage,
    CropHistoryPage,
    DailyRecPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}, AuthService
  ]
})
export class AppModule {}
