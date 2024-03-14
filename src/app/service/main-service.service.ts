import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  constructor(
    private storage: Storage,
    private auth: Auth,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
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
  barcodeSupported() {
    const isSupported = BarcodeScanner.isSupported().then((res: any) => {
      return res.supported;
    });
    return isSupported;
  }

  /* Storage */
  getStorageLang() {
    const lang = this.storage.get('appLang').then((res: any) => {
      return res;
    });

    return lang;
  }

  getStorageEnviromentApiUrl() {
    const lang = this.storage.get('enviromentApiUrl').then((res: any) => {
      return res;
    });

    return lang;
  }

  getStorageCompanyInfo() {
    const lang = this.storage.get('companyInfo').then((res: any) => {
      return res;
    });

    return lang;
  }

  getStorageCustomerInfo() {
    const lang = this.storage.get('customerInfo').then((res: any) => {
      return res;
    });

    return lang;
  }

  /* Network */
  async getNetworkStatus() {
    const status = await Network.getStatus();
    return status.connected;
  }

  /* Firebase */
  fireSignIn(user: any) {
    return signInWithEmailAndPassword(this.auth, user.email, user.password)
  }

  fireSignUp(user: any) {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password)
  }

  /* Loader */
  loader() {
    return this.loadingCtrl.create();
  }

  /* Alert */
  async showAlert(headerText: String, messageText: String, buttonText: String) {
    const alert = await this.alertCtrl.create({
      header: String(headerText),
      message: String(messageText),
      buttons: [String(buttonText)],
    });
    await alert.present();
  }

}
