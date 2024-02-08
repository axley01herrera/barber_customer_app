import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  device: any;
  appLang: string = "";
  isOpenSelLang: boolean = false;

  constructor(
    private storage: Storage,
    private translate: TranslateService
  ) {
    this.translate.addLangs(['en', 'es']);
    this.storage.create();
    
    this.getStorageLang().then((resStorageLang: any) => {
      if (resStorageLang == null) {
        this.deviceLang().then((resDeviceLang: any) => {
          console.log('resDeviceLang', resDeviceLang);
          this.appLang = resDeviceLang.value;
          this.storage.set('appLang', resDeviceLang.value);
        })
      } else
        this.appLang = resStorageLang;

      this.translate.use(this.appLang);
    });
  }

  async getStorageLang() {
    const storageLang = this.storage.get('appLang').then((res: any) => {
      return res;
    });

    return storageLang;
  }

  async deviceInfo() {
    this.device = await Device.getInfo();
  }

  async deviceLang() {
    const deviceLang = await Device.getLanguageCode();
    return deviceLang;
  }

  async openSelLang() {
    this.isOpenSelLang = true;
  }

  async setLang(lang: string) {
    this.appLang = lang;
    this.storage.set('appLang', lang);
    this.isOpenSelLang = false;
    this.translate.use(lang);
  }
}
