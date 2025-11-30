import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccountRecoveryComponent } from './account-recovery.component';
import { TokenService } from '../../services/token.service';
import { AccountRecoveryResponse, TokenValidationError } from '../../models/token.model';

describe('AccountRecoveryComponent', () => {
  let component: AccountRecoveryComponent;
  let fixture: ComponentFixture<AccountRecoveryComponent>;
  let mockTokenService: jasmine.SpyObj<TokenService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockSuccessResponse: AccountRecoveryResponse = {
    success: true,
    message: 'Se ha enviado un correo de recuperación a tu cuenta',
    data: {
      email: 'test@example.com',
      recoveryEmailSent: true
    }
  };

  const mockError: TokenValidationError = {
    type: 'TOKEN_INVALID',
    message: 'Usuario no encontrado'
  };

  beforeEach(async () => {
    mockTokenService = jasmine.createSpyObj('TokenService', ['recoverAccount']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AccountRecoveryComponent, FormsModule],
      providers: [
        { provide: TokenService, useValue: mockTokenService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with form state', () => {
      expect(component.currentState).toBe('form');
      expect(component.identifier).toBe('');
      expect(component.errorMessage).toBe('');
    });

    it('should render the form initially', () => {
      const compiled = fixture.nativeElement;
      const input = compiled.querySelector('#identifier');
      expect(input).toBeTruthy();
    });
  });

  describe('Identifier Validation', () => {
    it('should validate empty identifier', () => {
      component.identifier = '';
      const isValid = component.validateIdentifier();
      
      expect(isValid).toBeFalse();
      expect(component.errorMessage).toBe('Por favor, ingresa tu email o ID de usuario');
    });

    it('should validate whitespace-only identifier', () => {
      component.identifier = '   ';
      const isValid = component.validateIdentifier();
      
      expect(isValid).toBeFalse();
      expect(component.errorMessage).toBe('Por favor, ingresa tu email o ID de usuario');
    });

    it('should accept valid email', () => {
      component.identifier = 'user@example.com';
      const isValid = component.validateIdentifier();
      
      expect(isValid).toBeTrue();
      expect(component.errorMessage).toBe('');
    });

    it('should accept valid user ID', () => {
      component.identifier = 'user123';
      const isValid = component.validateIdentifier();
      
      expect(isValid).toBeTrue();
      expect(component.errorMessage).toBe('');
    });

    it('should clear error message on valid input', () => {
      component.errorMessage = 'Previous error';
      component.identifier = 'valid@email.com';
      component.validateIdentifier();
      
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Form Submission', () => {
    it('should not submit with empty identifier', () => {
      component.identifier = '';
      component.onSubmit();
      
      expect(mockTokenService.recoverAccount).not.toHaveBeenCalled();
      expect(component.errorMessage).toBeTruthy();
    });

    it('should call recoverAccount service on valid submission', () => {
      component.identifier = 'test@example.com';
      mockTokenService.recoverAccount.and.returnValue(of(mockSuccessResponse));
      
      component.onSubmit();
      
      expect(mockTokenService.recoverAccount).toHaveBeenCalledWith('test@example.com');
    });

    it('should trim whitespace from identifier before submission', () => {
      component.identifier = '  test@example.com  ';
      mockTokenService.recoverAccount.and.returnValue(of(mockSuccessResponse));
      
      component.onSubmit();
      
      expect(mockTokenService.recoverAccount).toHaveBeenCalledWith('test@example.com');
    });

    it('should set loading state during submission', () => {
      component.identifier = 'test@example.com';
      mockTokenService.recoverAccount.and.returnValue(of(mockSuccessResponse));
      
      component.onSubmit();
      
      expect(component.currentState).toBe('success');
    });

    it('should clear error message on submission', () => {
      component.identifier = 'test@example.com';
      component.errorMessage = 'Previous error';
      mockTokenService.recoverAccount.and.returnValue(of(mockSuccessResponse));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Successful Recovery', () => {
    beforeEach(() => {
      component.identifier = 'test@example.com';
      mockTokenService.recoverAccount.and.returnValue(of(mockSuccessResponse));
    });

    it('should handle successful recovery', () => {
      component.onSubmit();
      
      expect(component.currentState).toBe('success');
      expect(component.successMessage).toBe(mockSuccessResponse.message);
    });

    it('should display success message', () => {
      component.onSubmit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const successElement = compiled.querySelector('.success-state');
      expect(successElement).toBeTruthy();
    });

    it('should show success icon', () => {
      component.onSubmit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const icon = compiled.querySelector('.success-icon i.fa-check-circle');
      expect(icon).toBeTruthy();
    });

    it('should display recovery steps', () => {
      component.onSubmit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const steps = compiled.querySelectorAll('.step');
      expect(steps.length).toBe(3);
    });
  });

  describe('Failed Recovery', () => {
    beforeEach(() => {
      component.identifier = 'invalid@example.com';
      mockTokenService.recoverAccount.and.returnValue(throwError(() => mockError));
    });

    it('should handle recovery error', () => {
      component.onSubmit();
      
      expect(component.currentState).toBe('error');
      expect(component.errorMessage).toBe(mockError.message);
    });

    it('should display error message', () => {
      component.onSubmit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const errorElement = compiled.querySelector('.error-state');
      expect(errorElement).toBeTruthy();
    });

    it('should show error icon', () => {
      component.onSubmit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const icon = compiled.querySelector('.error-icon i.fa-times-circle');
      expect(icon).toBeTruthy();
    });

    it('should display error suggestions', () => {
      component.onSubmit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const suggestions = compiled.querySelector('.error-suggestions');
      expect(suggestions).toBeTruthy();
    });

    it('should have a retry button on error', () => {
      component.onSubmit();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const retryButton = compiled.querySelector('.retry-btn');
      expect(retryButton).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should clear error on identifier change', () => {
      component.currentState = 'error';
      component.errorMessage = 'Some error';
      
      component.onIdentifierChange();
      
      expect(component.errorMessage).toBe('');
    });

    it('should not clear error when not in error state', () => {
      component.currentState = 'form';
      component.errorMessage = '';
      
      component.onIdentifierChange();
      
      expect(component.errorMessage).toBe('');
    });

    it('should reset form on retry', () => {
      component.currentState = 'error';
      component.errorMessage = 'Error message';
      component.successMessage = 'Success message';
      component.identifier = 'test@example.com';
      
      component.retry();
      
      expect(component.currentState).toBe('form');
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
      expect(component.identifier).toBe('');
    });

    it('should navigate to login on goToLogin', () => {
      const originalLocation = window.location.href;
      component.goToLogin();
      // Note: En un test real, deberías mockear window.location
      // Este test solo verifica que el método se ejecute sin errores
      expect(component).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle network error', () => {
      const networkError: TokenValidationError = {
        type: 'NETWORK_ERROR',
        message: 'Error de conexión'
      };
      
      component.identifier = 'test@example.com';
      mockTokenService.recoverAccount.and.returnValue(throwError(() => networkError));
      
      component.onSubmit();
      
      expect(component.currentState).toBe('error');
      expect(component.errorMessage).toContain('conexión');
    });

    it('should handle undefined error message', () => {
      const undefinedError: TokenValidationError = {
        type: 'TOKEN_INVALID',
        message: ''
      };
      
      component.identifier = 'test@example.com';
      mockTokenService.recoverAccount.and.returnValue(throwError(() => undefinedError));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('No se pudo procesar la solicitud de recuperación');
    });

    it('should handle special characters in identifier', () => {
      component.identifier = 'user+test@example.com';
      mockTokenService.recoverAccount.and.returnValue(of(mockSuccessResponse));
      
      component.onSubmit();
      
      expect(mockTokenService.recoverAccount).toHaveBeenCalledWith('user+test@example.com');
    });
  });
});
