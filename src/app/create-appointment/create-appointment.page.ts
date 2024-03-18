import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MainServiceService } from '../service/main-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.page.html',
  styleUrls: ['./create-appointment.page.scss'],
})
export class CreateAppointmentPage implements OnInit {
  enviromentApiUrl: string = '';
  lang: string = 'es';
  customerInfo: any = {};
  upcomingAppointments: any = [];
  companyInfo: any = {};
  services: any = {};
  tab = 0;
  selectedServices = [];
  employeesByServices = [];

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  };

  introAtention: String = '';
  introOk: String = '';
  not_network_msg: String = '';
  error_msg: String = '';
  select_service_msg: String = '';

  constructor(
    private storage: Storage,
    private translate: TranslateService,
    private mainService: MainServiceService,
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit() {
    this.translate.addLangs(['en', 'es']);
    this.storage.create();
    this.mainService.getStorageCompanyInfo().then((companyInfo: any) => {
      this.companyInfo = companyInfo;
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
      this.getServices();
    });
  }

  async getServices() {
    const networkStatus = await this.mainService.getNetworkStatus(); // Check Network Status
    if (networkStatus) {
      const loader = await this.mainService.loader();
      loader.present();
      const request = new URLSearchParams();
      request.set('appToken', this.customerInfo.appToken);
      request.toString();
      this, this.http.post(this.enviromentApiUrl + '/Api/getServices', request, this.httpOptions).subscribe((resApi: any) => {
        if (resApi.error == 0) {
          this.services = resApi.services;
          console.log(this.services);
          loader.dismiss();
        } else {
          this.mainService.showAlert(
            String(this.introAtention),
            String(this.error_msg),
            String(this.introOk)
          );
          loader.dismiss();
        }
      }, (error) => {
        this.mainService.showAlert(
          String(this.introAtention),
          String(this.error_msg),
          String(this.introOk)
        );
        loader.dismiss();
      })
    } else { // Error Network
      this.mainService.showAlert(
        String(this.introAtention),
        String(this.not_network_msg),
        String(this.introOk)
      );
    }
  }

  async clickService(id) {
    const cbx = document.getElementById('cbx-' + id) as HTMLInputElement;
    const isChecked = cbx.checked; console.log('isChecked', isChecked);

    if (isChecked === true) { // Select
      this.selectedServices.push(id);
    } else if (isChecked === false) { // Deselect
      const index = this.selectedServices.indexOf(id);
      if (index !== -1) {
        this.selectedServices.splice(index, 1);
      }
    }

    console.log('selectedServices', this.selectedServices);
  }

  async next() {
    if (this.selectedServices.length > 0) {
      this.tab = 1;
    } else {
      this.mainService.showAlert(
        String(this.introAtention),
        String(this.select_service_msg),
        String(this.introOk)
      );
    }

  }

  async previous() {
    console.log("Previous");
    this.tab = 0;
    setTimeout(() => {
      this.selectedServices.forEach(id => {
        let cbxID = 'cbx-' + Number(id); console.log(cbxID);
        let cbx = document.getElementById(cbxID) as HTMLInputElement; console.log(cbx);
        cbx.checked = true;
      });
    }, 100);
    console.log('selectedServices', this.selectedServices);
  }

  async createAppointment() {

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
    this.translate.get('global.select_service_msg').subscribe((res: any) => {
      this.select_service_msg = res;
    });
  }

}
