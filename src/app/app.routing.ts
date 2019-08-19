import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { BrowserCheckGuard } from './services/browser-check.guard';
import { EnableCookiesComponent } from './components/enable-cookies/enable-cookies.component';
import { LockScreenComponent } from './components/lock-screen/lock-screen.component';
import { UserProtectionGuard } from './services/user-protection.guard'
import { RestrictPathGuard } from './services/restrict-path.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
// import { BrowserDetectComponent } from './components/browser-detect/browser-detect.component';


export const routes: Routes = [
  { path: 'enable-cookies', component: EnableCookiesComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'lock-screen', component: LockScreenComponent, canLoad: [RestrictPathGuard] },
  { path: 'booking-detail/:id/:id2', loadChildren: './public/public.module#PublicModule'},
  { path: '', loadChildren: 'app/components/pages.module#PagesModule', canActivate: [UserProtectionGuard] },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
  // preloadingStrategy: PreloadAllModules,
  // useHash: true
});
