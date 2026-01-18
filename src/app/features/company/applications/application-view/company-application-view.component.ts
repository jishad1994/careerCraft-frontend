import { Component } from '@angular/core';
import { IJobApplication } from '../../../../models/job-application/job-application.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyApplicationService } from '../../../../services/company/applications/company-application.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-application-view',
  imports: [FormsModule,CommonModule],
  templateUrl: './company-application-view.component.html',
  styleUrl: './company-application-view.component.css'
})
export class CompanyApplicationViewComponent {
application: IJobApplication | null = null;
  loading = false;
  applicationId: string = '';


  showStatusModal = false;
  showNotesModal = false;

  
  newStatus = '';
  statusNotes = '';
  notes = '';

  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'hired', label: 'Hired' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: CompanyApplicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.applicationId = params['id'];
      if (this.applicationId) {
        this.loadApplication();
      }
    });
  }

  loadApplication() {
    this.loading = true;
    
    this.applicationService.getApplicationById(this.applicationId).subscribe({
      next: (response) => {
        this.application = response.data;
        
        if (!this.application.viewedAt) {
          this.markAsViewed();
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load application', 'Close', {
          duration: 3000
        });
        this.loading = false;
        this.router.navigate(['/company/dashboard/applications']);
      }
    });
  }

  markAsViewed() {
    this.applicationService.markAsViewed(this.applicationId).subscribe({
      next: () => {
        if (this.application) {
          this.application.viewedAt = new Date();
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/company/dashboard/applications']);
  }

  openStatusModal() {
    if (!this.application) return;
    this.newStatus = this.application.status;
    this.statusNotes = '';
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.newStatus = '';
    this.statusNotes = '';
  }

  openNotesModal() {
    if (!this.application) return;
    this.notes = this.application.notes || '';
    this.showNotesModal = true;
  }

  closeNotesModal() {
    this.showNotesModal = false;
    this.notes = '';
  }

  submitStatusChange() {
    if (!this.newStatus) return;

    this.applicationService.updateApplicationStatus(
      this.applicationId,
      this.newStatus,
      this.statusNotes
    ).subscribe({
      next: () => {
        this.snackBar.open('Status updated successfully', 'Close', {
          duration: 2000
        });
        this.loadApplication();
        this.closeStatusModal();
      },
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', {
          duration: 3000
        });
      }
    });
  }

  submitNotes() {
    if (!this.notes.trim()) return;

    this.applicationService.addNotes(this.applicationId, this.notes).subscribe({
      next: () => {
        this.snackBar.open('Notes saved successfully', 'Close', {
          duration: 2000
        });
        this.loadApplication();
        this.closeNotesModal();
      },
      error: () => {
        this.snackBar.open('Failed to save notes', 'Close', {
          duration: 3000
        });
      }
    });
  }

  downloadResume() {
    if (this.application?.resume?.signedURL) {
      window.open(this.application.resume.signedURL, '_blank');
    }
  }

  getApplicantName(): string {
    if (!this.application) return '';
    const applicant = this.application.applicant;
    return applicant.firstName || `${applicant.lastName || ''}`.trim() || 'Unknown';
  }

  getApplicantInitials(): string {
    const name = this.getApplicantName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reviewing: 'bg-blue-100 text-blue-800 border-blue-300',
      shortlisted: 'bg-purple-100 text-purple-800 border-purple-300',
      interviewed: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      offered: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-300',
      hired: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
    return classes[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
