import { Routes } from "@angular/router";

export const publicRoutes: Routes = [
    {
        path: "",
        loadComponent: () =>
            import("../layouts/public/public-layout/public-layout.component").then((m) => m.PublicLayoutComponent),

        children: [
            {
                path: "",
                redirectTo: "home",
                pathMatch: "full",
            },
            {
                path: "home",
                loadComponent: () =>
                    import("../pages/common-landing-page/common-landing-page.component").then(
                        (m) => m.CommonLandingPageComponent,
                    ),
            },
        ],
    },
];
