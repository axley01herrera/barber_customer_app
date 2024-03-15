import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MainServiceService } from '../service/main-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
})
export class AppointmentPage implements OnInit {
  enviromentApiUrl: string = '';
  lang: string = 'es';
  customerInfo: any;
  upcomingAppointments: any = [];
  companyInfo: any = {};

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  };
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
    this.mainService.getStorageCompanyInfo().then((companyInfo: any) => {
      if (companyInfo != null)
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
    });

    this.mainService.getStorageEnviromentApiUrl().then((url: any) => {
      if (url != null) {
        this.enviromentApiUrl = url;
      } else this.router.navigate(['intro']);
    });

    this.mainService.getStorageCustomerInfo().then((customerInfo: any) => {
      this.customerInfo = customerInfo;
    });
  }

}
