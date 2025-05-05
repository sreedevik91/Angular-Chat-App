import { model, Schema, CallbackError } from "mongoose";
import { IUser } from "../interfaces/interfaces";
import bcrypt from "bcryptjs";

const UserSchema: Schema<IUser> = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    img: {
        type: String
    },
    lastSeen: {
        type: Date,
        default: new Date()
    },
},
    {
        timestamps: true
    }

)

UserSchema.pre<IUser>('save', async function (next) {

    const user = this
    // isModified will check if that particular field is modified or updated or added new
    if (user.password && user.isModified('password')) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, await bcrypt.genSalt(10))
            this.password = hashedPassword
        } catch (error) {
            next(error as CallbackError)
        }
    }

    next()

})

const User = model<IUser>('user', UserSchema)

export default User