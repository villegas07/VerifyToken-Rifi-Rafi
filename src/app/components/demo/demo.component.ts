import { Component } from '@angular/core';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent {
  
  readonly demoLinks = [
    {
      title: 'Token Válido',
      description: 'Prueba con un token válido de la API',
      url: '/?token=demo-valid-token-example-12345',
      icon: 'fa-check-circle',
      color: '#4ade80'
    },
    {
      title: 'Token Inválido',
      description: 'Prueba con un token inválido',
      url: '/?token=invalid-token',
      icon: 'fa-exclamation-triangle',
      color: '#ef4444'
    },
    {
      title: 'Sin Token',
      description: 'Accede sin token en la URL',
      url: '/',
      icon: 'fa-question-circle',
      color: '#6b7280'
    }
  ];
}