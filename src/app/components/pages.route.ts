import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PagesComponent } from './pages.component';
import { AuthGuard } from '../services/auth-guard.service';
import { RoutesGuard } from '../services/routes.guard';
import { ThankyouPageComponent } from './booking-process/thankyou-page/thankyou-page.component';
import { AdminPageComponent } from './booking-process/admin-page/admin-page.component';


export const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', loadChildren: 'app/components/login-page/login-page.module#LoginPageModule' },
            { path: 'home', loadChildren: 'app/components/main/main.module#MainModule' },
            // { path: 'partner/:id', loadChildren: 'app/components/vendor-profile/vendor-profile.module#VendorProfileModule' },
            { path: 'admin', component: AdminPageComponent },
            { path: 'fcl-search', loadChildren: 'app/components/search-results/fcl-search/fcl-search.module#SearchresultsModule', canActivate: [RoutesGuard] },
            { path: 'truck-search', loadChildren: 'app/components/search-results/lcl-search/lcl-search.module#LclSearchsModule', canActivate: [RoutesGuard] },
            { path: 'lcl-search', loadChildren: 'app/components/search-results/lcl-search/lcl-search.module#LclSearchsModule', canActivate: [RoutesGuard] },
            { path: 'warehousing', loadChildren: 'app/components/search-results/warehousing-search/warehousing-search.module#WarehousingSearchModule', canActivate: [RoutesGuard] },
            { path: 'air', loadChildren: 'app/components/search-results/air-search/air-search.module#AirSearchModule', canActivate: [RoutesGuard] },
            { path: 'booking-process', loadChildren: 'app/components/booking-process/booking-process.module#BookingProcessModule', canActivate: [RoutesGuard] },
            { path: 'thankyou-booking', component: ThankyouPageComponent, canActivate: [RoutesGuard] },
            { path: 'user', loadChildren: 'app/components/user/user.module#UserModule', canActivate: [AuthGuard] },
            { path: '**', redirectTo: 'home', pathMatch: 'full' }
        ]
    }


];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
