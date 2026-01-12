import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Skill } from '../../../../models/skill.model';
import { Subject, takeUntil } from 'rxjs';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SkillService } from '../../../../services/skill/skill.service';
import { UserProfile } from '../../../../models/user/user-profile.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skills-section',
  imports: [CommonModule,FormsModule],
  templateUrl: './skills-section.component.html',
  styleUrl: './skills-section.component.css',
})
export class SkillsSectionComponent implements OnDestroy {
  skillsSearchQuery = '';
  searchResults: Skill[] = [];
  loading = false;
  searchingSkills: boolean = false;
  destroy$ = new Subject<void>();

  @Input() profile: UserProfile | null = null;
  @Output() updatedUser = new EventEmitter<UserProfile>();

  constructor(
    private _userProfileService: UserProfileService,
    private _skillService: SkillService,
    private _snackBar: MatSnackBar
  ) {}

  searchSkills(query: string) {
    if (!query || query.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchingSkills = true;
    let page = 1;
    let limit = 10;

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

    console.log("skill id is :",skillId)
    this._userProfileService
      .addUserSkill(skillId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatedUser.emit(response.data as UserProfile);
          this.skillsSearchQuery = '';
          this.searchResults = [];
          this._snackBar.open('Skill added', 'close', { duration: 2000 });
        },
        error: (err) => {
          this._snackBar.open(
            err.error?.message || 'Failed to add skill',
            'close',
            { duration: 3000 }
          );
        },
      });
  }

  removeSkill(skillId: string): void {

    console.log("skill id is:",skillId);
    
    this._userProfileService
      .removeUserSkill(skillId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatedUser.emit(response.data as UserProfile);
          this._snackBar.open('Skill removed', 'close', { duration: 2000 });
        },
        error: () => {
          this._snackBar.open('Failed to remove skill', 'close', {
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
