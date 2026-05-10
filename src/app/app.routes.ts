import { Routes } from "@angular/router";
import { authGuard } from "./route-guards/auth.guard";
import { roleGuard } from "./route-guards/role.guard";

export const routes: Routes = [
    {
        path: "",

        loadChildren: () => import("../app/routes/public.routes").then((m) => m.publicRoutes),
    },

    {
        path: "auth",

        loadChildren: () => import("./routes/auth.routes").then((m) => m.AUTH_ROUTES),
    },
    {
        path: "user",
        canActivate: [authGuard, roleGuard],
        data: {
            roles: ["user"],
        },
        loadChildren: () => import("./routes/user/parent.routes").then((m) => m.USER_ROUTES),
    },
    {
        path: "company",
        canActivate: [authGuard, roleGuard],
        data: {
            roles: ["company"],
        },
        loadChildren: () => import("./routes/company/parent.routes").then((m) => m.COMPANY_ROUTES),
    },
    {
        path: "admin",
        canActivate: [authGuard, roleGuard],
        data: {
            roles: ["admin"],
        },
        loadChildren: () => import("./routes/admin.routes").then((m) => m.ADMIN_ROUTES),
    },

    {
        path: "blocked",
        loadComponent: () =>
            import("../app/shared/components/account-restricted/account-restricted.component").then(
                (m) => m.AccountRestrictedComponent,
            ),
    },
    {
        path: "unauthorized",
        loadComponent: () =>
            import("./shared/components/route-pages/unauthorized/unauthorized.component").then(
                (m) => m.UnauthorizedComponent,
            ),
    },
    {
        path: "server-error",
        loadComponent: () =>
            import("./shared/components/route-pages/server-error/server-error.component").then(
                (m) => m.ServerErrorComponent,
            ),
    },
    {
        path: "**",
        loadComponent: () =>
            import("./shared/components/route-pages/not-found/not-found.component").then((m) => m.NotFoundComponent),
    },
];
