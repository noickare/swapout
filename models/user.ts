export interface IUser {
    uid: string;
    email: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
    createdAt: string;
    lastLoginTime: string;
    isEmailVerified: boolean;
}