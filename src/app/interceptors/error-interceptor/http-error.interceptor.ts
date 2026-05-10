import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiResponse } from "../../models/api-response.model";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../../services/auth/auth.service";

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            const normalizedError: ApiResponse<null> = {
                success: false,
                message: err.error?.message || "Something went wrong",
                data: null,
                pagination: undefined,
                errors: err.error?.errors || null,
                statusCode: err.status,
            };

            switch (err.status) {
                case 0:
                    snackBar.open("Cannot connect to server. Check your internet.", "Close", { duration: 3000 });
                    break;

                case 401:
                    // If refresh token request fails → logout
                    if (!req.url.includes("/refresh")) {
                        return throwError(() => err);
                    }

                    break;

                case 403:
                    snackBar.open(normalizedError.message || "Access denied", "Close", {
                        duration: 3000,
                    });

                    authService.logout();
                    router.navigate(["/blocked"]);

                    break;

                case 500:
                    // snackBar.open('Internal server error', 'Close', { duration: 3000 });

                    break;
            }

            return throwError(() => normalizedError);
        }),
    );
};
