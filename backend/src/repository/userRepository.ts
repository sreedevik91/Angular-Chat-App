import { IUser, IUserRepository } from "../interfaces/interfaces";
import User from "../model/userModel";
import BaseRepository from "./baseRepository";

export default class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(User)
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        try {
            const user = await this.model.findOne({ username })
            return user
        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from user BaseRepository: ', error.message) : console.log('Unknown error from user BaseRepository: ', error)
            return null
        }
    }
    
    
    async getUserByEmail(email: string): Promise<IUser | null> {
        try {
            const user = await this.model.findOne({ email })
            return user
        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from user BaseRepository: ', error.message) : console.log('Unknown error from user BaseRepository: ', error)
            return null
        }
    }
}
