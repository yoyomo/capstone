import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule, JsonpModule } from '@angular/http';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { LogoutPage } from '../pages/logout/logout';
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
import { EditFarmPage } from '../pages/edit-farm/edit-farm';
import { EditZonePage } from '../pages/edit-zone/edit-zone';
import { AllCropInfoPage } from '../pages/all-cropinfo/all-cropinfo';
import { EditCropInfoPage } from '../pages/edit-cropinfo/edit-cropinfo';
import { AddCropInfoPage } from '../pages/add-cropinfo/add-cropinfo';
import { MakeAdminPage } from '../pages/make-admin/make-admin';
import { Sorting } from "../pipes/sorting";
import { ChartsModule } from 'ng2-charts';
import 'chart.js'

import { Geolocation } from '@ionic-native/geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    LogoutPage,
    RegisterPage,
    ForgotPasswordPage,
    HomePage,
    AddPage,
    AddFarmPage,
    AddIrrigationZonePage,
    CropHistoryPage,
    DailyRecPage,
    SettingsPage,
    Sorting,
    EditFarmPage,
    EditZonePage,
    AllCropInfoPage,
    EditCropInfoPage,
    AddCropInfoPage,
    MakeAdminPage
  ],
  imports: [
    IonicModule.forRoot(MyApp), ChartsModule, HttpModule, JsonpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    LogoutPage,
    RegisterPage,
    ForgotPasswordPage,
    HomePage,
    AddPage,
    AddFarmPage,
    AddIrrigationZonePage,
    CropHistoryPage,
    DailyRecPage,
    SettingsPage,
    EditFarmPage,
    EditZonePage,
    AllCropInfoPage,
    EditCropInfoPage,
    AddCropInfoPage, 
    MakeAdminPage   
  
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService
  ]
})
export class AppModule {}
