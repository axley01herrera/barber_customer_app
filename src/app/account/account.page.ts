import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MainServiceService } from '../service/main-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  enviromentApiUrl: string = '';
  lang: string = 'es';
  customerInfo: any = {};
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
      this.getAccount();
    });
  }

  async getAccount() {
    const networkStatus = await this.mainService.getNetworkStatus();
    if (networkStatus) { // Check Network Status

      const loader = await this.mainService.loader();
      await loader.present();

      const loginRequest = new URLSearchParams();
      loginRequest.set('email', this.customerInfo.email);
      loginRequest.set('password', this.customerInfo.password);
      loginRequest.toString();

      this.http.post(this.enviromentApiUrl + '/Api/login', loginRequest, this.httpOptions).subscribe((resApiLogin: any) => { // Api SignIn
        if (resApiLogin.error == 0) {
          this.customerInfo = resApiLogin.customerInfo;
          this.storage.set('customerInfo', this.customerInfo).then(() => {
            loader.dismiss();
            console.log(this.customerInfo);
          });
        } else {
          loader.dismiss();
          this.logout();
        }
      }, (error) => { // Error Api SignIn
        loader.dismiss();
        this.logout();
      }
      );
    }
  }

  async logout() {
    this.storage.clear().then(() => {
      this.router.navigate(["intro"]);
    })
  }
}
