import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-common-landing-page',
  imports: [CommonModule,FormsModule,HeaderComponent,FooterComponent],
  templateUrl: './common-landing-page.component.html',
  styleUrl: './common-landing-page.component.css'
})
export class CommonLandingPageComponent {

 featuredJobs = [
    { id: 1, title: 'Senior Frontend Developer', company: 'TechCorp Inc.', location: 'San Francisco, CA', type: 'Full-time', salary: '$120k - $150k', posted: '2 days ago', logo: '🚀' },
    { id: 2, title: 'Product Manager', company: 'Innovation Labs', location: 'New York, NY', type: 'Full-time', salary: '$130k - $160k', posted: '1 day ago', logo: '💡' },
    { id: 3, title: 'UX/UI Designer', company: 'Creative Studio', location: 'Remote', type: 'Contract', salary: '$90k - $110k', posted: '3 days ago', logo: '🎨' },
    { id: 4, title: 'Data Scientist', company: 'DataFlow Analytics', location: 'Boston, MA', type: 'Full-time', salary: '$140k - $170k', posted: '1 week ago', logo: '📊' },
    { id: 5, title: 'DevOps Engineer', company: 'CloudScale Systems', location: 'Austin, TX', type: 'Full-time', salary: '$115k - $145k', posted: '4 days ago', logo: '⚙️' },
    { id: 6, title: 'Marketing Director', company: 'Growth Dynamics', location: 'Los Angeles, CA', type: 'Full-time', salary: '$125k - $155k', posted: '5 days ago', logo: '📈' },
  ];

  categories = [
    { name: 'Technology', count: 1234, icon: '💻' },
    { name: 'Marketing', count: 856, icon: '📱' },
    { name: 'Design', count: 645, icon: '🎨' },
    { name: 'Finance', count: 432, icon: '💰' },
    { name: 'Healthcare', count: 789, icon: '🏥' },
    { name: 'Education', count: 567, icon: '📚' },
  ];

 

}
