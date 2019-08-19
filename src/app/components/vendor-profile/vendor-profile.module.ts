import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VendorProfileComponent } from './vendor-profile.component';
import { RouterModule } from '@angular/router';
// import { VendorInfoComponent } from './vendor-info/vendor-info.component';
// import { VendorServicesComponent } from './vendor-services/vendor-services.component';
// import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { SharedModule } from '../../shared/shared.module';
import { BookingDialogueComponent } from './booking-dialogue/booking-dialogue.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { VendorProfileService } from './vendor-profile.service';



export const routes = [
  {
    path: '', component: VendorProfileComponent, pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule.forRoot(),
    SharedModule,
    UiSwitchModule
  ],
  declarations: [
    VendorProfileComponent,
    BookingDialogueComponent,
    SearchResultsComponent
  ],
  entryComponents: [BookingDialogueComponent],
  providers: [VendorProfileService]
})
export class VendorProfileModule { }
