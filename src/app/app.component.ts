import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private _router = inject(Router);

  title = 'frontend';

  ngOnInit(): void {
    const token = localStorage.getItem('accessToke');
    const user = localStorage.getItem('user');

    if (token && user) {
      const parsedUser = JSON.parse(user);

      if (parsedUser.role == 'user') {
        this._router.navigate(['user/home']);
      } else if (parsedUser.role == 'company') {
        this._router.navigate(['company/home']);
      } else {
        this._router.navigate(['admin/dashboard']);
      }
    }
  }
}
