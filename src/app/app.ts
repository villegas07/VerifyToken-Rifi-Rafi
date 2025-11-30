import { Component} from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';

@Component({
   selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'TokenCheck';
}
