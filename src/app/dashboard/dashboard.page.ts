import { Component, OnInit , ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { TranslateService } from '@ngx-translate/core';

import { MainServiceService } from '../service/main-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  platform: string = "";
  isSupported: boolean = false;
  lang: string = "es";
  customerInfo: any = {};

  constructor(
    private storage: Storage,
    private translate: TranslateService,
    private mainService: MainServiceService,
  ) {

    this.translate.addLangs(['en', 'es']);
    this.storage.create();

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

    this.mainService.getStorageCustomerInfo().then((customerInfo: any) => {
      this.customerInfo = customerInfo;
      console.log(this.customerInfo);
    })
  }
  ngOnInit() {
  }



}
