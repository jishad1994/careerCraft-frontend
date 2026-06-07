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

            {
                path: "jobs",
                loadComponent: () =>
                    import("../features/user/jobs/job-search/user-job-search.component").then(
                        (m) => m.UserJobSearchComponent,
                    ),
                data: {
                    public: true,
                },
            },
            {
                path: "jobs/:slug",
                loadComponent: () =>
                    import("../pages/public-job-view/public-job-view.component").then((m) => m.PublicJobViewComponent),
            },

            // {
            //     path: "jobs/:id",
            //     loadComponent: () =>
            //         import("../pages/public-job-view/public-job-view.component").then((m) => m.PublicJobViewComponent),
            // },
        ],
    },
];
