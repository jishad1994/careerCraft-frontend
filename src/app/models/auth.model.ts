import { AuthResponseUserDTO } from "./auth.dto";
import { IPublicFileAsset } from "./user/user-profile.model";

export interface AuthUser {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: "user" | "company" | "admin";
    profilePicture?: IPublicFileAsset;
}

export interface AuthState {
    isLoggedIn: boolean;
    user: AuthResponseUserDTO | null;
    loading: boolean;
    error: string | null;
}
