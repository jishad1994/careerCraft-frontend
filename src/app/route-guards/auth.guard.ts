import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";
import { AuthService } from "../services/auth/auth.service";
import { AuthStateService } from "../services/authState/auth-state.service";

export const authGuard: CanActivateFn = (_route, state) => {
    const authStateService = inject(AuthStateService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentAuthState = authStateService.authState;

    if (currentAuthState.isLoggedIn && currentAuthState.user) {
        return true;
    }

    return authService.refresh().pipe(
        map(() => true),
        catchError(() =>
            of(
                router.createUrlTree(["/auth/login"], {
                    queryParams: {
                        returnUrl: state.url,
                    },
                }),
            ),
        ),
    );
};