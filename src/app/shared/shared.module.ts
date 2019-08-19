import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchHeaderComponent } from './utils/search-header/search-header.component';
import { SearchFooterComponent } from './utils/search-footer/search-footer.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { FilterPipe } from '../constants/filter.pipe';
import { FloatNumbersPipe } from '../constants/float-number.pipe';
import { LoaderComponent } from './loader/loader.component';
import { OptionalBillingComponent } from '../shared/optional-billing/optional-billing.component';
import { CookieService } from '../services/cookies.injectable';
import { RightSidebarComponent } from '../components/search-results/fcl-search/right-sidebar/right-sidebar.component'
import { SearchPipe } from '../constants/search.pipe';
import { DragDropComponent } from './dialogues/drag-drop/drag-drop.component';
import { FileDropModule } from 'angular2-file-drop';
import { DndDirective } from '../services/dnd.directive';
import { CurrencyDropdownComponent } from './currency-dropdown/currency-dropdown.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HashmoveMap } from './map-utils/map.component';
import { SearchCardComponent } from './cards/search-card/search-card.component';
import { LeftSidebarComponent } from '../components/search-results/fcl-search/left-sidebar/left-sidebar.component'
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UiSwitchModule } from 'ngx-toggle-switch';
import { NoSearchresultComponent } from '../components/search-results/fcl-search/no-searchresult/no-searchresult.component'
import { BookingOptionalComponent } from '../components/booking-process/booking-optional/booking-optional.component';
import { ShippingService } from '../components/main/shipping/shipping.service';
import { HashCardComponent } from './cards/hash-search-card/hash-search-card.component';
import { HashFiltersSidebarComponent } from './sidebars/hash-filters-sidebar/hash-filters-sidebar.component';
import { ConfirmSwitchContainersComponent } from './dialogues/confirm-switch-containers/confirm-switch-containers.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TwoDigitDecimalNumberDirective } from '../directives/two-digit-decimal-number.directive';
import { HashFiltersForwarderSidebarComponent } from './sidebars/hash-filters-forwarder-sidebar/hash-filters-forwarder-sidebar.component';
import { OrderSummaryComponent } from '../components/booking-process/payment/order-summary/order-summary.component';
import { SafeHTML } from '../constants/safe-html.pipe';
import { BookingCardComponent } from './cards/booking-card/booking-card.component';
import { ViewBookingCardComponent } from './cards/view-booking-card/view-booking-card.component';
import { SelectionSummaryComponent } from './cards/selection-summary/selection-summary.component';
import { DealsComponent } from '../components/main/deals/deals.component';
import { WarehousingComponent } from '../components/main/warehousing/warehousing.component';
import { ShippingComponent } from '../components/main/shipping/shipping.component';
import { TruckComponent } from '../components/main/shipping/truck/truck.component'
import { ClickOutsideModule } from 'ng-click-outside';
import { BestRouteComponent } from '../components/search-results/air-search/best-route/best-route.component';
import { LclLeftSidebarComponent } from '../components/search-results/lcl-search/lcl-left-sidebar/lcl-left-sidebar.component';
import { LeftSidebarForwardersComponent } from '../components/search-results/fcl-search/left-sidebar-forwarders/left-sidebar-forwarders.component';
import { VendorInfoComponent } from '../components/vendor-profile/vendor-info/vendor-info.component';
import { VendorServicesComponent } from '../components/vendor-profile/vendor-services/vendor-services.component';
import { VendorDetailsComponent } from '../components/vendor-profile/vendor-details/vendor-details.component';
import { VendorProfileService } from '../components/vendor-profile/vendor-profile.service';
import { VendorFeedbackComponent } from './vendor-feedback/vendor-feedback.component';
import { ReviewComponent } from './dialogues/review/review.component';
import { NguCarouselModule } from '@ngu/carousel';
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS } from 'ngx-slimscroll';
import { VideoDialogComponent } from './dialogues/video-dialog/video-dialog.component';
import { ViewBookingTableComponent } from './tables/view-booking-table/view-booking-table.component';
import { RequestSpeacialPriceComponent } from './dialogues/request-speacial-price/request-speacial-price.component';
import { DataMapsComponent } from './data-map/data-map.component';
import { SpecialRequestCardComponent } from './cards/special-request-card/special-request-card.component';

import { CargoDetailsComponent } from './dialogues/cargo-details/cargo-details.component';
import { PriceLogsComponent } from './dialogues/price-logs/price-logs.component';
import { NotifyVendorComponent } from './notify-vendor/notify-vendor.component'
import { CookieBarComponent } from './utils/cookie-bar/cookie-bar.component'
import { AirComponent } from '../components/main/shipping/air/air.component';
import { FetchingComponent } from '../components/search-results/fcl-search/fetching.component/fetching.component';
import { ContainerInfoComponent } from './dialogues/container-info/container-info.component';

@NgModule({
  imports: [
    CommonModule,
    FileDropModule,
    NgScrollbarModule,
    NgbModule,
    IonRangeSliderModule,
    FormsModule,
    UiSwitchModule,
    NgxPaginationModule,
    ClickOutsideModule,
    NguCarouselModule,
    NgSlimScrollModule
  ],
  declarations: [
    SearchHeaderComponent,
    SearchFooterComponent,
    PlaceholderComponent,
    FilterPipe,
    FloatNumbersPipe,
    LoaderComponent,
    SearchPipe,
    DragDropComponent,
    DndDirective,
    CurrencyDropdownComponent,
    OptionalBillingComponent,
    HashmoveMap,
    SearchCardComponent,
    LeftSidebarComponent,
    RightSidebarComponent,
    NoSearchresultComponent,
    BookingOptionalComponent,
    HashCardComponent,
    HashFiltersSidebarComponent,
    HashFiltersForwarderSidebarComponent,
    ConfirmSwitchContainersComponent,
    TwoDigitDecimalNumberDirective,
    OrderSummaryComponent,
    SafeHTML,
    BookingCardComponent,
    ViewBookingCardComponent,
    SpecialRequestCardComponent,
    SelectionSummaryComponent,
    DealsComponent,
    WarehousingComponent,
    ShippingComponent,
    TruckComponent,
    BestRouteComponent,
    LclLeftSidebarComponent,
    LeftSidebarForwardersComponent,
    VendorInfoComponent,
    VendorServicesComponent,
    VendorDetailsComponent,
    VendorFeedbackComponent,
    ReviewComponent,
    VideoDialogComponent,
    RequestSpeacialPriceComponent,
    ViewBookingTableComponent,
    DataMapsComponent,
    CargoDetailsComponent,
    PriceLogsComponent,
    CookieBarComponent,
    NotifyVendorComponent,
    AirComponent,
    FetchingComponent,
    ContainerInfoComponent
  ],
  entryComponents: [
    OptionalBillingComponent,
    ConfirmSwitchContainersComponent,
    ReviewComponent,
    VideoDialogComponent,
    RequestSpeacialPriceComponent,
    CargoDetailsComponent,
    PriceLogsComponent,
    CookieBarComponent,
    ContainerInfoComponent
  ],
  exports: [
    SearchHeaderComponent,
    SearchFooterComponent,
    PlaceholderComponent,
    OptionalBillingComponent,
    FilterPipe,
    LoaderComponent,
    SearchPipe,
    DragDropComponent,
    DndDirective,
    CurrencyDropdownComponent,
    NgScrollbarModule,
    NgbModule,
    HashmoveMap,
    SearchCardComponent,
    BookingCardComponent,
    SpecialRequestCardComponent,
    HashCardComponent,
    LeftSidebarComponent,
    RightSidebarComponent,
    NoSearchresultComponent,
    BookingOptionalComponent,
    HashFiltersSidebarComponent,
    HashFiltersForwarderSidebarComponent,
    ConfirmSwitchContainersComponent,
    TwoDigitDecimalNumberDirective,
    OrderSummaryComponent,
    SafeHTML,
    ViewBookingCardComponent,
    SelectionSummaryComponent,
    DealsComponent,
    WarehousingComponent,
    ShippingComponent,
    TruckComponent,
    BestRouteComponent,
    LclLeftSidebarComponent,
    LeftSidebarForwardersComponent,
    VendorInfoComponent,
    VendorServicesComponent,
    VendorDetailsComponent,
    VendorFeedbackComponent,
    VideoDialogComponent,
    ViewBookingTableComponent,
    RequestSpeacialPriceComponent,
    CargoDetailsComponent,
    PriceLogsComponent,
    DataMapsComponent,
    CookieBarComponent,
    NotifyVendorComponent,
    AirComponent,
    FetchingComponent
  ],
  providers: [
    ShippingService,
    VendorProfileService,
    {
      provide: SLIMSCROLL_DEFAULTS,
      useValue: {
        alwaysVisible: true
      }
    }
  ]
})
export class SharedModule {}
