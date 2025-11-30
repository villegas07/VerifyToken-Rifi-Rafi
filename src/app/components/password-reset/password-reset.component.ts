import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faLock, 
  faCheckCircle, 
  faExclamationTriangle, 
  faExclamationCircle, 
  faEye, 
  faEyeSlash,
  faSpinner,
  IconDefinition 
} from '@fortawesome/free-solid-svg-icons';
import { TokenService } from '../../services/token.service';
import { PasswordResetResponse, TokenValidationError } from '../../models/token.model';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css'
})
export class PasswordResetComponent implements OnInit {
  
  faLock = faLock;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faExclamationCircle = faExclamationCircle;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faSpinner = faSpinner;
  
  resetState: 'form' | 'loading' | 'success' | 'error' = 'form';
  errorMessage = '';
  errorType: string = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  token: string | null = null;
  
  passwordErrors: string[] = [];

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.tokenService.extractTokenFromUrl();
    
    if (!this.token) {
      this.handleError({
        type: 'TOKEN_NOT_FOUND',
        message: 'Token no encontrado en la URL. Asegúrate de usar el enlace completo del correo electrónico.'
      });
    }
  }

  validatePassword(): boolean {
    this.passwordErrors = [];
    
    if (!this.newPassword) {
      this.passwordErrors.push('La nueva contraseña es requerida');
      return false;
    }
    
    if (this.newPassword.length < 6) {
      this.passwordErrors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (this.newPassword.length > 36) {
      this.passwordErrors.push('La contraseña no puede tener más de 36 caracteres');
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrors.push('Las contraseñas no coinciden');
    }
    
    return this.passwordErrors.length === 0;
  }

  onPasswordChange() {
    if (this.newPassword) {
      this.validatePassword();
    } else {
      this.passwordErrors = [];
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {
    if (!this.validatePassword() || !this.token) {
      return;
    }

    this.resetState = 'loading';
    
    this.tokenService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response: PasswordResetResponse) => {
        this.resetState = 'success';
      },
      error: (error: TokenValidationError) => {
        this.handleError(error);
      }
    });
  }

  private handleError(error: TokenValidationError) {
    this.resetState = 'error';
    this.errorMessage = error.message;
    this.errorType = error.type;
  }

  goToLogin() {
    // Redirigir a la aplicación principal de login
    window.location.href = 'https://turisapp-colombia.com/login';
  }

  requestNewToken() {
    // Redirigir a la página de solicitud de restablecimiento de contraseña
    window.location.href = 'https://turisapp-colombia.com/forgot-password';
  }

  retryReset() {
    this.resetState = 'form';
    this.errorMessage = '';
    this.errorType = '';
    this.passwordErrors = [];
  }
}