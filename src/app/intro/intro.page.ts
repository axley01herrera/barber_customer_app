import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
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
  isOpenModal: boolean = false;

  constructor(
    private http: HttpClient,
    private mainService: MainServiceService,
    private alertController: AlertController,
    private storage: Storage,
    private translate: TranslateService,
    private router: Router,
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
      if (url != null)
        this.router.navigate(["authentication"]);
    });
  }

  ngOnInit() { }

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

    if (this.url == "") {
      txtUrl?.classList.add('is-invalid');
      const alert = await this.alertController.create({
        header: String(introAtention),
        message: String(introRequiredFields),
        buttons: [String(introOk)],
      });
      await alert.present();
    } else {
      const validateURL = await this.validateURL(this.url); console.log(validateURL);
      if (validateURL) {
        const enviroment = await this.getEnviromentApiUrl(this.url);
        const apiUrl = enviroment + ".barberhi/Api/index";
        const networkStatus = await this.mainService.getNetworkStatus(); console.log('networkStatus', networkStatus);
        if(networkStatus) {
          await this.http.post(apiUrl, '').subscribe((res: any) => {
            if (res.error == 0) {
              this.storage.set('enviromentApiUrl', enviroment).then((res: any) => {
                this.router.navigate(["authentication"]);
              })
            } else { // Error Not Found Enviroment
              txtUrl?.classList.add('is-invalid');
              this.showAlert(String(introAtention), String(introInvalidURL), String(introOk));
            }
          }, (error) => { // Error Not Found Enviroment
            txtUrl?.classList.add('is-invalid');
            this.showAlert(String(introAtention), String(introInvalidURL), String(introOk));
          });
        } else { // Error network
          const alert = await this.alertController.create({
            header: String(introAtention),
            message: String(not_network_msg),
            buttons: [String(introOk)],
          });
          await alert.present();
        }
      } else { // Error Invalid Url
        txtUrl?.classList.add('is-invalid');
        const alert = await this.alertController.create({
          header: String(introAtention),
          message: String(introInvalidURL),
          buttons: [String(introOk)],
        });
        await alert.present();
      }
    }
  }

  getTranslate(key: string) {
    const text = this.translate.get(key).subscribe((res: string) => {
      return res;
    })

    return text;
  }

  async setLang(lang: string) {
    this.lang = lang;
    this.storage.set('appLang', this.lang);
    this.isOpenModal = false;
    this.translate.use(this.lang);
  }

  async openModalLang() {
    this.isOpenModal = true;
  }

  async onFocusTxtUrl() {
    const txtUrl = document.getElementById('txt-url');
    txtUrl?.classList.remove('is-invalid')
  }

  async validateURL(url: string) {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  }

  async getEnviromentApiUrl(url: string) {
    const indexPunto = url.indexOf('.');

    if (indexPunto === -1) {
      return null;
    }

    return url.substring(0, indexPunto);
  }

  async showAlert(headerText: String, messageText: String, buttonText: String) {
    const alert = await this.alertController.create({
      header: String(headerText),
      message: String(messageText),
      buttons: [String(buttonText)],
    });
    await alert.present();
  }

}
