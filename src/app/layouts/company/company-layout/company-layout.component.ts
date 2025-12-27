import { Component } from '@angular/core';
import { CompanySideBarComponent } from '../../../features/company/side-bar/company-side-bar.component';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-company-layout',
  imports: [CompanySideBarComponent, HeaderComponent, FooterComponent,RouterOutlet],
  templateUrl: './company-layout.component.html',
  styleUrl: './company-layout.component.css',
})
export class CompanyLayoutComponent {



}
