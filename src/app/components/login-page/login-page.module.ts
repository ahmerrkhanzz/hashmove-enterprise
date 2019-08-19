import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { LoginDialogComponent } from '../../shared/dialogues/login-dialog/login-dialog.component';
import { LoginPageComponent } from './login-page.component';
import { ForgotPasswordComponent } from '../../shared/dialogues/forgot-password/forgot-password.component';

export const routes = [
  {
    path: '', component: LoginPageComponent, pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgbModule.forRoot(),
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    LoginPageComponent,
    LoginDialogComponent,
    ForgotPasswordComponent
  ],
  entryComponents: [
    LoginDialogComponent,
    ForgotPasswordComponent
  ]
})
export class LoginPageModule { }
