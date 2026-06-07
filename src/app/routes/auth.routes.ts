import { Routes } from "@angular/router";
import { guestGuard } from "../route-guards/guest.guard";

export const AUTH_ROUTES: Routes = [
    {
        path: "",
        canActivate: [guestGuard],
        loadComponent: () => import("../pages/login-page/login-page.component").then((m) => m.LoginPageComponent),
    },

    {
        path: "signup",
        canActivate: [guestGuard],
        loadComponent: () => import("../pages/signup-page/signup-page.component").then((m) => m.SignupPageComponent),
    },
    {
        path: "login",
        canActivate: [guestGuard],
        loadComponent: () => import("../pages/login-page/login-page.component").then((m) => m.LoginPageComponent),
    },
    {
        path: "OTP-verification",
        loadComponent: () =>
            import("../pages/otp-verification-page/otp-verification-page.component").then(
                (m) => m.OtpVerificationPageComponent,
            ),
    },
    {
        path: "forgotPassword",
        canActivate: [guestGuard],
        loadComponent: () =>
            import("../shared/components/forgot-password/forgot-password.component").then((m) => m.ForgotPasswordComponent),
    },
    {
        path: "resetPassword",
        canActivate: [guestGuard],
        loadComponent: () =>
            import("../shared/components/reset-password/reset-password.component").then((m) => m.ResetPasswordComponent),
    },
    {
        path: "**",
        redirectTo: "login",
    },
];
