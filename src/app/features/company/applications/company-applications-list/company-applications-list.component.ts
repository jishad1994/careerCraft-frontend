import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FilterOption,
  ICandidateListItem,
  JOB_APPLICATION_STATUS,
} from '../../../../models/job-application/job-application.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyApplicationService } from '../../../../services/company/applications/company-application.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { PaginationMeta } from '../../../../models/api-response.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SkillService } from '../../../../services/skill/skill.service';
import { ResumeService } from '../../../../shared/services/resume-service/resume.service';
import { PdfViewerComponent } from '../../../../shared/components/pdf-viewer/pdf-viewer.component';

interface CandidateFilters {
  status: string[];
  skills: string[];
  experience: string[];
  education: string[];
  availability: string[];
  dateRange: string;
  startDate?: string;
  endDate?: string;
  jobId?: string;
}

interface Skill {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-company-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './company-applications-list.component.html',
  styleUrl: './company-applications-list.component.css',
})
export class CompanyApplicationsListComponent implements OnInit, OnDestroy {
  candidates: ICandidateListItem[] = [];
  allSkills: Skill[] = [];
  filteredSkills: Skill[] = [];
  loading = false;
  loadingSkills = false;
  pagination: PaginationMeta | null = null;
  searchQuery = '';
  skillSearchQuery = '';
  showFilters = false;
  jobId?: string;

  private readonly destroy$ = new Subject<void>();
  private readonly skillSearch$ = new Subject<string>();

  statusOptions: FilterOption[] = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'reviewing', label: 'Reviewing', color: 'blue' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'green' },
    { value: 'interviewed', label: 'Interviewed', color: 'purple' },
    { value: 'offered', label: 'Offered', color: 'teal' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'gray' },
    { value: 'hired', label: 'Hired', color: 'green' },
  ];

  experienceOptions: FilterOption[] = [
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5+', label: '5+ years' },
  ];

  educationOptions: FilterOption[] = [
    { value: 'Degree', label: 'Degree' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'High School', label: 'High School' },
    { value: 'PhD', label: 'PhD' },
    { value: 'Certification', label: 'Certification' },
  ];

  availabilityOptions: FilterOption[] = [
    { value: 'immediate', label: 'Immediate' },
    { value: '15days', label: '15 days' },
    { value: '30days', label: '30 days' },
    { value: '60+', label: '60+ days' },
  ];

  dateRangeOptions: FilterOption[] = [
    { value: 'today', label: 'Today' },
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  filters: CandidateFilters = {
    status: [],
    skills: [],
    experience: [],
    education: [],
    availability: [],
    dateRange: '',
    startDate: undefined,
    endDate: undefined,
    jobId: undefined,
  };

  constructor(
    private readonly candidatesService: CompanyApplicationService,
    private readonly skillsService: SkillService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly resumeService: ResumeService,
  ) {}

  ngOnInit(): void {
    this.skillSearch$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.skillSearchQuery = query;
        this.loadSkills();
      });
    this.loadSkills();
    this.setupSkillSearch();
    console.log('initally loaded');
    this.loadCandidates();

    this.route.queryParamMap.subscribe((param) => {
      this.jobId = param.get('jobId') || undefined;
      if (this.jobId) {
        this.filters.jobId = this.jobId;
        this.loadCandidates();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSkillSearch(): void {
    this.skillSearch$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.filterSkills(query);
      });
  }

  loadSkills(): void {
    this.loadingSkills = true;
    this.skillsService
      .getSkillsPaginated(1, 100, this.skillSearchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.allSkills = response.data;
            this.filteredSkills = [...this.allSkills];
          }
          this.loadingSkills = false;
        },
        error: () => {
          this.loadingSkills = false;
          this.snackBar.open('Failed to load skills', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onSkillSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.skillSearch$.next(input.value);
  }

  filterSkills(query: string): void {
    if (!query) {
      this.filteredSkills = [...this.allSkills];
      return;
    }

    const lowerQuery = query.toLowerCase();
    this.filteredSkills = this.allSkills.filter((skill) =>
      skill.name.toLowerCase().includes(lowerQuery),
    );
  }

  loadCandidates(page: number = 1): void {
    this.loading = true;

    this.candidatesService
      .getApplicants(page, 10, this.searchQuery, this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.candidates = response.data || [];
            this.pagination = response.pagination || null;
          }
          this.loading = false;
        },
        error: (error: { error?: { message?: string } }) => {
          this.snackBar.open(
            error.error?.message || 'Failed to load candidates',
            'Close',
            { duration: 3000 },
          );
          this.loading = false;
        },
      });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.loadCandidates(1);
  }

  onPageChange(page: number): void {
    this.loadCandidates(page);
  }

  viewProfile(candidate: ICandidateListItem): void {
    this.router.navigate(['/company/applications', candidate._id]);
  }

  viewResume(candidate: ICandidateListItem): void {
    this.resumeService
      .getUserResumeByApplicationId(candidate._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.dialog.open(PdfViewerComponent, {
        
            width: '90vw',
            height: '90vh',
            maxWidth: '95vw',
            panelClass: 'resume-dialog',
            data: {
              blob,
              fileName: `resume-${candidate._id}.pdf`,
              candidateName: candidate.candidateName,
            },
          });
        },
        error: () => {
          this.snackBar.open('Failed to load resume', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  changeStatus(candidate: ICandidateListItem, status: string): void {
    this.candidatesService
      .updateApplicationStatus(candidate._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            candidate.status = status as typeof candidate.status;
            this.snackBar.open('Status updated successfully', 'Close', {
              duration: 2000,
            });
          }
        },
        error: (error: { error?: { message?: string } }) => {
          this.snackBar.open(
            error.error?.message || 'Failed to update status',
            'Close',
            { duration: 3000 },
          );
        },
      });
  }

  addNote(candidate: ICandidateListItem): void {
    const note = prompt('Add a note for this candidate:');
    if (!note) return;

    this.candidatesService
      .addNotes(candidate._id, note)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Note added successfully', 'Close', {
              duration: 2000,
            });
          }
        },
        error: (error: { error?: { message?: string } }) => {
          this.snackBar.open(
            error.error?.message || 'Failed to add note',
            'Close',
            { duration: 3000 },
          );
        },
      });
  }

  toggleFlag(candidate: ICandidateListItem): void {
    const newFlagState = !candidate.isStarred;

    this.candidatesService
      .toggleFlag(candidate._id, newFlagState)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            candidate.isStarred = newFlagState;
            this.snackBar.open(
              `Candidate ${newFlagState ? 'flagged' : 'unflagged'}`,
              'Close',
              { duration: 2000 },
            );
          }
        },
        error: (error: { error?: { message?: string } }) => {
          this.snackBar.open(
            error.error?.message || 'Failed to update flag',
            'Close',
            { duration: 3000 },
          );
        },
      });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  isFilterSelected(filterArray: string[], value: string): boolean {
    return filterArray.includes(value);
  }

  toggleFilter(filterArray: string[], value: string): void {
    const index = filterArray.indexOf(value);
    if (index > -1) {
      filterArray.splice(index, 1);
    } else {
      filterArray.push(value);
    }
  }

  applyFilters(): void {
    this.loadCandidates(1);
  }

  clearFilters(): void {
    this.filters = {
      status: [],
      skills: [],
      experience: [],
      education: [],
      availability: [],
      dateRange: '',
      startDate: undefined,
      endDate: undefined,
      jobId: this.jobId,
    };
    this.skillSearchQuery = '';
    this.filteredSkills = [...this.allSkills];
    this.loadCandidates(1);
  }

  getActiveFiltersCount(): number {
    return (
      this.filters.status.length +
      this.filters.skills.length +
      this.filters.experience.length +
      this.filters.education.length +
      this.filters.availability.length +
      (this.filters.dateRange ? 1 : 0)
    );
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      interviewed: 'bg-purple-100 text-purple-800',
      offered: 'bg-teal-100 text-teal-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
      hired: 'bg-green-100 text-green-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getPageNumbers(): number[] {
    if (!this.pagination) return [];

    const pages: number[] = [];
    const total = this.pagination.totalPages;
    const current = this.pagination.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, -1, total);
      } else if (current >= total - 2) {
        pages.push(1, -1, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, -1, current - 1, current, current + 1, -1, total);
      }
    }

    return pages;
  }

  toPaginationResults(page: number, limit: number, totalItems: number): number {
    return Math.min(page * limit, totalItems);
  }
}
