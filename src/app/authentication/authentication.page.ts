import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MainServiceService } from '../service/main-service.service';
import { Observable } from 'rxjs';

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
  alert = {
    header: "",
    message: "",
    buttons: ['Ok']
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  };

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

    let introAtention: String = "";
    let introRequiredFields: String = "";
    let introOk: String = "";
    let introInvalidURL: String = "";
    let not_network_msg: String = "";
    let firePassMsg: String = "";

    // Alerts Msg
    this.translate.get('intro.atention').subscribe((res: string) => {
      introAtention = res;
    });
    this.translate.get('intro.required_fields').subscribe((res: string) => {
      introRequiredFields = res;
    });
    this.translate.get('intro.ok').subscribe((res: string) => {
      introOk = res;
    });
    this.translate.get('intro.invalid_url').subscribe((res: any) => {
      introInvalidURL = res;
    });
    this.translate.get('global.not_network_msg').subscribe((res: any) => {
      not_network_msg = res;
    });
    this.translate.get('global.firePassMsg').subscribe((res: any) => {
      firePassMsg = res;
    })

    const resultRequiredValues = await this.requiredValues();

    if (resultRequiredValues == 0) { // Check Required Values
      if (this.enviromentApiUrl != "") { // Check Enviroent Url
        const networkStatus = await this.mainService.getNetworkStatus();
        if (networkStatus) { // Check Network Status

          const apiUrl = this.enviromentApiUrl + "/Api/login";
          const request = new URLSearchParams();

          request.set('email', this.userEmail);
          request.set('password', this.userPassword);

          this.http.post(apiUrl, request.toString(), this.httpOptions).subscribe((resApiLogin: any) => { // Api SignIn
            if (resApiLogin.error == 0) {
              alert("Success Api SignIn");
              this.mainService.fireSignIn({ 'email': this.userEmail, 'password': this.userPassword }).then((fireSignIn: any) => { // Fire SignIn

                const uid = fireSignIn.user.uid
                const customer_api_uid = resApiLogin.customerInfo.uid;

                if (customer_api_uid == "null" || customer_api_uid == null || customer_api_uid == "") { // We have save uid on api
                  console.log('Empty customer uid');

                  const apiUrl = this.enviromentApiUrl + "/Api/saveCustomerUid";
                  const request = new URLSearchParams();

                  request.set('appToken', resApiLogin.customerInfo.appToken);
                  request.set('uid', uid);

                  this.http.post(apiUrl, request.toString(), this.httpOptions).subscribe((saveCustomerUid: any) => {
                    if (saveCustomerUid.error == 0) {
                      console.log('Success');
                    } else {
                      alert('Error Api saveCustomerUid');
                    }
                  }, (error) => {
                    alert('Error Api saveCustomerUid');
                  });

                } else { // Empty customer uid
                  /*this.storage.set('customerInfo', resApiLogin.customerInfo).then((res: any) => {
                    this.router.navigate(['dashboard']);
                  });*/
                }
              }).catch((error) => { // Error Fire SignIn
                alert("Error Fire SignIn")
                if (error.code == "auth/invalid-credential") {
                  this.mainService.fireSignUp({ 'email': this.userEmail, 'password': this.userPassword }).then((fireSignUp: any) => { // Fire SignUp
                    alert("Error Fire SignUp");
                  }).catch((error) => { // Error Fire SignUp
                    alert("Error Fire SignUp");
                    if (error.code == "auth/weak-password") {
                      this.alert.header = String(introAtention);
                      this.alert.message = String(firePassMsg);
                      this.showHideAlert(true);
                    }
                  });
                }
              });
            } else if (resApiLogin.error === 1) {
              if (resApiLogin.msg === 'EMAIL_NOT_FOUND') {
                document.getElementById('txt-email')?.classList.add('is-invalid');
              } else if (resApiLogin.msg === 'INVALID_PASSWORD') {
                document.getElementById('txt-password')?.classList.add('is-invalid');
              }
            }
          }, (error) => {
            alert('Error Api Auth');
          });
        } else { // Error network
          this.alert.header = String(introAtention);
          this.alert.message = String(not_network_msg);
          this.showHideAlert(true);
        }
      } else { // Error empty enviromentApiUrl
        this.router.navigate(["intro"]);
      }
    } else {
      this.alert.header = String(introAtention);
      this.alert.message = String(introRequiredFields);
      this.showHideAlert(true);
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

  showHideAlert(showHide: boolean) {
    console.log(showHide);
    this.isAlertOpen = showHide;
  }

  saveCustomerUid(customerInfo: any, uid: any) {

    let result: any;



    return result;
  }
}
