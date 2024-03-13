import { Component, OnInit, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MainServiceService } from '../service/main-service.service';
import { AlertController } from '@ionic/angular';
import { Router } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  enviromentApiUrl: string = "";
  platform: string = "";
  isSupported: boolean = false;
  lang: string = "es";
  customerInfo: any = {};
  upcomingAppointments: any = {};

  constructor(
    private storage: Storage,
    private translate: TranslateService,
    private mainService: MainServiceService,
    private http: HttpClient,
    private alertController: AlertController,
    private router: Router,
  ) {

    this.translate.addLangs(['en', 'es']);
    this.storage.create();

    this.mainService.getStorageLang().then((storageLang: any) => {
      if (storageLang == null) {
        this.mainService.deviceLang().then((deviceLang: any) => {
          this.lang = deviceLang.value;
          this.storage.set('appLang', this.lang);
        })
      } else
        this.lang = storageLang;

      this.translate.use(this.lang);
    });

    this.mainService.getStorageEnviromentApiUrl().then((url: any) => {
      if (url != null) {
        this.enviromentApiUrl = url;
      } else
        this.router.navigate(["intro"]);
    });

    this.mainService.getStorageCustomerInfo().then((customerInfo: any) => {
      this.customerInfo = customerInfo;
      this.getUpcomingAppointments(customerInfo.id);
    });
  }
  ngOnInit() {
  }

  async getUpcomingAppointments(customerID: any) {

    let introAtention: String = "";
    let introOk: String = "";
    let not_network_msg: String = "";

    await this.translate.get('intro.atention').subscribe((res: string) => {
      introAtention = res;
    });

    await this.translate.get('intro.ok').subscribe((res: string) => {
      introOk = res;
    });

    await this.translate.get('global.not_network_msg').subscribe((res: any) => {
      not_network_msg = res;
    });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    const networkStatus = await this.mainService.getNetworkStatus();

    if (networkStatus) {
      const apiUrl = this.enviromentApiUrl + "Api/getCustomerUpcomingAppointments";
      const request = new URLSearchParams();
      request.set('customerID', customerID);
      await this.http.post(apiUrl, request.toString(), httpOptions).subscribe((resApi: any) => { // Fetch Api
        if(resApi) {
          this.upcomingAppointments = resApi.upcomingAppointments;
          console.log(this.upcomingAppointments);
        }
      }, (error) => {
        alert('An error has ocurred');
      });
    } else { // Error network
      const alert = await this.alertController.create({
        header: String(introAtention),
        message: String(not_network_msg),
        buttons: [String(introOk)],
      });
      await alert.present();
    }
  }



}
