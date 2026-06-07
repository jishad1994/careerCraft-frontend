import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { Skill } from '../../../../models/skill.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SkillService } from '../../../../services/skill/skill.service';
import { UserProfile } from '../../../../models/user/user-profile.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skills-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './skills-section.component.html',
  styleUrl: './skills-section.component.css',
})
export class SkillsSectionComponent implements OnDestroy {
  private _userProfileService = inject(UserProfileService);
  private _skillService = inject(SkillService);
  private _snackBar = inject(MatSnackBar);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  skillsSearchQuery = '';
  searchResults: Skill[] = [];
  loading = false;
  searchingSkills = false;
  
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  @Input() profile: UserProfile | null = null;
  @Output() updatedUser = new EventEmitter<UserProfile>();

  constructor() {
   
    this.searchSubject$
      .pipe(
        debounceTime(300), 
        distinctUntilChanged(), 
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.performSearch(query);
      });
  }

 
  onSearchChange(query: string): void {
    this.searchSubject$.next(query);
  }

 
  focusSearchInput(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }


  private performSearch(query: string): void {
    if (!query || query.length < 2) {
      this.searchResults = [];
      this.searchingSkills = false;
      return;
    }

    this.searchingSkills = true;
    const page = 1;
    const limit = 10;

    this._skillService
      .getSkillsPaginated(page, limit, query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.searchResults = response.data as Skill[];
          this.searchingSkills = false;
        },
        error: () => {
          this.searchingSkills = false;
          this.searchResults = [];
        },
      });
  }

  addSkill(skillId: string): void {
    
    this._userProfileService
      .addUserSkill(skillId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatedUser.emit(response.data as UserProfile);
          this.skillsSearchQuery = '';
          this.searchResults = [];
          this._snackBar.open('Skill added', 'Close', { duration: 2000 });
        },
        error: (err) => {
          this._snackBar.open(
            err.error?.message || 'Failed to add skill',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  removeSkill(skillId: string): void {

    this._userProfileService
      .removeUserSkill(skillId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatedUser.emit(response.data as UserProfile);
          this._snackBar.open('Skill removed', 'Close', { duration: 2000 });
        },
        error: () => {
          this._snackBar.open('Failed to remove skill', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}