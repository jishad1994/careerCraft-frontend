import { Component, OnInit, inject } from "@angular/core";
import { Skill } from "../../../../models/skill.model";
import { SkillService } from "../../../../services/skill/skill.service";
import { ActivatedRoute, Router } from "@angular/router";
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
    selector: "app-skill-management",
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: "./skill-management.component.html",
    styleUrl: "./skill-management.component.css",
})
export class SkillManagementComponent implements OnInit {
    private _skillService = inject(SkillService);
    private _router = inject(Router);
    private _route = inject(ActivatedRoute);
    private _snackBar = inject(MatSnackBar);
    private fb = inject(FormBuilder);

    skills: Skill[] = [];
    search = "";
    page!: number;
    limit = 10;
    total = 0;

    hasMore = "";
    skillForm!: FormGroup;
    searchSubject$ = new Subject<string>();
    destroy$ = new Subject<void>();
    ngOnInit(): void {
        this.skillForm = this.fb.group({
            name: ["", [Validators.required]],
            description: [""],
        });

        this._route.queryParams.subscribe((params) => {
            this.page = params["page"] ? +params["page"] : 1;
            this.search = params["search"] ? params["search"] : "";
            this.loadSkills();
        });

        this.searchSubject$
            .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((searchQuery) => {
                this.page = 1;
                this.search = searchQuery;
                this.loadSkills();
            });
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

                error: () => {
                  
                    this._snackBar.open("Skill loading failed", "close", {
                        duration: 2000,
                    });
                },
            });
    }

    onInputChange() {
        this.searchSubject$.next(this.search);
    }

    goToSkill(id: string) {
        this._router.navigate(["/admin/dashboard/skills-management", id], {
            queryParams: { page: this.page, search: this.search },
        });
    }

    changePage(newPage: number) {
        this.page = newPage;
        this.loadSkills();
    }

    createSkill() {
        if (this.skillForm.invalid) {
            return;
        }

        this._skillService
            .createSkill(this.skillForm.value)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this._snackBar.open("Skill created successfully", "close", {
                        duration: 2000,
                    });
                    this.skillForm.reset();
                    this.loadSkills();
                },
                error: (error) => {
                    if (error.status === 409) {
                        this._snackBar.open("Skill already exists", "close", {
                            duration: 2000,
                        });
                    } else {
                        this._snackBar.open("Failed to create skill", "close", {
                            duration: 2000,
                        });
                    }
                },
            });
    }

    deleteSkill(id: string) {
        const confirmDelete = confirm("Are you sure you want to delete this skill?");
        if (!confirmDelete) return;

        this._skillService
            .deleteSkill(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this._snackBar.open("Skill deleted", "close", { duration: 2000 });
                this.loadSkills();
            });
    }
}
