import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { MainServiceService } from '../service/main-service.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit {

  platform: string = "";
  isSupported: boolean = false;
  lang: string = "es";
  enviromentApiUrl: string = "";
  companyInfo: any = {};
  userEmail: string = "";
  userPassword: string = "";

  constructor(
    private router: Router,
    private storage: Storage,
    private translate: TranslateService,
    private mainService: MainServiceService,
    private alertController: AlertController,
    private http: HttpClient,
  ) {
    this.translate.addLangs(['en', 'es']);
    this.storage.create();
    this.mainService.deviceInfo().then((device: any) => {
      this.platform = device.platform;
      if (this.platform == 'android' || this.platform == 'ios') {
        this.mainService.barcodeSupported().then((isSupported: boolean) => {
          this.isSupported = isSupported;
        });
      }
    });

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

    this.mainService.getStorageCompanyInfo().then((companyInfo: any) => {
      if (companyInfo != null)
        this.companyInfo = companyInfo;
    });

    this.mainService.getStorageCustomerInfo().then((customerInfo: any) => {
      if(customerInfo) {
        this.userEmail = customerInfo.email;
        this.userPassword = customerInfo.password;
        this.login();
      }
    });
  }

  ngOnInit() {
  }

  async setLang(lang: string) {
    this.lang = lang;
    this.storage.set('appLang', this.lang);
    this.translate.use(this.lang);
  }

  async login() {
    let introAtention: String = "";
    let introRequiredFields: String = "";
    let introOk: String = "";
    let introInvalidURL: String = "";
    let not_network_msg: String = "";

    await this.translate.get('intro.atention').subscribe((res: string) => {
      introAtention = res;
    });
    await this.translate.get('intro.required_fields').subscribe((res: string) => {
      introRequiredFields = res;
    });
    await this.translate.get('intro.ok').subscribe((res: string) => {
      introOk = res;
    });
    await this.translate.get('intro.invalid_url').subscribe((res: any) => {
      introInvalidURL = res;
    });
    await this.translate.get('global.not_network_msg').subscribe((res: any) => {
      not_network_msg = res;
    });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    const resultRequiredValues = await this.requiredValues();
    if (resultRequiredValues == 0) {
      if (this.enviromentApiUrl != "") {
        const networkStatus = await this.mainService.getNetworkStatus();
        if (networkStatus) {
          const apiUrl = this.enviromentApiUrl + "/Api/login";
          const request = new URLSearchParams();
          request.set('email', this.userEmail);
          request.set('password', this.userPassword);
          await this.http.post(apiUrl, request.toString(), httpOptions).subscribe((resApiLogin: any) => { // Enviroment Auth
            console.log(resApiLogin);
            if (resApiLogin.error === 0) {
              this.storage.set('customerInfo', resApiLogin.customerInfo).then((res: any) => {
                this.router.navigate(['dashboard']);
              });
            } else if (resApiLogin.error === 1) {
              if (resApiLogin.msg === 'EMAIL_NOT_FOUND') {
                document.getElementById('txt-email')?.classList.add('is-invalid');
              } else if (resApiLogin.msg === 'INVALID_PASSWORD') {
                document.getElementById('txt-password')?.classList.add('is-invalid');
              }
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
      } else // Error empty enviromentApiUrl
        this.router.navigate(["intro"]);
    }
  }

  async requiredValues() {
    const inputEmail = document.getElementById('txt-email');
    const inputPassword = document.getElementById('txt-password');
    let res = 0;
    if (this.userEmail == "" || this.userPassword == "") {
      res = 1;
      if (this.userEmail == "")
        inputEmail?.classList.add('is-invalid');
      if (this.userPassword == "")
        inputPassword?.classList.add('is-invalid');
    }

    return res;
  }

  async onFocusTxtUrl(inputID: string) {
    const input = document.getElementById(inputID);
    input?.classList.remove('is-invalid')
  }

}
