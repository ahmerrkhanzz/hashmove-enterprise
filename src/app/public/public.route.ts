import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PublicComponent } from './public.component';
import { ViewBookingComponent } from '../components/user/view-booking-detail/view-booking.component';
import { Router, ActivatedRoute } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        component: PublicComponent,
        children: [
            // { path: '', redirectTo: 'booking-detail/:id', pathMatch: 'full' },
            { path: '', component: ViewBookingComponent},
        ]
    }


];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
