import { Routes } from "@angular/router";

export const COMPANY_ROUTES: Routes = [
    { path: "", redirectTo: "dashboard", pathMatch: "full" },

    {
        path: "dashboard",
        loadComponent: () =>
            import("../../layouts/company/company-layout/company-layout.component")
                .then((m) => m.CompanyLayoutComponent),

        children: [
            {
                path: "",
                loadComponent: () =>
                    import("../../pages/company/company-landing-page/company-landing-page.component")
                        .then((m) => m.CompanyLandingPageComponent),
            },

            {
                path: "notifications",
                loadComponent: () =>
                    import("../../shared/components/notification-component/notifications.component")
                        .then((m) => m.NotificationsComponent),
            },

            {
                path: "profile",
                loadComponent: () =>
                    import("../../features/company/profile/company-profile-parent/company-profile.component")
                        .then((m) => m.CompanyProfileComponent),
            },

         
            {
                path: "addons",
                loadComponent: () =>
                    import("../../features/company/subscription-management/addons-list/addons-list.component")
                        .then((m) => m.AddonsListComponent),
            },
            {
                path: "addons/:id",
                loadComponent: () =>
                    import("../../features/company/subscription-management/addons-purchase/addons-purchase.component")
                        .then((m) => m.AddonsPurchaseComponent),
            },

            
            {
                path: "candidates/:userId",
                loadComponent: () =>
                    import("../../shared/components/candidate-profile/candidate-profile.component")
                        .then((m) => m.CandidateProfileComponent),
            },

           
            {
                path: "jobs",
                loadChildren: () =>
                    import("./company.jobs.routes").then((m) => m.companyJobRoutes),
            },
            {
                path: "applications",
                loadChildren: () =>
                    import("./company.application.routes").then((m) => m.companyApplicationRoutes),
            },
            {
                path: "interviews",
                loadChildren: () =>
                    import("./company.interview.routes").then((m) => m.companyInterviewRoutes),
            },
            {
                path: "subscriptions",
                loadChildren: () =>
                    import("../../routes/company/company.subscription.routes")
                        .then((m) => m.companySubscriptionRoutes),
            },

            
            {
                path: "messages",
                loadComponent: () =>
                    import("../../shared/components/chat/chat-page/chat-page.component")
                        .then((m) => m.ChatPageComponent),
            },

          
            {
                path: "offers",
                loadComponent: () =>
                    import("../../features/company/company-offer-list/company-offer-list.component")
                        .then((m) => m.CompanyOfferListComponent),
            },
            {
                path: "offers/create", 
                loadComponent: () =>
                    import("../../features/company/create-offer/create-offer.component")
                        .then((m) => m.CreateOfferComponent),
            },
            {
                path: "offers/:id", 
                loadComponent: () =>
                    import("../../features/company/company-offer-detail/company-offer-detail.component")
                        .then((m) => m.CompanyOfferDetailComponent),
            },
        ],
    },
];