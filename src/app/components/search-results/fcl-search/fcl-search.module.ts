import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';


import { SearchresultComponent } from './fcl-search.component';
// import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { RightSidebarComponent } from './right-sidebar/right-sidebar.component'
import { SearchResultService } from './fcl-search.service';

import { NouisliderModule } from 'ng2-nouislider';
// import { NoSearchresultComponent } from './no-searchresult/no-searchresult.component'

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from 'ngx-pagination';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgScrollbarModule } from 'ngx-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { ShippingCardComponent } from './shipping-card/shipping-card.component';
import { ForwarderPageComponent } from './forwarder-page/forwarder-page.component'


export const routes = [
  {
    path: '', component: SearchresultComponent,
    children: [
      { path: '', redirectTo: 'shipping-lines', pathMatch: 'full' },
      { path: 'shipping-lines', component: ShippingCardComponent, pathMatch: 'full' },
      { path: 'forwarders', component: ForwarderPageComponent, pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    NouisliderModule,
    PerfectScrollbarModule,
    RouterModule.forChild(routes),
    NgbModule,
    FormsModule,
    NgxPaginationModule,
    UiSwitchModule,
    IonRangeSliderModule,
    NgScrollbarModule,
    SharedModule,
  ],
  declarations: [
    SearchresultComponent,
    // LeftSidebarComponent,
    // RightSidebarComponent,
    // NoSearchresultComponent,
    ShippingCardComponent,
    ForwarderPageComponent,
  ],
  providers: [
    SearchResultService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],

})
export class SearchresultsModule { }
