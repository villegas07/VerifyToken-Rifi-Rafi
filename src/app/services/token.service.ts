import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  TokenVerificationResponse, 
  PasswordResetResponse, 
  TokenValidationError, 
  NextStep, 
  TourismOption,
  EmailVerificationRequest,
  PasswordResetRequest,
  AccountRecoveryResponse,
  TokenType 
} from '../models/token.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly apiUrl = 'https://rifi-rafi.onrender.com/api';
  private readonly messages = {
    success: '¡Tu cuenta ha sido verificada exitosamente! Ya puedes acceder a todas las funcionalidades de RifiRafi_App.',
    tokenNotFound: 'Token no encontrado en la URL',
    tokenInvalid: 'El token de verificación no es válido o ha expirado'
  };

  constructor(private http: HttpClient) { }

  /**
   * Extrae el token de la URL actual
   */
  extractTokenFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  }

  /**
   * Verifica el token de email con el servidor
   */
  verifyEmailToken(token: string): Observable<TokenVerificationResponse> {
    if (!token) {
      return throwError(() => ({
        type: 'TOKEN_NOT_FOUND',
        message: this.messages.tokenNotFound
      } as TokenValidationError));
    }

    const requestData: EmailVerificationRequest = { token };

    return this.http.post<any>(`${this.apiUrl}/auth/verify-email`, requestData)
      .pipe(
        map((response: any) => ({
          success: true,
          message: this.messages.success,
          data: response.data
        } as TokenVerificationResponse)),
        catchError((error: HttpErrorResponse) => 
          throwError(() => this.mapHttpErrorToTokenError(error))
        )
      );
  }

  /**
   * Restablece la contraseña usando token y nueva contraseña
   */
  resetPassword(token: string, newPassword: string): Observable<PasswordResetResponse> {
    if (!token) {
      return throwError(() => ({
        type: 'TOKEN_NOT_FOUND',
        message: this.messages.tokenNotFound
      } as TokenValidationError));
    }

    if (!newPassword || newPassword.length < 6 || newPassword.length > 36) {
      return throwError(() => ({
        type: 'TOKEN_INVALID',
        message: 'La nueva contraseña debe tener entre 6 y 36 caracteres'
      } as TokenValidationError));
    }

    const requestData: PasswordResetRequest = { token, newPassword };

    return this.http.post<any>(`${this.apiUrl}/auth/reset-password`, requestData)
      .pipe(
        map((response: any) => ({
          success: true,
          message: 'Contraseña cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
          data: response.data
        } as PasswordResetResponse)),
        catchError((error: HttpErrorResponse) => 
          throwError(() => this.mapHttpErrorToTokenError(error))
        )
      );
  }

  /**
   * Recupera la cuenta de usuario usando email o userId
   */
  recoverAccount(identifier: string): Observable<AccountRecoveryResponse> {
    if (!identifier || identifier.trim().length === 0) {
      return throwError(() => ({
        type: 'TOKEN_INVALID',
        message: 'Debes proporcionar un email o ID de usuario'
      } as TokenValidationError));
    }

    return this.http.post<any>(`${this.apiUrl}/users/${encodeURIComponent(identifier)}/recover-account`, {})
      .pipe(
        map((response: any) => ({
          success: true,
          message: 'Se ha enviado un correo de recuperación a tu cuenta. Revisa tu bandeja de entrada.',
          data: response.data
        } as AccountRecoveryResponse)),
        catchError((error: HttpErrorResponse) => 
          throwError(() => this.mapHttpErrorToTokenError(error))
        )
      );
  }

  /**
   * Método heredado para compatibilidad con el componente existente
   */
  verifyToken(token: string): Observable<TokenVerificationResponse> {
    return this.verifyEmailToken(token);
  }

  /**
   * Determina el tipo de operación basado en la URL actual
   */
  getTokenTypeFromUrl(): TokenType {
    const path = window.location.pathname;
    if (path.includes('reset-password')) {
      return 'password-reset';
    }
    return 'email-verification';
  }

  /**
   * Mapea errores HTTP a errores de token
   */
  private mapHttpErrorToTokenError(error: HttpErrorResponse): TokenValidationError {
    if (error.status === 0) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
      };
    }

    if (error.status === 400) {
      return {
        type: 'TOKEN_INVALID',
        message: error.error?.message || 'El token no es válido'
      };
    }

    if (error.status === 404) {
      return {
        type: 'TOKEN_NOT_FOUND',
        message: 'Token no encontrado o ha expirado'
      };
    }

    if (error.status >= 500) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Error del servidor. Intenta nuevamente más tarde.'
      };
    }

    return {
      type: 'TOKEN_INVALID',
      message: error.error?.message || 'Error desconocido'
    };
  }

  /**
   * Obtiene los próximos pasos después de la verificación
   */
  getNextSteps(): NextStep[] {
    return [
      {
        icon: 'fa-link',
        text: 'Verifica que el enlace sea correcto'
      },
      {
        icon: 'fa-redo',
        text: 'Intenta registrarte nuevamente si el token ha expirado',
        link: '/register'
      },
      {
        icon: 'fa-headset',
        text: 'Contacta con soporte si el problema persiste',
        link: '/contact'
      }
    ];
  }

  /**
   * Obtiene las opciones de turismo disponibles
   */
  getTourismOptions(): TourismOption[] {
    // Opciones adaptadas para RifiRafi_App
    return [
      {
        title: 'General',
        description: 'Compite en rondas de trivia y gana premios reales respondiendo preguntas de distintas categorías.',
        icon: 'fa-trophy',
        color: '#f59e0b'
      },
      {
        title: 'Deportes',
        description: 'Demuestra tu conocimiento en deportes y sube en el ranking para obtener recompensas.',
        icon: 'fa-futbol',
        color: '#06b6d4'
      }
    ];
  }
}