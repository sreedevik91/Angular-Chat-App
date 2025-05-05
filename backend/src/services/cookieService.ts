import { CookieOptions, Request } from "express";
import { ICookieService, IJwtPayload, IUser } from "../interfaces/interfaces";

export class CookieService implements ICookieService {

    async getCookieOptions(req: Request, user: IUser, accessToken: string, refreshToken: string) {
        
        const payload: IJwtPayload = {
            id: user._id as string,
            email: user.email,
            name: user.name,
            img: user.img || ''
        }

        const options: CookieOptions = {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production', // secure will become true when the app is running in production
            // secure: req.protocol === 'https',
            secure: process.env.NODE_ENV === 'production' ? req.protocol === 'https' : false,
            sameSite: 'lax', // Required for cross-origin cookies
            // domain: process.env.NODE_ENV === 'production' ? '.dreamevents.shop' : 'localhost', // 👈 Match your frontend domain,// Use '.dreamevents.shop' for subdomains
            ...(process.env.NODE_ENV === 'production' && { domain: 'dreamevents.shop' }) // only set in prod


            // httpOnly: true,
            // secure: true,
            // sameSite: 'none', // Change from 'Lax' to 'none' for cross-origin
            // domain: '.dreamevents.shop', // Ensure subdomain support
            // path: '/',
        }
        return { payload, accessToken, refreshToken, options }

    }
}