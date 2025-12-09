import { Component, OnInit } from '@angular/core';
import { Skill } from '../../../../models/skill.model';
import { SkillService } from '../../../../services/skill/skill.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-skill-management',
  imports: [CommonModule,FormsModule],
  templateUrl: './skill-management.component.html',
  styleUrl: './skill-management.component.css',
})
export class SkillManagementComponent implements OnInit {
  skills: Skill[] = [];
  search: string = '';
  page = 1;
  limit = 10;
  total = 0;

  destroy$ = new Subject<void>();

  constructor(
    private _skillService: SkillService,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills() {
    this._skillService
      .getSkillsPaginated(this.page, this.limit, this.search)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.skills = res.data || [];
          this.total = res.pagination?.totalItems ?? 0;
        },

        error: (err) => {
          console.log(err.message);
          this._snackBar.open('Skill loading failed', 'close', {
            duration: 2000,
          });
        },
      });
  }

  onSearch() {
    this.page = 1;
    this.loadSkills();
  }

  goToSkill(id: string) {
    this._router.navigate(['/admin/dashboard/skills-management', id]);
  }

  changePage(newPage: number) {
    this.page = newPage;
    this.loadSkills();
  }
}
