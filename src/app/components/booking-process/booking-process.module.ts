import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BookingProcessComponent } from './booking-process.component';
import { DepartureComponent } from './departure/departure.component';
import { BookingService } from './booking.service';
// import { BookingOptionalComponent } from './booking-optional/booking-optional.component'
import { UiSwitchModule } from 'ngx-toggle-switch';
import { PreviousRouteService } from '../../services/commonservice/previous-route.service';
// import { ShippingService } from '../main/shipping/shipping.service';
import { PaymentComponent } from './payment/payment.component';
import { OrderSummaryComponent } from './payment/order-summary/order-summary.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TrackingComponent } from './tracking/tracking.component';


export const routes = [
  { path: '', component: BookingProcessComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    RouterModule.forChild(routes),
    UiSwitchModule
  ],
  declarations: [
    BookingProcessComponent,
    DepartureComponent,
    // BookingOptionalComponent,
    PaymentComponent,
    // OrderSummaryComponent,
    TrackingComponent,
    // UiSwitchModule
  ],

  providers: [BookingService, PreviousRouteService]
})
export class BookingProcessModule { }
