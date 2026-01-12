import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SkillService } from '../../../../services/skill/skill.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Skill } from '../../../../models/skill.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skill-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-details.component.html',
  styleUrl: './skill-details.component.css',
})
export class SkillDetailsComponent implements OnInit {
  skill: Skill | null = null;
  id!: string;
  page: number = 1;
  search: string = '';
  destroy$ = new Subject<void>();
  constructor(
    private _skillService: SkillService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.id = this._route.snapshot.params['id'];
    this._route.queryParams.subscribe((params) => {
      this.page = params['page'] ? +params['page'] : 1;
      this.search = params['search'] ? params['search'] : '';
    });
    this.loadSkill();
  }

  loadSkill() {
    this._skillService
      .getSkill(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.skill = res.data || null;
        },

        error: (err) => {
          console.log(err.message);
          this._snackBar.open('Skill loading failed', 'close', {
            duration: 2000,
          });
        },
      });
  }

  saveChanges() {
    if (this.skill) {
      this._skillService
        .updateSkill(this.id, this.skill)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this._snackBar.open('Skill updated', 'close', { duration: 2000 });
            this._router.navigate(['/admin/dashboard/skills-management'], {
              queryParams: { page: this.page, search: this.search },
            });
          },
          error: (err) => {
            console.log(err.message);
            this._snackBar.open('Skill loading failed', 'close', {
              duration: 2000,
            });
          },
        });
    }
  }

  toggleBlock() {
    this._skillService
      .toggleBlock(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.skill = res.data;

          this._snackBar.open(
            `skill successfullu ${res.data?.blocked ? 'blocked' : 'unblocked'}`,
            'close',
            { duration: 2000 }
          );
        },
        error: (err) => {
          console.log(err.message);
          this._snackBar.open('Failed to toggle skill', 'close', {
            duration: 2000,
          });
        },
      });
  }

  deleteSkill() {
    this._skillService
      .deleteSkill(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this._snackBar.open('Skill deleted successfully', 'close', {
            duration: 2000,
          });
          this._router.navigate(['/admin/dashboard/skills-management'], {
            queryParams: { page: this.page },
          });
        },
        error: (err) => {
          console.log(err.message);
          this._snackBar.open('Failed to delete skill', 'close', {
            duration: 2000,
          });
        },
      });
  }

  goBack(): void {
    this._router.navigate(['/admin/dashboard/skills-management'], {
      queryParams: { page: this.page, search: this.search },
    });
  }
}
