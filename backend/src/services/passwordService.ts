import bcrypt from 'bcryptjs'
import { IPasswordService } from '../interfaces/interfaces'

export class PasswordService implements IPasswordService{
    async hashPassword(password: string) {
        try {
            const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))
            return hashedPassword
        }  catch (error: unknown) {
            error instanceof Error ? console.log('Error message from hashPassword service: ', error.message) : console.log('Unknown error from hashPassword service: ', error)
            return null
        }
    }

    async verifyPassword(inputPassword: string, userPassword: string) {
        try {
            const isPAsswordMatch = await bcrypt.compare(inputPassword, userPassword)
            console.log('isPAsswordMatch: ',isPAsswordMatch);
            return isPAsswordMatch
        }  catch (error: unknown) {
            error instanceof Error ? console.log('Error message from verifyPassword service: ', error.message) : console.log('Unknown error from verifyPassword service: ', error)
            return null
        }
    }
}