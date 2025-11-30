import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faCheckCircle, faExclamationTriangle, faExclamationCircle, faInfoCircle, faRedo, faLink, faHeadset, faBuilding, faUmbrellaBeach, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { TokenService } from '../../services/token.service';
import { TokenVerificationResponse, TokenValidationError, NextStep, TourismOption } from '../../models/token.model';

@Component({
  selector: 'app-token-verification',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './token-verification.component.html',
  styleUrl: './token-verification.component.css'
})
export class TokenVerificationComponent implements OnInit {
  
  faEnvelope = faEnvelope;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faExclamationCircle = faExclamationCircle;
  faInfoCircle = faInfoCircle;
  faRedo = faRedo;
  
  private iconMap: { [key: string]: IconDefinition } = {
    'fa-link': faLink,
    'fa-redo': faRedo,
    'fa-headset': faHeadset,
    'fa-building': faBuilding,
    'fa-umbrella-beach': faUmbrellaBeach
  };
  
  verificationState: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = '';
  errorType: string = '';
  nextSteps: NextStep[] = [];
  tourismOptions: TourismOption[] = [];

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTourismOptions();
    this.verifyToken();
  }

  verifyToken() {
    this.verificationState = 'loading';
    
    const token = this.tokenService.extractTokenFromUrl();
    
    if (!token) {
      this.handleError({
        type: 'TOKEN_NOT_FOUND',
        message: 'Token no encontrado en la URL'
      });
      return;
    }

    this.tokenService.verifyEmailToken(token).subscribe({
      next: (response: TokenVerificationResponse) => {
        this.verificationState = 'success';
        this.loadTourismOptions();
      },
      error: (error: TokenValidationError) => {
        this.handleError(error);
      }
    });
  }

  private handleError(error: TokenValidationError) {
    this.verificationState = 'error';
    this.errorMessage = error.message;
    this.errorType = error.type;
    this.loadNextSteps();
  }

  private loadNextSteps() {
    this.nextSteps = this.tokenService.getNextSteps();
  }

  private loadTourismOptions() {
    this.tourismOptions = this.tokenService.getTourismOptions();
  }

  retryVerification() {
    this.verifyToken();
  }

  goToApp() {
    // Redirigir a la aplicación principal (externa)
    window.location.href = 'https://turisapp-colombia.com';
  }

  exploreDestinations() {
    // Redirigir a la sección de destinos (externa)
    window.location.href = 'https://turisapp-colombia.com/destinos';
  }
  
  getIcon(iconName: string): IconDefinition {
    return this.iconMap[iconName] || faInfoCircle;
  }
}