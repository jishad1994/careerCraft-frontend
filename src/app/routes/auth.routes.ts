import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
    {
        path: "",
        loadComponent: () => import("../pages/login-page/login-page.component").then((m) => m.LoginPageComponent),
    },

    {
        path: "signup",
        loadComponent: () => import("../pages/signup-page/signup-page.component").then((m) => m.SignupPageComponent),
    },
    {
        path: "login",
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
        loadComponent: () =>
            import("../shared/components/forgot-password/forgot-password.component").then((m) => m.ForgotPasswordComponent),
    },
    {
        path: "resetPassword",
        loadComponent: () =>
            import("../shared/components/reset-password/reset-password.component").then((m) => m.ResetPasswordComponent),
    },
    {
        path: "**",
        redirectTo: "login",
    },
];
