import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetLangPage } from './set-lang.page';

const routes: Routes = [
  {
    path: '',
    component: SetLangPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetLangPageRoutingModule {}
