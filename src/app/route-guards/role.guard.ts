import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";
import { AuthService } from "../services/auth/auth.service";
import { AuthStateService } from "../services/authState/auth-state.service";

type UserRole = "user" | "company" | "admin";

interface RouteDataWithRoles {
    roles?: UserRole[];
}

const _getDashboardByRole = (role: UserRole): string => {
    const roleRoutes: Record<UserRole, string> = {
        user: "/user/home",
        company: "/company/dashboard",
        admin: "/admin/dashboard",
    };

    return roleRoutes[role];
};

export const roleGuard: CanActivateFn = (route, state) => {
    const authStateService = inject(AuthStateService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const routeData = route.data as RouteDataWithRoles;
    const allowedRoles = routeData.roles ?? [];

    const checkRole = (): boolean | ReturnType<typeof router.createUrlTree> => {
        const user = authStateService.authState.user;

        if (!user) {
            return router.createUrlTree(["/auth/login"], {
                queryParams: {
                    returnUrl: state.url,
                },
            });
        }

        const userRole = user.role as UserRole;

        if (allowedRoles.includes(userRole)) {
            return true;
        }

        return router.createUrlTree(["/unauthorized"]);
    };

    if (authStateService.authState.isLoggedIn && authStateService.authState.user) {
        return checkRole();
    }

    return authService.refresh().pipe(
        map(() => checkRole()),
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