import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TokenService } from './token.service';
import { 
  TokenVerificationResponse, 
  PasswordResetResponse, 
  TokenValidationError,
  EmailVerificationRequest,
  PasswordResetRequest,
  AccountRecoveryResponse,
  AccountRecoveryRequest
} from '../models/token.model';

describe('TokenService - Integration Tests', () => {
  let service: TokenService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://bald-marie-thumbs-blessed.trycloudflare.com/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TokenService]
    });
    service = TestBed.inject(TokenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  describe('Email Verification API Integration', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHR1cmlzYXBwLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    it('should verify email token successfully', (done) => {
      const mockResponse = {
        success: true,
        message: 'Email verificado exitosamente',
        data: {
          userId: '123456',
          email: 'test@turisapp.com'
        }
      };

      service.verifyEmailToken(validToken).subscribe({
        next: (response: TokenVerificationResponse) => {
          expect(response.success).toBe(true);
          expect(response.message).toBeTruthy();
          expect(response.data).toBeDefined();
          expect(response.data?.email).toBe('test@turisapp.com');
          done();
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/verify-email`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token: validToken } as EmailVerificationRequest);
      req.flush(mockResponse);
    });

    it('should handle invalid token error', (done) => {
      const invalidToken = 'invalid-token-123';

      service.verifyEmailToken(invalidToken).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_INVALID');
          expect(error.message).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/verify-email`);
      expect(req.request.method).toBe('POST');
      req.flush(
        { message: 'Token inválido' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle expired token error', (done) => {
      const expiredToken = 'expired-token-xyz';

      service.verifyEmailToken(expiredToken).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_NOT_FOUND');
          expect(error.message).toContain('expirado');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/verify-email`);
      req.flush(
        { message: 'Token no encontrado o ha expirado' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should handle network errors', (done) => {
      service.verifyEmailToken(validToken).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('NETWORK_ERROR');
          expect(error.message).toContain('conexión');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/verify-email`);
      req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should return error when token is empty', (done) => {
      service.verifyEmailToken('').subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_NOT_FOUND');
          expect(error.message).toBeTruthy();
          done();
        }
      });

      httpMock.expectNone(`${apiUrl}/auth/verify-email`);
    });
  });

  describe('Password Reset API Integration', () => {
    const validToken = 'reset-token-abc123xyz';
    const validPassword = 'NewSecurePass123';

    it('should reset password successfully with valid token and password', (done) => {
      const mockResponse = {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: { userId: '123456' }
      };

      service.resetPassword(validToken, validPassword).subscribe({
        next: (response: PasswordResetResponse) => {
          expect(response.success).toBe(true);
          expect(response.message).toContain('exitosamente');
          done();
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ 
        token: validToken, 
        newPassword: validPassword 
      } as PasswordResetRequest);
      req.flush(mockResponse);
    });

    it('should reject password with less than 6 characters', (done) => {
      const shortPassword = '12345';

      service.resetPassword(validToken, shortPassword).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_INVALID');
          expect(error.message).toContain('entre 6 y 36 caracteres');
          done();
        }
      });

      httpMock.expectNone(`${apiUrl}/auth/reset-password`);
    });

    it('should reject password with more than 36 characters', (done) => {
      const longPassword = 'a'.repeat(37);

      service.resetPassword(validToken, longPassword).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_INVALID');
          expect(error.message).toContain('entre 6 y 36 caracteres');
          done();
        }
      });

      httpMock.expectNone(`${apiUrl}/auth/reset-password`);
    });

    it('should handle invalid reset token', (done) => {
      service.resetPassword('invalid-token', validPassword).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_INVALID');
          expect(error.message).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/reset-password`);
      req.flush(
        { message: 'Token de restablecimiento inválido' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle server errors', (done) => {
      service.resetPassword(validToken, validPassword).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('NETWORK_ERROR');
          expect(error.message).toContain('servidor');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/reset-password`);
      req.flush(
        { message: 'Error interno del servidor' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should return error when token is empty', (done) => {
      service.resetPassword('', validPassword).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_NOT_FOUND');
          expect(error.message).toBeTruthy();
          done();
        }
      });

      httpMock.expectNone(`${apiUrl}/auth/reset-password`);
    });

    it('should return error when password is empty', (done) => {
      service.resetPassword(validToken, '').subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_INVALID');
          expect(error.message).toContain('entre 6 y 36 caracteres');
          done();
        }
      });

      httpMock.expectNone(`${apiUrl}/auth/reset-password`);
    });

    it('should accept password with exactly 6 characters (minimum)', (done) => {
      const minPassword = '123456';
      const mockResponse = {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };

      service.resetPassword(validToken, minPassword).subscribe({
        next: (response: PasswordResetResponse) => {
          expect(response.success).toBe(true);
          done();
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/reset-password`);
      expect(req.request.body.newPassword).toBe(minPassword);
      req.flush(mockResponse);
    });

    it('should accept password with exactly 36 characters (maximum)', (done) => {
      const maxPassword = 'a'.repeat(36);
      const mockResponse = {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };

      service.resetPassword(validToken, maxPassword).subscribe({
        next: (response: PasswordResetResponse) => {
          expect(response.success).toBe(true);
          done();
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/reset-password`);
      expect(req.request.body.newPassword).toBe(maxPassword);
      req.flush(mockResponse);
    });
  });

  describe('Helper Methods', () => {
    it('should return next steps for error cases', () => {
      const nextSteps = service.getNextSteps();
      
      expect(nextSteps).toBeDefined();
      expect(nextSteps.length).toBeGreaterThan(0);
      expect(nextSteps[0].icon).toBeDefined();
      expect(nextSteps[0].text).toBeDefined();
    });

    it('should return tourism options', () => {
      const tourismOptions = service.getTourismOptions();
      
      expect(tourismOptions).toBeDefined();
      expect(tourismOptions.length).toBeGreaterThan(0);
      expect(tourismOptions[0].title).toBeDefined();
      expect(tourismOptions[0].description).toBeDefined();
      expect(tourismOptions[0].icon).toBeDefined();
      expect(tourismOptions[0].color).toBeDefined();
    });
  });

  describe('Account Recovery API Integration', () => {
    it('should recover account with email successfully', (done) => {
      const email = 'test@turisapp.com';
      const mockResponse = {
        success: true,
        message: 'Correo de recuperación enviado',
        data: {
          email: email,
          recoveryEmailSent: true
        }
      };

      service.recoverAccount(email).subscribe({
        next: (response: AccountRecoveryResponse) => {
          expect(response.success).toBe(true);
          expect(response.message).toContain('correo de recuperación');
          expect(response.data?.recoveryEmailSent).toBe(true);
          done();
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${encodeURIComponent(email)}/recover-account`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });

    it('should recover account with userId successfully', (done) => {
      const userId = 'user123';
      const mockResponse = {
        success: true,
        message: 'Correo de recuperación enviado',
        data: {
          userId: userId,
          recoveryEmailSent: true
        }
      };

      service.recoverAccount(userId).subscribe({
        next: (response: AccountRecoveryResponse) => {
          expect(response.success).toBe(true);
          expect(response.data?.userId).toBe(userId);
          done();
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${encodeURIComponent(userId)}/recover-account`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle user not found error', (done) => {
      const identifier = 'nonexistent@email.com';

      service.recoverAccount(identifier).subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_NOT_FOUND');
          expect(error.message).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${encodeURIComponent(identifier)}/recover-account`);
      req.flush(
        { message: 'Usuario no encontrado' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should handle empty identifier', (done) => {
      service.recoverAccount('').subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_INVALID');
          expect(error.message).toContain('email o ID de usuario');
          done();
        }
      });

      httpMock.expectNone(`${apiUrl}/users//recover-account`);
    });

    it('should handle whitespace-only identifier', (done) => {
      service.recoverAccount('   ').subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('TOKEN_INVALID');
          expect(error.message).toContain('email o ID de usuario');
          done();
        }
      });

      httpMock.expectNone(`${apiUrl}/users//recover-account`);
    });

    it('should URL encode special characters in identifier', (done) => {
      const emailWithPlus = 'user+test@example.com';
      const mockResponse = {
        success: true,
        message: 'Correo enviado',
        data: { recoveryEmailSent: true }
      };

      service.recoverAccount(emailWithPlus).subscribe({
        next: () => done(),
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${encodeURIComponent(emailWithPlus)}/recover-account`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle server errors', (done) => {
      service.recoverAccount('test@example.com').subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('NETWORK_ERROR');
          expect(error.message).toContain('servidor');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/test%40example.com/recover-account`);
      req.flush(
        { message: 'Error interno del servidor' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle network connection errors', (done) => {
      service.recoverAccount('test@example.com').subscribe({
        next: () => fail('Expected error response'),
        error: (error: TokenValidationError) => {
          expect(error.type).toBe('NETWORK_ERROR');
          expect(error.message).toContain('conexión');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/test%40example.com/recover-account`);
      req.error(new ProgressEvent('error'), { status: 0 });
    });
  });
});
