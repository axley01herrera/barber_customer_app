import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  constructor(
    private storage: Storage,
  ) {
    this.storage.create();
  }

  /* Device */
  async deviceInfo() {
    const device = await Device.getInfo();
    return device;
  }

  async deviceLang() {
    const deviceLang = await Device.getLanguageCode();
    return deviceLang;
  }

  /* Bar Code */
  async barcodeSupported() {
    const isSupported = BarcodeScanner.isSupported().then((res: any) => {
      return res.supported;
    });
    return isSupported;
  }

  /* Storage */
  async getStorageLang() {
    const lang = this.storage.get('appLang').then((res: any) => {
      return res;
    });

    return lang;
  }

  async getStorageApiUrl() {
    const lang = this.storage.get('apiUrl').then((res: any) => {
      return res;
    });

    return lang;
  }
}
