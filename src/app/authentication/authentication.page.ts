import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

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
  isOpenModal: boolean = false;
  enviromentApiUrl: string = "";
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
  }

  ngOnInit() {
  }

  async setLang(lang: string) {
    this.lang = lang;
    this.storage.set('appLang', this.lang);
    this.isOpenModal = false;
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

    const resultRequiredValues = await this.requiredValues();
    if (resultRequiredValues == 0) {
      if (this.enviromentApiUrl != "") {
        const networkStatus = await this.mainService.getNetworkStatus();
        if (networkStatus) {
          const apiUrl = this.enviromentApiUrl + ".barberhi/Api/login";
          const request = {
            'email': this.userEmail,
            'password': this.userPassword
          }

          await this.http.post(apiUrl, request).subscribe((res: any) => {
            console.log(res)

          }, (error) => {

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
