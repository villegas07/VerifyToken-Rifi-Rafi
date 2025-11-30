import { Routes } from '@angular/router';
import { TokenVerificationComponent } from './components/token-verification/token-verification.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { AccountRecoveryComponent } from './components/account-recovery/account-recovery.component';
import { DemoComponent } from './components/demo/demo.component';

export const routes: Routes = [
  {
    path: '',
    component: TokenVerificationComponent
  },
  {
    path: 'verify-email',
    component: TokenVerificationComponent
  },
  {
    path: 'reset-password',
    component: PasswordResetComponent
  },
  {
    path: 'recover-account',
    component: AccountRecoveryComponent
  },
  {
    path: 'demo',
    component: DemoComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
