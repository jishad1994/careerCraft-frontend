import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UserProfile } from '../../../../models/user/user-profile.model';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-basic-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './basic-profile.component.html',
  styleUrl: './basic-profile.component.css',
})
export class BasicProfileComponent implements OnInit, OnChanges, OnDestroy {
  @Input() profile: UserProfile | null = null;
  @Output() updatedBasicInfo = new EventEmitter<UserProfile>();

  loading = false;
  editBasicInfo = false;
  destroy$ = new Subject<void>();
  basicInfoForm!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _userProfileService: UserProfileService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.basicInfoForm = this._fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      about: [''],
      location: [''],
      address: [''],
    });
  }

  patchBasicInfo(): void {
    if (!this.profile) return;
    this.basicInfoForm.patchValue({
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      phone: this.profile.phone,
      about: this.profile.about,
      location: this.profile.location,
      address: this.profile.address,
    });
  }

  toggleEditBasicInfo(): void {
    this.editBasicInfo = !this.editBasicInfo;
    if (this.editBasicInfo) {
      this.patchBasicInfo();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.basicInfoForm && this.profile) {
      this.patchBasicInfo();
    }
  }

  onSave() {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this._userProfileService
      .updateProfile(this.basicInfoForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.updatedBasicInfo.emit(res.data as UserProfile);
          this.editBasicInfo = false;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open(err.error.message, 'close', { duration: 3000 });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
