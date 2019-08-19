import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { merge } from 'rxjs/observable/merge';
import { UserComponent } from './user.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BookingsComponent } from './bookings/bookings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserService } from './user-service';
import { BillingsComponent } from './billings/billings.component';
import { SettingsComponent } from './settings/settings.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AllusersComponent } from './allusers/allusers.component';
import { SupportComponent } from './support/support.component';
import { HashStorage } from '../../constants/globalfunctions';
import { NgxImgModule } from "ngx-img";
import { UiSwitchModule } from "ngx-toggle-switch";
import { ProfileSettingsComponent } from './settings/profile-settings/profile-settings.component';
import { DocumentSettingsComponent } from './settings/document-settings/document-settings.component';
import { NotificationSettingsComponent } from './settings/notification-settings/notification-settings.component';
import { BookingService } from '../booking-process/booking.service';
import { NguCarouselModule } from '@ngu/carousel';
import { TabsModule } from 'ngx-tabset';
import { MarkdownModule } from 'ngx-markdown';
import { ReportsComponent } from './reports/reports.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataMapsComponent } from '../../shared/data-map/data-map.component';
import { TrackingOverviewComponent } from './view-booking-detail/tracking-overview/tracking-overview.component';
import { TrackingContainerDetailComponent } from './view-booking-detail/tracking-container-detail/tracking-container-detail.component';
import { TrackingMonitoringComponent } from './tracking-monitoring/tracking-monitoring.component';
import { ContTrackMonComponent } from './cont-track-mon/cont-track-mon.component';

export const routes = [
  { path: '', component: UserComponent,
  children:[
    // { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'bookings', component: BookingsComponent},
    { path: 'booking-detail/:id', loadChildren: '../../public/public.module#PublicModule'},
    // { path: 'billing', component: BillingsComponent},
    { path: 'analytics', component: AnalyticsComponent},
    { path: 'all-users', component: AllusersComponent},
    { path: 'settings', component: SettingsComponent},
    { path: 'reports', component: ReportsComponent },
    { path: 'support', component: SupportComponent}
  ]},
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgScrollbarModule,
    NgxImgModule,
    RouterModule.forChild(routes),
    SharedModule,
    UiSwitchModule,
    NgxPaginationModule,
    UiSwitchModule,
    FormsModule,
    NguCarouselModule,
    NgxEchartsModule,
    TabsModule.forRoot(),
    MarkdownModule.forRoot(),

  ],
  declarations: [
    UserComponent,
    SidenavComponent,
    DashboardComponent,
    BookingsComponent,
    BillingsComponent,
    SettingsComponent,
    AnalyticsComponent,
    AllusersComponent,
    SupportComponent,
    ProfileSettingsComponent,
    DocumentSettingsComponent,
    NotificationSettingsComponent,
    ReportsComponent,
    // DataMapsComponent,
    TrackingOverviewComponent,
    TrackingContainerDetailComponent,
    TrackingMonitoringComponent,
    ContTrackMonComponent
  ],
  providers: [
    UserService,
    BookingService
  ]
})
export class UserModule { }
