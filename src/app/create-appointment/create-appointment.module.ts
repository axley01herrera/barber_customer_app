import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateAppointmentPageRoutingModule } from './create-appointment-routing.module';

import { CreateAppointmentPage } from './create-appointment.page';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateAppointmentPageRoutingModule,
    TranslateModule
  ],
  declarations: [CreateAppointmentPage]
})
export class CreateAppointmentPageModule {}
