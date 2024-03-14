import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { Router } from "@angular/router";
import { MainServiceService } from '../service/main-service.service';

@Component({
  selector: 'app-set-lang',
  templateUrl: './set-lang.page.html',
  styleUrls: ['./set-lang.page.scss'],
})
export class SetLangPage implements OnInit {
  lang: string = "es";
  constructor(
    private storage: Storage,
    private translate: TranslateService,
    private router: Router,
    private mainService: MainServiceService,
  ) { }

  ngOnInit() {
    this.translate.addLangs(['en', 'es']);
    this.storage.create();
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
  }

  async setLang(lang: string) {
    this.lang = lang;
    this.storage.set('appLang', this.lang);
    this.translate.use(this.lang);
    this.router.navigate(["intro"]);
  }

}
