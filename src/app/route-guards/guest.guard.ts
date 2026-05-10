import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";
import { AuthService } from "../services/auth/auth.service";
import { AuthStateService } from "../services/authState/auth-state.service";

type UserRole = "user" | "company" | "admin";

const getDashboardByRole = (role: UserRole): string => {
    const roleRoutes: Record<UserRole, string> = {
        user: "/user/home",
        company: "/company/dashboard",
        admin: "/admin/dashboard",
    };

    return roleRoutes[role];
};

export const guestGuard: CanActivateFn = () => {
    const authStateService = inject(AuthStateService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const redirectIfLoggedIn = (): boolean | ReturnType<typeof router.createUrlTree> => {
        const user = authStateService.authState.user;

        if (!user) {
            return true;
        }

        const role = user.role as UserRole;

        return router.createUrlTree([getDashboardByRole(role)]);
    };

    if (authStateService.authState.isLoggedIn && authStateService.authState.user) {
        return redirectIfLoggedIn();
    }

    return authService.refresh().pipe(
        map(() => redirectIfLoggedIn()),
        catchError(() => of(true)),
    );
};