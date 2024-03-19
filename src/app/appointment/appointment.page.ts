import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MainServiceService } from '../service/main-service.service';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
})
export class AppointmentPage implements OnInit {
  enviromentApiUrl: string = '';
  lang: string = 'es';
  customerInfo: any;
  appointments: any = [];
  companyInfo: any = {};
  offset = 0;
  date: string = '';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  };

  introAtention: String = '';
  introOk: String = '';
  not_network_msg: String = '';
  error_msg: String = '';
  empty_search_msg: String = '';
  app_deleted_msg: String = '';

  constructor(
    private storage: Storage,
    private translate: TranslateService,
    private mainService: MainServiceService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.translate.addLangs(['en', 'es']);
    this.storage.create();
    this.mainService.getStorageCompanyInfo().then((companyInfo: any) => {
      if (companyInfo != null) this.companyInfo = companyInfo;
    });
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
      this.customerInfo = customerInfo;
      this.getAppointments();
    });
  }

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
    this.translate.get('global.empty_search_msg').subscribe((res: any) => {
      this.empty_search_msg = res;
    });
    this.translate.get('dashboard.app_deleted_msg').subscribe((res: any) => {
      this.app_deleted_msg = res;
    });
  }

  async getAppointments(event?: any) {
    const networkStatus = await this.mainService.getNetworkStatus();
    if (networkStatus) {
      const loader = await this.mainService.loader();
      loader.present();
      const request = new URLSearchParams();
      request.set('customerID', this.customerInfo.id);
      request.set('appToken', this.customerInfo.appToken);
      request.set('offset', this.offset.toString());
      request.set('date', this.date);
      request.toString();
      this.http
        .post(
          this.enviromentApiUrl + '/Api/getCustomerAppointments',
          request,
          this.httpOptions
        )
        .subscribe(
          (resApi: any) => {
            if (resApi.appointments.length > 0) {
              this.appointments.push(...resApi.appointments);
              this.offset = this.offset + parseInt(resApi.offset);
            }
            loader.dismiss();
          },
          (error) => {
            this.mainService.showAlert(
              String(this.introAtention),
              String(this.error_msg),
              String(this.introOk)
            );
            loader.dismiss();
          }
        );
    } else {
      // Error Network
      this.mainService.showAlert(
        String(this.introAtention),
        String(this.not_network_msg),
        String(this.introOk)
      );
    }
  }

  onIonInfinite(event: any) {
    this.getAppointments(event);
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  async openSearch() {
    console.log(this.date);
    const networkStatus = await this.mainService.getNetworkStatus();
    if (networkStatus) {
      const loader = await this.mainService.loader();
      loader.present();
      const request = new URLSearchParams();
      request.set('customerID', this.customerInfo.id);
      request.set('appToken', this.customerInfo.appToken);
      request.set('offset', '0');
      request.set('date', this.date);
      request.toString();
      this.http
        .post(
          this.enviromentApiUrl + '/Api/getCustomerAppointments',
          request,
          this.httpOptions
        )
        .subscribe(
          (resApi: any) => {
            if (resApi.appointments.length > 0) {
              this.appointments = resApi.appointments;
            } else {
              this.mainService.showAlert(
                String(this.introAtention),
                String(this.empty_search_msg),
                String(this.introOk)
              );
            }
            loader.dismiss();
          },
          (error) => {
            this.mainService.showAlert(
              String(this.introAtention),
              String(this.error_msg),
              String(this.introOk)
            );
            loader.dismiss();
          }
        );
    } else {
      // Error Network
      this.mainService.showAlert(
        String(this.introAtention),
        String(this.not_network_msg),
        String(this.introOk)
      );
    }
  }
}
