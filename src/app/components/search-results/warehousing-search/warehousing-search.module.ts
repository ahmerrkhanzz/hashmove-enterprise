import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WarehousingSearchComponent } from './warehousing-search.component';
import { SharedModule } from '../../../shared/shared.module';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { RoutesGuard } from '../../../services/routes.guard';


export const routes = [
  {
    path: '', component: WarehousingSearchComponent,
    children: [
      { path: '', redirectTo: 'warehousing-search', pathMatch: 'full' },
      { path: 'warehousing-search', component: WarehousingSearchComponent, pathMatch: 'full', canActivate: [RoutesGuard] },
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UiSwitchModule,
    SharedModule
  ],
  declarations: [
    WarehousingSearchComponent
  ]
})

export class WarehousingSearchModule { }
