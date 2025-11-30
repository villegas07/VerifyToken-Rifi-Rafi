import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../services/token.service';
import { AccountRecoveryResponse, TokenValidationError } from '../../models/token.model';

@Component({
  selector: 'app-account-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-recovery.component.html',
  styleUrls: ['./account-recovery.component.css']
})
export class AccountRecoveryComponent {
  identifier = '';
  currentState: 'form' | 'loading' | 'success' | 'error' = 'form';
  errorMessage = '';
  successMessage = '';

  constructor(private tokenService: TokenService) {}

  /**
   * Valida que el identificador no esté vacío
   */
  validateIdentifier(): boolean {
    if (!this.identifier || this.identifier.trim().length === 0) {
      this.errorMessage = 'Por favor, ingresa tu email o ID de usuario';
      return false;
    }
    
    this.errorMessage = '';
    return true;
  }

  /**
   * Maneja el envío del formulario de recuperación
   */
  onSubmit(): void {
    if (!this.validateIdentifier()) {
      return;
    }

    this.currentState = 'loading';
    this.errorMessage = '';

    this.tokenService.recoverAccount(this.identifier.trim()).subscribe({
      next: (response: AccountRecoveryResponse) => {
        this.currentState = 'success';
        this.successMessage = response.message;
      },
      error: (error: TokenValidationError) => {
        this.currentState = 'error';
        this.errorMessage = error.message || 'No se pudo procesar la solicitud de recuperación';
      }
    });
  }

  /**
   * Maneja el cambio en el campo de identificador
   */
  onIdentifierChange(): void {
    if (this.currentState === 'error') {
      this.errorMessage = '';
    }
  }

  /**
   * Vuelve a intentar la recuperación
   */
  retry(): void {
    this.currentState = 'form';
    this.errorMessage = '';
    this.successMessage = '';
    this.identifier = '';
  }

  /**
   * Navega a la página de inicio de sesión
   */
  goToLogin(): void {
    window.location.href = '/login';
  }
}
