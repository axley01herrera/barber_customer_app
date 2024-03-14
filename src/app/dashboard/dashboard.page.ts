import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MainServiceService } from '../service/main-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  enviromentApiUrl: string = '';
  platform: string = '';
  lang: string = 'es';
  customerInfo: any;
  upcomingAppointments: any = [];

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  };

  introAtention: String = '';
  introOk: String = '';
  not_network_msg: String = '';
  error_msg: String = "";

  constructor(
    private storage: Storage,
    private translate: TranslateService,
    private mainService: MainServiceService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.translate.addLangs(['en', 'es']);
    this.storage.create();
  }

  ionViewWillEnter() {
    this.mainService.getStorageLang().then((storageLang: any) => {
      if (storageLang == null) {
        this.mainService.deviceLang().then((deviceLang: any) => {
          this.lang = deviceLang.value;
          this.storage.set('appLang', this.lang);
        });
      } else this.lang = storageLang;

      this.translate.use(this.lang);
      this.useText();
    });

    this.mainService.getStorageEnviromentApiUrl().then((url: any) => {
      if (url != null) {
        this.enviromentApiUrl = url;
      } else this.router.navigate(['intro']);
    });

    this.mainService.getStorageCustomerInfo().then((customerInfo: any) => {
      this.customerInfo = customerInfo; console.log(this.customerInfo)
      this.getUpcomingAppointments();
    });
  }

  async getUpcomingAppointments() {
    const networkStatus = await this.mainService.getNetworkStatus();
    if (networkStatus) {
      const loader = await this.mainService.loader();
      loader.present();
      const request = new URLSearchParams();
      request.set('customerID', this.customerInfo.id);
      request.set('appToken', this.customerInfo.appToken);
      request.toString();
      this.http.post(this.enviromentApiUrl + 'Api/getCustomerUpcomingAppointments', request, this.httpOptions).subscribe((resApi: any) => {
        if (resApi.upcomingAppointments.length > 0) {
          this.upcomingAppointments = resApi.upcomingAppointments;
        }
        loader.dismiss();
      }, (error) => {
        this.mainService.showAlert(String(this.introAtention), String(this.error_msg), String(this.introOk));
        loader.dismiss();
      });
    } else // Error Network
      this.mainService.showAlert(String(this.introAtention), String(this.not_network_msg), String(this.introOk));
  };

  useText() {
    this.translate.get('intro.atention').subscribe((res: string) => {
      this.introAtention = res;
    });
    this.translate.get('intro.ok').subscribe((res: string) => {
      this.introOk = res;
    });
    this.translate.get('global.not_network_msg').subscribe((res: any) => {
      this.not_network_msg = res;
    });
    this.translate.get('global.error_msg').subscribe((res: any) => {
      this.error_msg = res;
    });
  }

  async cancelAppointment (appointmentID: any) {
    console.log('appointmentID', appointmentID);
  }
}
