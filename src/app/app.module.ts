import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, APP_INITIALIZER } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { RouterModule, Routes } from "@angular/router";
import { routing } from "./app.routing";
import { NgbModule, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { AppComponent } from "./app.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AuthService } from "./services/authservice/auth.service";
import { DropDownService } from "./services/dropdownservice/dropdown.service";
import { PreviousRouteService } from "./services/commonservice/previous-route.service";
import { Interceptor } from "./services/interceptor";

import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { PERFECT_SCROLLBAR_CONFIG } from "ngx-perfect-scrollbar";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { EnableCookiesComponent } from "./components/enable-cookies/enable-cookies.component";
import { BrowserDetectComponent } from "./components/browser-detect/browser-detect.component";
import { BrowserCheckGuard } from "./services/browser-check.guard";
import { UserProtectionGuard } from "./services/user-protection.guard";
import { RestrictPathGuard } from "./services/restrict-path.guard";
import { LockScreenComponent } from "./components/lock-screen/lock-screen.component";
import { ClickOutsideModule } from "ng-click-outside";

import { FooterService } from "./shared/utils/footer/footer.service";
import { ToastrModule } from "ngx-toastr";
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CookieService } from "./services/cookies.injectable";
import { DataService } from "./services/commonservice/data.service";

import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { fclReducers } from "./components/search-results/fcl-search/store/reducers";
import { lclReducers } from "./components/search-results/lcl-search/store/reducers";
import { lclAirReducers } from "./components/search-results/air-search/store/reducers";
import { EffectsModule } from "@ngrx/effects";
import { FclShippingEffects } from "./components/search-results/fcl-search/store/effect/shipping.effects";
import { SearchResultService } from "./components/search-results/fcl-search/fcl-search.service";
import { FclForwarderEffects } from "./components/search-results/fcl-search/store/effect/forwarders.effects";
import { LclShippingEffects } from "./components/search-results/lcl-search/store/effect/shipping.effects";
import { ShippingService } from "./components/main/shipping/shipping.service";
import { WarehousingService } from './components/main/warehousing/warehousing.service';

import { LclAirEffects } from "./components/search-results/air-search/store/effect/air.effects";
import { FclAirForwarderEffects } from "./components/search-results/air-search/store/effect/air-forwarders.effects";
import { AgmCoreModule } from '@agm/core'
import { LightboxModule } from 'ngx-lightbox';
import { warehousingReducers } from "./components/search-results/warehousing-search/store/reducers";
import { WarehousingEffects } from "./components/search-results/warehousing-search/store/effect/warehousing.effects";
import { CurrencyControl } from "./shared/currency/currency.injectable";
import { SetupService } from "./shared/setup/setup.injectable";
import { GuestService } from "./shared/setup/jwt.injectable";
import { GeneralService } from "./shared/setup/general.injectable";
import { AdminService } from "./components/booking-process/admin-page/admin-page.service";
import { NotFoundComponent } from "./components/not-found/not-found.component";





const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};



// export const allReducers = Object.assign({}, ...[fclReducers, lclReducers])
export const allReducers = {
  fcl_forwarder: fclReducers.fcl_forwarder,
  fcl_shippings: fclReducers.fcl_shippings,
  lcl_shippings: lclReducers.lcl_shippings,
  lcl_air: lclAirReducers.lcl_air,
  lcl_air_forwarder: lclAirReducers.lcl_air_forwarder,
  warehousing_shippings: warehousingReducers.warehousing_shippings
}

export function guestServiceFactory(provider: GuestService) {
  return () => provider.load();
}
@NgModule({
  declarations: [
    AppComponent,
    EnableCookiesComponent,
    LockScreenComponent,
    BrowserDetectComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    PerfectScrollbarModule,
    routing,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    ToastrModule.forRoot({
      closeButton: true,
      preventDuplicates: true
      // disableTimeOut:true
    }),
    NgScrollbarModule,
    StoreModule.forRoot(allReducers),
    EffectsModule.forRoot([
      FclShippingEffects,
      FclForwarderEffects,
      LclShippingEffects,
      LclAirEffects,
      FclAirForwarderEffects,
      WarehousingEffects
    ]),
    NgbModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg',
      libraries: ["places"]
    }),
    LightboxModule,
  ],
  providers: [
    PreviousRouteService,
    AuthService,
    DropDownService,
    FooterService,
    DataService,
    SearchResultService,
    ShippingService,
    WarehousingService,
    GuestService,
    {
      provide: APP_INITIALIZER,
      useFactory: guestServiceFactory,
      deps: [GuestService],
      multi: true
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    },
    BrowserCheckGuard,
    UserProtectionGuard,
    RestrictPathGuard,
    CookieService,
    NgbActiveModal,
    CurrencyControl,
    SetupService,
    AdminService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
