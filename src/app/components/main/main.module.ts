import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MainComponent } from './main.component';
import { SharedModule } from '../../shared/shared.module';
import { PagesService } from '../pages.service';
import { WhyHashmoveComponent } from './why-hashmove/why-hashmove.component';
import { SpecialsComponent } from './specials/specials.component';
import { MainService } from './main.service';
import { CountdownTimerModule } from 'ngx-countdown-timer';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { PressComponent } from './press/press.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { UspSectionComponent } from './usp-section/usp-section.component';
import { UspSectionService } from './usp-section/usp-section.service';
import { NguCarouselModule } from '@ngu/carousel';
import { NgxPaginationModule } from 'ngx-pagination';


import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SearchResultService } from '../search-results/fcl-search/fcl-search.service';

import { AnimatedBannerComponent } from '../animated-banner/animated-banner.component';
import { ShippingService } from './shipping/shipping.service';
import { ConfirmSavePaymentComponent } from '../../shared/dialogues/confirm-save-payment/confirm-save-payment.component';
import { WarehousingService } from './warehousing/warehousing.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataMapsComponent } from '../../shared/data-map/data-map.component';
import { BookingStaticUtils } from '../booking-process/booking-static-utils';
// import { NgSelectModule } from '@ng-select/ng-select';


export const routes = [
  { path: '', component: MainComponent, pathMatch: 'full' }
];

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};


@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    NgbModule.forRoot(),
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CountdownTimerModule.forRoot(),
    ClickOutsideModule,
    UiSwitchModule,
    SharedModule,
    NguCarouselModule,
    NgxPaginationModule,
    NgxEchartsModule
  ],

  declarations: [
    MainComponent,
    AnimatedBannerComponent,
    WhyHashmoveComponent,
    SpecialsComponent,
    PressComponent,
    UspSectionComponent,
    // DataMapsComponent
  ],
  providers: [
    PagesService,
    ShippingService,
    MainService,
    UspSectionService,
    SearchResultService,
    WarehousingService,
    BookingStaticUtils,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class MainModule { }
