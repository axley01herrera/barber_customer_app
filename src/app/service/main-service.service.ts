import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';

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

  async getStorageEnviromentApiUrl() {
    const lang = this.storage.get('enviromentApiUrl').then((res: any) => {
      return res;
    });

    return lang;
  }

  async getStorageCompanyInfo() {
    const lang = this.storage.get('companyInfo').then((res: any) => {
      return res;
    });

    return lang;
  }

  /* Network */
  async getNetworkStatus() {
    const status = await Network.getStatus();
    return status.connected;
  }
}
