import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MainServiceService } from '../service/main-service.service';
import { Router } from '@angular/router';
import { AppLauncher } from '@capacitor/app-launcher';

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
  isModalOpen = false;
  employees: any = [];
  profileURL: string = '';
  urlCheck: boolean;

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
      this.getEmployees();
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

  async checkCanOpenUrl(url: string) {
    const { value } = await AppLauncher.canOpenUrl({
      url: url,
    });

    this.urlCheck = value;

    console.log('Can open url: ', value);
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

  async getAccount() {
    const networkStatus = await this.mainService.getNetworkStatus();
    if (networkStatus) {
      // Check Network Status

      const loader = await this.mainService.loader();
      await loader.present();

      const loginRequest = new URLSearchParams();
      loginRequest.set('email', this.customerInfo.email);
      loginRequest.set('password', this.customerInfo.password);
      loginRequest.toString();
      this.http
        .post(
          this.enviromentApiUrl + '/Api/login',
          loginRequest,
          this.httpOptions
        )
        .subscribe(
          (resApiLogin: any) => {
            // Api SignIn
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
          },
          (error) => {
            // Error Api SignIn
            loader.dismiss();
            this.logout();
          }
        );
    }
  }

  async getEmployees() {
    const networkStatus = await this.mainService.getNetworkStatus();
    if (networkStatus) {
      const loader = await this.mainService.loader();
      const request = new URLSearchParams();
      request.set('appToken', this.customerInfo.appToken);
      request.toString();
      loader.present();
      this.http
        .post(
          this.enviromentApiUrl + '/Api/getEmployees',
          request,
          this.httpOptions
        )
        .subscribe(
          (resApi: any) => {
            if (resApi.employees.length > 0) {
              this.employees = resApi.employees;
              console.log(resApi.employees);
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

  async saveEmployeePreferred(employeePreferredID: any) {
    const networkStatus = await this.mainService.getNetworkStatus();
    if (networkStatus) {
      const loader = await this.mainService.loader();
      await loader.present();
      const request = new URLSearchParams();
      request.set('customerID', this.customerInfo.id);
      request.set('employeePreferredID', employeePreferredID);
      request.set('appToken', this.customerInfo.appToken);
      request.toString();
      this.http
        .post(
          this.enviromentApiUrl + '/Api/saveEmployeePreferred',
          request,
          this.httpOptions
        )
        .subscribe(
          (resApi: any) => {
            if (resApi.msg == 'invalid_app_token') {
              this.logout();
            }
            if (resApi.error == 0) {
              loader.dismiss();
              this.isModalOpen = false;
              this.getAccount();
            } else {
              loader.dismiss();
              this.mainService.showAlert(
                String(this.introAtention),
                String(this.error_msg),
                String(this.introOk)
              );
            }
          },
          (error) => {
            loader.dismiss();
          }
        );
    }
  }

  async editProfile() {
    const networkStatus = await this.mainService.getNetworkStatus();
    if (networkStatus) {
      const loader = await this.mainService.loader();
      await loader.present();
      const request = new URLSearchParams();
      request.set('customerID', this.customerInfo.id);
      request.set('appToken', this.customerInfo.appToken);
      request.toString();
      this.http
        .post(
          this.enviromentApiUrl + '/Api/editProfile',
          request,
          this.httpOptions
        )
        .subscribe(
          (resApi: any) => {
            if (resApi.msg == 'invalid_app_token') {
              this.logout();
            }
            if (resApi.error == 0) {
              loader.dismiss();
              this.profileURL = resApi.url;
              this.checkCanOpenUrl(
                this.enviromentApiUrl + '/Home/signInCustomer'
              );
              setTimeout(() => {
                this.openURl(this.enviromentApiUrl + '/Home/signInCustomer');
              }, 1000);
            } else {
              loader.dismiss();
              this.mainService.showAlert(
                String(this.introAtention),
                String(this.error_msg),
                String(this.introOk)
              );
            }
          },
          (error) => {
            loader.dismiss();
          }
        );
    }
  }

  async logout() {
    this.storage.clear().then(() => {
      this.router.navigate(['intro']);
    });
  }

  async openURl(url: any) {
    if (this.urlCheck === true) {
      await AppLauncher.openUrl({
        url: url,
      });
    } else {
      this.mainService.showAlert(
        String(this.introAtention),
        String(this.error_msg),
        String(this.introOk)
      );
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
}
