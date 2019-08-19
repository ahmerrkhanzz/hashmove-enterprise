import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';

// import { SearchresultComponent } from './searchresult.component';
// import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
// import { RightSidebarComponent } from './right-sidebar/right-sidebar.component'
// import { SearchResultService } from './searchresult.service';
// import { LeftSidebarForwardersComponent } from './left-sidebar-forwarders/left-sidebar-forwarders.component';

// import { NouisliderModule } from 'ng2-nouislider';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from 'ngx-pagination';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { LclSearchComponent } from './lcl-search.component';
import { RightSidebarComponent } from '../fcl-search/right-sidebar/right-sidebar.component';
import { LclRightsidebarComponent } from './lcl-rightsidebar/lcl-rightsidebar.component';
import { SearchResultService } from '../fcl-search/fcl-search.service';


export const routes = [
  {
    path: '', component: LclSearchComponent,
    children: [
      { path: '', redirectTo: 'consolidators', pathMatch: 'full' },
      { path: 'consolidators', component: LclSearchComponent, pathMatch: 'full' },
      // { path: 'forwarders', component: LclSearchComponent, pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    // NouisliderModule,
    // PerfectScrollbarModule,
    RouterModule.forChild(routes),
    NgbModule,
    FormsModule,
    NgxPaginationModule,
    UiSwitchModule,
    IonRangeSliderModule,
    NgScrollbarModule,
    SharedModule
  ],
  declarations: [
    LclSearchComponent,
    LclRightsidebarComponent
  ],
  providers: [
    SearchResultService
  ]

})
export class LclSearchsModule { }
