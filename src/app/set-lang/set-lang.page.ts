import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { Router } from "@angular/router";

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
  ) {
    this.translate.addLangs(['en', 'es']);
    this.storage.create();
  }

  ngOnInit() {
  }

  async setLang(lang: string) {
    this.lang = lang;
    this.storage.set('appLang', this.lang);
    this.translate.use(this.lang);
    this.router.navigate(["intro"]);
  }

}
