import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { COMPANY_NAME_REGEX, NAME_REGEX, PASSWORD_REGEX, PHONE_REGEX } from "../../../constants/form.constants";
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { FormValidators } from "../../../validators/form.validators";
import { SignupFormHelper } from "../../../helpers/signup-form.helper";
import { SignupServiceHandler } from "../../../services/signup-service.handler";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: "app-signup",
    imports: [ReactiveFormsModule, CommonModule, RouterLink],
    templateUrl: "./signup.component.html",
    styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit, OnDestroy {
    private FB = inject(FormBuilder);
    private formValidator = inject(FormValidators);
    private signupFormHelper = inject(SignupFormHelper);
    private signupServiceHandler = inject(SignupServiceHandler);
    private _snackBar = inject(MatSnackBar);

    registerForm: FormGroup;
    selectedRole: "user" | "company" = "user";
    private destroy$ = new Subject<void>();
    showPassword = false;
    showConfirmPassword = false;
    constructor() {
        this.registerForm = this.FB.group(
            {
                role: ["user", [Validators.required]],
                firstName: [
                    "",
                    [
                        Validators.required,
                        Validators.minLength(2),
                        Validators.maxLength(10),
                        Validators.pattern(NAME_REGEX),
                    ],
                ],
                lastName: [
                    "",
                    [
                        Validators.required,
                        Validators.minLength(2),
                        Validators.maxLength(10),
                        Validators.pattern(NAME_REGEX),
                    ],
                ],
                companyName: [
                    "",
                    [Validators.minLength(2), Validators.maxLength(50), Validators.pattern(COMPANY_NAME_REGEX)],
                ],
                email: [
                    "",
                    [Validators.required, Validators.email],
                    [this.formValidator.phoneOrEmailUniqueValidator(this.selectedRole)],
                ],
                phone: [
                    "",
                    [Validators.required, Validators.pattern(PHONE_REGEX)],
                    [this.formValidator.phoneOrEmailUniqueValidator(this.selectedRole)],
                ],
                password: ["", [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_REGEX)]],
                confirmPassword: ["", [Validators.required]],
            },
            { validators: FormValidators.passwordMatchValidator },
        );
    }

    ngOnInit(): void {
        this.setupRoleChangeListener();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupRoleChangeListener(): void {
        this.registerForm
            .get("role")
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((role: "user" | "company") => {
                this.selectedRole = role;
                this.signupFormHelper.updateValidatorsForRole(this.registerForm, role);
            });
    }

    signup() {
        if (this.registerForm.invalid) {
            this.signupFormHelper.markAllFieldsAsTouched(this.registerForm);
            return;
        }

        const formData = this.signupFormHelper.prepareFormDataForSubmission(this.registerForm.value);

        this.signupServiceHandler
            .handleSignup(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.signupServiceHandler.handleOTPResponse(
                        response,
                        this.registerForm.get("email")?.value,
                        this.selectedRole,
                    );
                },
                error: (error) => {
                    if (error.status == 422) {
                        this._snackBar.open(`${error.error?.errors[0]?.field} is not valid`, "close", { duration: 2000 });
                    } else {
                        this._snackBar.open("Something went wrong.Please try again", "close", { duration: 2000 });
                    }
                },
            });
    }

    get selectedSignupRole(): "user" | "company" {
        return this.registerForm.get("role")?.value as "user" | "company";
    }

    get isCompanyMode() {
        return this.selectedRole === "company";
    }

    get isUserMode() {
        return this.selectedRole === "user";
    }
}
