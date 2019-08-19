import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirSearchComponent } from './air-search.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AirLinesComponent } from './air-lines/air-lines.component';
import { AirFreightForwardersComponent } from './air-freight-forwarders/air-freight-forwarders.component';

import { IonRangeSliderModule } from 'ng2-ion-range-slider/lib/ion-range-slider.module';


export const routes = [
  {
    path: '', component: AirSearchComponent,
    children: [
      { path: '', redirectTo: 'air-lines', pathMatch: 'full' },
      { path: 'air-lines', component: AirLinesComponent, pathMatch: 'full' },
      { path: 'freight-forwarders', component: AirFreightForwardersComponent, pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    FormsModule,
    SharedModule,
    IonRangeSliderModule
  ],
  declarations: [
    AirSearchComponent,
    AirLinesComponent,
    AirFreightForwardersComponent,
  ]
})
export class AirSearchModule { }
