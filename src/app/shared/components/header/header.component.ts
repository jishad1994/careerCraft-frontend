import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RouterLink, RouterModule } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  logoUrl = environment.logUrl;
  @Input() isLoggedIn = false;
  @Input() role: string | null = 'user';
  @Output() logout = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchQuery = '';

  onSearch() {
    this.search.emit(this.searchQuery);
  }

  onLogout() {
    this.logout.emit();
  }
}
