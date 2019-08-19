import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { routing } from './pages.route';
import { PagesComponent } from './pages.component';
import { HttpModule, Http } from '@angular/http';
import { HeaderComponent } from '../shared/utils/header/header.component';
import { FooterComponent } from '../shared/utils/footer/footer.component';
import { MegaMenuComponent } from '../shared/utils/menu/mega-menu/mega-menu.component';
import { ToolsComponent } from '../shared/utils/menu/tools/tools.component'
import { RegDialogComponent } from '../shared/dialogues//reg-dialog/reg-dialog.component';

// import { ForgotPasswordComponent } from '../shared/dialogues/forgot-password/forgot-password.component';
import { UpdatePasswordComponent } from '../shared/dialogues/update-password/update-password.component';
import { ToastrModule } from 'ngx-toastr';
import { UserService } from './user/user-service'
import { PagesService } from './pages.service';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { DataService } from '../services/commonservice/data.service';
import { ThankyouPageComponent } from './booking-process/thankyou-page/thankyou-page.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CancelBookingDialogComponent } from '../shared/dialogues/cancel-booking-dialog/confirm-booking-dialog.component';
import { ConfirmLogoutDialogComponent } from '../shared/dialogues/confirm-logout-dialog/confirm-logout-dialog.component';
import { ConfirmModifySearchComponent } from '../shared/dialogues/confirm-modify-search/confirm-modify-search.component';
import { ShareshippingComponent } from '../shared/dialogues/shareshipping/shareshipping.component';
import { ConfirmDeleteAccountComponent } from '../shared/dialogues/confirm-delete-account/confirm-delete-account.component';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../services/auth-guard.service';
import { NguCarouselModule } from '@ngu/carousel';
import { ClickOutsideModule } from 'ng-click-outside';
import { RoutesGuard } from '../services/routes.guard';
import { ConfirmBookingDialogComponent } from '../shared/dialogues/confirm-booking-dialog/confirm-booking-dialog.component';
import { BookingService } from './booking-process/booking.service';
import { ConfirmSavePaymentComponent } from '../shared/dialogues/confirm-save-payment/confirm-save-payment.component';
import { UploadComponent } from '../shared/dialogues/upload-component/upload-component';
import { GeneralService } from '../shared/setup/general.injectable';
import { ConfirmDialogComponent } from '../shared/dialogues/confirm-dialog/confirm-dialog.component';
import { AdminPageComponent } from './booking-process/admin-page/admin-page.component';
import { TermsConditDialogComponent } from '../shared/dialogues/terms-condition/terms-condition.component';
import { BaseComponentUtils } from '../shared/utils/components-utils';
//import { LclSearchComponent } from './lcl-search/lcl-search.component';
//import { AnimatedBannerComponent } from './animated-banner/animated-banner.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};




@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    NgbModule.forRoot(),
    routing,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NguCarouselModule,
    ClickOutsideModule,
    UiSwitchModule
  ],
  declarations: [
    PagesComponent,
    HeaderComponent,
    MegaMenuComponent,
    ToolsComponent,
    RegDialogComponent,
    // LoginDialogComponent,,
    UpdatePasswordComponent,
    CancelBookingDialogComponent,
    ShareshippingComponent,
    ThankyouPageComponent,
    // AnimatedBannerComponent,
    ConfirmLogoutDialogComponent,
    ConfirmModifySearchComponent,
    ConfirmDeleteAccountComponent,
    FooterComponent,
    ConfirmBookingDialogComponent,
    ConfirmSavePaymentComponent,
    UploadComponent,
    ConfirmDialogComponent,
    //LclSearchComponent
    AdminPageComponent,
    TermsConditDialogComponent,
  ],

  entryComponents: [
    RegDialogComponent,
    // LoginDialogComponent,,
    UpdatePasswordComponent,
    CancelBookingDialogComponent,
    ConfirmLogoutDialogComponent,
    ConfirmModifySearchComponent,
    ShareshippingComponent,
    ConfirmDeleteAccountComponent,
    ConfirmBookingDialogComponent,
    ConfirmSavePaymentComponent,
    UploadComponent,
    ConfirmDialogComponent,
    TermsConditDialogComponent
  ],
  providers: [
    // DataService,
    BookingService,
    PagesService,
    UserService,
    BaseComponentUtils,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    AuthGuard,
    RoutesGuard,
    GeneralService
  ]
})
export class PagesModule { }
