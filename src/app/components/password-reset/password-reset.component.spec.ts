import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PasswordResetComponent } from './password-reset.component';
import { TokenService } from '../../services/token.service';
import { PasswordResetResponse, TokenValidationError } from '../../models/token.model';

describe('PasswordResetComponent - Integration Tests', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;

  beforeEach(async () => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', [
      'extractTokenFromUrl',
      'resetPassword'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        PasswordResetComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        { provide: TokenService, useValue: tokenServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should extract token from URL on init', () => {
      const mockToken = 'test-token-123';
      tokenService.extractTokenFromUrl.and.returnValue(mockToken);

      component.ngOnInit();

      expect(tokenService.extractTokenFromUrl).toHaveBeenCalled();
      expect(component.token).toBe(mockToken);
    });

    it('should show error when token is not found in URL', () => {
      tokenService.extractTokenFromUrl.and.returnValue(null);

      component.ngOnInit();

      expect(component.resetState).toBe('error');
      expect(component.errorMessage).toContain('Token no encontrado');
    });
  });

  describe('Password Validation - Two Password Fields', () => {
    it('should validate that both passwords are provided', () => {
      component.newPassword = 'password123';
      component.confirmPassword = '';

      const isValid = component.validatePassword();

      expect(isValid).toBe(false);
      expect(component.passwordErrors.length).toBeGreaterThan(0);
    });

    it('should validate that passwords match', () => {
      component.newPassword = 'password123';
      component.confirmPassword = 'different456';

      const isValid = component.validatePassword();

      expect(isValid).toBe(false);
      expect(component.passwordErrors).toContain('Las contraseñas no coinciden');
    });

    it('should pass validation when passwords match', () => {
      component.newPassword = 'password123';
      component.confirmPassword = 'password123';

      const isValid = component.validatePassword();

      expect(isValid).toBe(true);
      expect(component.passwordErrors.length).toBe(0);
    });

    it('should validate minimum password length (6 characters)', () => {
      component.newPassword = '12345'; // 5 caracteres
      component.confirmPassword = '12345';

      const isValid = component.validatePassword();

      expect(isValid).toBe(false);
      expect(component.passwordErrors).toContain('La contraseña debe tener al menos 6 caracteres');
    });

    it('should accept password with exactly 6 characters', () => {
      component.newPassword = '123456';
      component.confirmPassword = '123456';

      const isValid = component.validatePassword();

      expect(isValid).toBe(true);
    });

    it('should validate maximum password length (36 characters)', () => {
      const longPassword = 'a'.repeat(37);
      component.newPassword = longPassword;
      component.confirmPassword = longPassword;

      const isValid = component.validatePassword();

      expect(isValid).toBe(false);
      expect(component.passwordErrors).toContain('La contraseña no puede tener más de 36 caracteres');
    });

    it('should accept password with exactly 36 characters', () => {
      const maxPassword = 'a'.repeat(36);
      component.newPassword = maxPassword;
      component.confirmPassword = maxPassword;

      const isValid = component.validatePassword();

      expect(isValid).toBe(true);
    });

    it('should show error when newPassword is empty', () => {
      component.newPassword = '';
      component.confirmPassword = '';

      const isValid = component.validatePassword();

      expect(isValid).toBe(false);
      expect(component.passwordErrors).toContain('La nueva contraseña es requerida');
    });

    it('should show multiple errors if multiple validations fail', () => {
      component.newPassword = '123'; // muy corta
      component.confirmPassword = '456'; // no coincide

      const isValid = component.validatePassword();

      expect(isValid).toBe(false);
      expect(component.passwordErrors.length).toBeGreaterThan(1);
    });
  });

  describe('Password Reset API Integration', () => {
    beforeEach(() => {
      component.token = 'valid-token-123';
    });

    it('should successfully reset password when both passwords match and are valid', (done) => {
      const mockResponse: PasswordResetResponse = {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: {}
      };

      component.newPassword = 'newPassword123';
      component.confirmPassword = 'newPassword123';

      tokenService.resetPassword.and.returnValue(of(mockResponse));

      component.resetPassword();

      expect(tokenService.resetPassword).toHaveBeenCalledWith('valid-token-123', 'newPassword123');

      setTimeout(() => {
        expect(component.resetState).toBe('success');
        done();
      }, 100);
    });

    it('should show loading state during password reset and then success', (done) => {
      component.newPassword = 'password123';
      component.confirmPassword = 'password123';

      let loadingStateVerified = false;

      tokenService.resetPassword.and.callFake(() => {
        // Verificamos el estado de loading antes de que se complete el observable
        setTimeout(() => {
          if (component.resetState === 'loading') {
            loadingStateVerified = true;
          }
        }, 0);
        
        return of({
          success: true,
          message: 'Success'
        });
      });

      component.resetPassword();

      // Verificar que inicia en loading
      expect(component.resetState).toBe('loading');

      // Esperar a que se complete
      setTimeout(() => {
        expect(loadingStateVerified || component.resetState === 'success').toBe(true);
        done();
      }, 200);
    });

    it('should handle API error during password reset', (done) => {
      const mockError: TokenValidationError = {
        type: 'TOKEN_INVALID',
        message: 'Token inválido o expirado'
      };

      component.newPassword = 'password123';
      component.confirmPassword = 'password123';

      tokenService.resetPassword.and.returnValue(throwError(() => mockError));

      component.resetPassword();

      setTimeout(() => {
        expect(component.resetState).toBe('error');
        expect(component.errorMessage).toBe('Token inválido o expirado');
        done();
      }, 100);
    });

    it('should not call API if passwords do not match', () => {
      component.newPassword = 'password123';
      component.confirmPassword = 'different456';

      component.resetPassword();

      expect(tokenService.resetPassword).not.toHaveBeenCalled();
    });

    it('should not call API if password is too short', () => {
      component.newPassword = '12345';
      component.confirmPassword = '12345';

      component.resetPassword();

      expect(tokenService.resetPassword).not.toHaveBeenCalled();
    });

    it('should not call API if token is missing', () => {
      component.token = null;
      component.newPassword = 'password123';
      component.confirmPassword = 'password123';

      component.resetPassword();

      expect(tokenService.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle new password visibility', () => {
      expect(component.showPassword).toBe(false);

      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(true);

      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(false);
    });

    it('should toggle confirm password visibility', () => {
      expect(component.showConfirmPassword).toBe(false);

      component.toggleConfirmPasswordVisibility();
      expect(component.showConfirmPassword).toBe(true);

      component.toggleConfirmPasswordVisibility();
      expect(component.showConfirmPassword).toBe(false);
    });
  });

  describe('Real-time Password Validation', () => {
    it('should validate password on input change', () => {
      component.newPassword = 'test';
      component.confirmPassword = 'test';

      component.onPasswordChange();

      expect(component.passwordErrors.length).toBeGreaterThan(0);
    });

    it('should clear errors when password is empty', () => {
      component.passwordErrors = ['Some error'];
      component.newPassword = '';

      component.onPasswordChange();

      expect(component.passwordErrors.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle retry reset action', () => {
      component.resetState = 'error';
      component.errorMessage = 'Some error';
      component.passwordErrors = ['Error 1', 'Error 2'];

      component.retryReset();

      expect(component.resetState).toBe('form');
      expect(component.errorMessage).toBe('');
      expect(component.errorType).toBe('');
      expect(component.passwordErrors.length).toBe(0);
    });
  });

  describe('Component States', () => {
    it('should initialize in form state', () => {
      tokenService.extractTokenFromUrl.and.returnValue('token');
      component.ngOnInit();
      
      expect(component.resetState).toBe('form');
    });

    it('should transition to loading state on form submit and then to success', (done) => {
      component.token = 'valid-token';
      component.newPassword = 'password123';
      component.confirmPassword = 'password123';
      
      let loadingStateVerified = false;

      tokenService.resetPassword.and.callFake(() => {
        setTimeout(() => {
          if (component.resetState === 'loading') {
            loadingStateVerified = true;
          }
        }, 0);
        
        return of({
          success: true,
          message: 'Success'
        });
      });

      component.resetPassword();

      // El estado debe ser loading inmediatamente
      expect(component.resetState).toBe('loading');
      
      // Después de completarse, debe estar en success
      setTimeout(() => {
        expect(loadingStateVerified || component.resetState === 'success').toBe(true);
        done();
      }, 200);
    });

    it('should stay in error state until retry', () => {
      component.resetState = 'error';
      component.errorMessage = 'Token expired';

      expect(component.resetState).toBe('error');

      component.retryReset();

      expect(component.resetState).toBe('form');
    });
  });
});
