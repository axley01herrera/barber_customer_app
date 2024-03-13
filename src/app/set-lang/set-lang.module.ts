import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetLangPageRoutingModule } from './set-lang-routing.module';

import { SetLangPage } from './set-lang.page';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetLangPageRoutingModule,
    TranslateModule
  ],
  declarations: [SetLangPage]
})
export class SetLangPageModule {}
