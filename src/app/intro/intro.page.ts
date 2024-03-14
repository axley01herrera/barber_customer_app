import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from "@angular/router";

import { MainServiceService } from '../service/main-service.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {

  platform: string = "";
  isSupported: boolean = false;
  barcodes: Barcode[] = [];
  lang: string = "es";
  url: string = "";

  introAtention: String = "";
  introRequiredFields: String = "";
  introOk: String = "";
  introInvalidURL: String = "";
  not_network_msg: String = "";

  constructor(
    private http: HttpClient,
    private mainService: MainServiceService,
    private storage: Storage,
    private translate: TranslateService,
    private router: Router,
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
      this.useText();
    });

    this.mainService.getStorageEnviromentApiUrl().then((url: any) => {
      if (url != null) {
        this.url = url;
        this.router.navigate(["authentication"]);
      }
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted)
      return;

    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async next() {
    const txtUrl = document.getElementById('txt-url');
    if (this.url == "") {
      txtUrl?.classList.add('is-invalid');
      this.mainService.showAlert(String(this.introAtention), String(this.introRequiredFields), String(this.introOk))
    } else {
      const apiUrl = this.url + "/Api/index";
      const networkStatus = await this.mainService.getNetworkStatus();
      if (networkStatus) {
        const loader = await this.mainService.loader();
        await loader.present();
        this.http.post(apiUrl, '').subscribe((resApiIndex: any) => {
          if (resApiIndex.error == 0) {
            let companyInfo = {
              'name': resApiIndex.companyName,
              'type': resApiIndex.companyType,
              'phone': resApiIndex.companyPhone1,
              'email': resApiIndex.companyEmail,
              'avatar': resApiIndex.companyAvatar,
            }
            this.storage.set('enviromentApiUrl', this.url).then((res: any) => {
              this.storage.set('companyInfo', companyInfo).then((res: any) => {
                loader.dismiss();
                this.router.navigate(["authentication"]);
              })
            })
          } else { // Error Not Found Enviroment
            loader.dismiss();
            txtUrl?.classList.add('is-invalid');
            this.mainService.showAlert(String(this.introAtention), String(this.introInvalidURL), String(this.introOk));
          }
        }, (error) => { // Error Not Found Enviroment
          loader.dismiss();
          txtUrl?.classList.add('is-invalid');
          this.mainService.showAlert(String(this.introAtention), String(this.introInvalidURL), String(this.introOk));
        });
      } else { // Error network
        this.mainService.showAlert(String(this.introAtention), String(this.not_network_msg), String(this.introOk))
      }
    }
  }

  async setLang(lang: string) {
    this.lang = lang;
    this.storage.set('appLang', this.lang);
    this.translate.use(this.lang);
  }

  async openModalLang() {
    this.router.navigate(["set-lang"]);
  }

  async onFocusTxtUrl() {
    const txtUrl = document.getElementById('txt-url');
    txtUrl?.classList.remove('is-invalid')
  }

  async useText() {
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
  }
}
