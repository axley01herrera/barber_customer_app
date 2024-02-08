import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit {
  lang: string = "es";
  isOpenModal: boolean = false;
  constructor(
    private router: Router,
    private storage: Storage,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  async setLang(lang: string) {
    this.lang = lang;
    this.storage.set('appLang', this.lang);
    this.isOpenModal = false;
    this.translate.use(this.lang);
  }

}
