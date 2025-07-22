import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignupComponent } from './shared/components/signup/signup.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,SignupPageComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
}
