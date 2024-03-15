import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
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

  isAlertOpen = false;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  };

  introAtention: String = "";
  introRequiredFields: String = "";
  introOk: String = "";
  introInvalidURL: String = "";
  not_network_msg: String = "";
  firePassMsg: String = "";
  error_msg: String = "";

  constructor(
    private router: Router,
    private storage: Storage,
    private translate: TranslateService,
    private mainService: MainServiceService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
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
  }

  ionViewWillEnter() {
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
      if (customerInfo) {
        this.userEmail = customerInfo.email;
        this.userPassword = customerInfo.password;
        this.login();
      }
    });
  }

  async setLang(lang: string) {
    this.lang = lang;
    this.storage.set('appLang', this.lang);
    this.translate.use(this.lang);
  }

  async login() {
    const resultRequiredValues = await this.requiredValues();
    if (resultRequiredValues == 0) { // Check Required Values
      if (this.enviromentApiUrl != "") { // Check Enviroent Url
        const networkStatus = await this.mainService.getNetworkStatus();
        if (networkStatus) { // Check Network Status

          const loader = await this.mainService.loader();
          await loader.present();

          const loginRequest = new URLSearchParams();
          loginRequest.set('email', this.userEmail);
          loginRequest.set('password', this.userPassword);
          loginRequest.toString();

          this.http.post(this.enviromentApiUrl + "/Api/login", loginRequest, this.httpOptions).subscribe((resApiLogin: any) => { // Api SignIn
            if (resApiLogin.error == 0) {

              const customerInfo = resApiLogin.customerInfo;

              const saveUIDRequest = new URLSearchParams();
              saveUIDRequest.set('appToken', resApiLogin.customerInfo.appToken);

              this.mainService.fireSignIn({ 'email': this.userEmail, 'password': '123456' }).then((fireSignIn: any) => { // Fire SignIn

                saveUIDRequest.set('uid', fireSignIn.user.uid);
                saveUIDRequest.toString();

                if (customerInfo.uid == "null" || customerInfo.uid == null || customerInfo.uid == "") { // We have save uid on api

                  this.http.post(this.enviromentApiUrl + "/Api/saveCustomerUID", saveUIDRequest, this.httpOptions).subscribe((saveCustomerUID: any) => {

                    if (saveCustomerUID.error == 0) {
                      customerInfo.uid = fireSignIn.user.uid;
                      this.storage.set('customerInfo', customerInfo).then(() => {
                        loader.dismiss();
                        this.router.navigate(["dashboard"]);
                      });
                    } else { // Error save uid on api
                      loader.dismiss();
                      this.mainService.showAlert(String(this.introAtention), String(this.error_msg), String(this.introOk));
                    }
                  }, (error) => { // Error save uid on api
                    loader.dismiss();
                    this.mainService.showAlert(String(this.introAtention), String(this.error_msg), String(this.introOk));
                  });
                } else {
                  this.storage.set('customerInfo', customerInfo).then(() => {
                    loader.dismiss();
                    this.router.navigate(["dashboard"]);
                  });
                }
              }).catch((error) => { // Error Fire SignIn

                if (error.code == "auth/invalid-credential") { // The user not exist on firebase we have created
                  this.mainService.fireSignUp({ 'email': this.userEmail, 'password': '123456' }).then((fireSignUp: any) => { // Fire SignUp

                    saveUIDRequest.set('uid', fireSignUp.user.uid);
                    saveUIDRequest.toString();

                    this.http.post(this.enviromentApiUrl + "/Api/saveCustomerUID", saveUIDRequest, this.httpOptions).subscribe((saveCustomerUid: any) => {
                      if (saveCustomerUid.error == 0) {
                        customerInfo.uid = fireSignUp.user.uid;
                        this.storage.set('customerInfo', customerInfo).then(() => {
                          loader.dismiss();
                          this.router.navigate(["dashboard"]);
                        });
                      } else { // Error save uid on api
                        loader.dismiss();
                        this.mainService.showAlert(String(this.introAtention), String(this.error_msg), String(this.introOk));
                      }
                    }, (error) => { // Error save uid on api
                      loader.dismiss();
                      this.mainService.showAlert(String(this.introAtention), String(this.error_msg), String(this.introOk));
                    });
                  }).catch((error) => { // Error Fire SignUp
                    loader.dismiss();
                    this.mainService.showAlert(String(this.introAtention), String(this.error_msg), String(this.introOk));
                  });
                }
              });
            } else { // Error Api SignIn
              if (resApiLogin.msg === 'EMAIL_NOT_FOUND')
                document.getElementById('txt-email')?.classList.add('is-invalid');
              else if (resApiLogin.msg === 'INVALID_PASSWORD')
                document.getElementById('txt-password')?.classList.add('is-invalid');
              loader.dismiss();
            }
          }, (error) => { // Error Api SignIn
            loader.dismiss();
            this.mainService.showAlert(String(this.introAtention), String(this.error_msg), String(this.introOk));
          });
        } else // Error network
          this.mainService.showAlert(String(this.introAtention), String(this.not_network_msg), String(this.introOk));
      } else // Error empty enviromentApiUrl
        this.router.navigate(["intro"]);
    } else // Error required fields
      this.mainService.showAlert(String(this.introAtention), String(this.introRequiredFields), String(this.introOk));
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

  showHideAlert(showHide: boolean) {
    console.log(showHide);
    this.isAlertOpen = showHide;
  }

  useText() {
    this.translate.get('intro.atention').subscribe((res: string) => {
      this.introAtention = res;
    });
    this.translate.get('intro.required_fields').subscribe((res: string) => {
      this.introRequiredFields = res;
    });
    this.translate.get('intro.ok').subscribe((res: string) => {
      this.introOk = res;
    });
    this.translate.get('intro.invalid_url').subscribe((res: any) => {
      this.introInvalidURL = res;
    });
    this.translate.get('global.not_network_msg').subscribe((res: any) => {
      this.not_network_msg = res;
    });
    this.translate.get('global.firePassMsg').subscribe((res: any) => {
      this.firePassMsg = res;
    });
    this.translate.get('global.error_msg').subscribe((res: any) => {
      this.error_msg = res;
    });
  }

  async logout() {
    this.storage.clear().then(() => {
      this.router.navigate(["intro"]);
    })
  }
}
