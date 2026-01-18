import { Component, OnDestroy, OnInit } from '@angular/core';
import { IJobApplication } from '../../../../models/job-application/job-application.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyApplicationService } from '../../../../services/company/applications/company-application.service';
import { Subject, takeUntil } from 'rxjs';
import { Job } from '../../../../models/job/job.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-applications-list',
  imports: [CommonModule,FormsModule],
  templateUrl: './company-applications-list.component.html',
  styleUrl: './company-applications-list.component.css',
})
export class CompanyApplicationsListComponent implements OnInit {
  applications: IJobApplication[] = [];
loading = false;


page = 1;
limit = 10;
status = 'all';
jobId?: string;


statuses = ['all', 'pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'hired'];


constructor(
private route: ActivatedRoute,
private router: Router,
private snackBar: MatSnackBar,
private applicationService: CompanyApplicationService
) {}


ngOnInit(): void {
this.route.paramMap.subscribe((params) => {
this.jobId = params.get('jobId') || undefined;
this.fetchApplications();
});
}


fetchApplications(): void {
this.loading = true;


const statusFilter = this.status === 'all' ? '' : this.status;


const request$ = this.jobId
? this.applicationService.getApplicationsByJob(this.jobId, this.page, this.limit, statusFilter)
: this.applicationService.getCompanyApplication(this.page, this.limit, '', statusFilter);


request$.subscribe({
next: (res) => {
this.applications = res.data || [];
this.loading = false;
},
error: () => {
this.loading = false;
this.snackBar.open('Failed to load applications', 'Close', { duration: 3000 });
},
});
}


onStatusChange(status: string): void {
this.status = status;
this.fetchApplications();
}


openApplication(applicationId: string): void {
this.router.navigate(['/company/dashboard/applications', applicationId]);
}
}
