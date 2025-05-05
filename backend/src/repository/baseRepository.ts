import { DeleteResult, Document, FilterQuery, Model, QueryOptions, UpdateQuery } from "mongoose";
import { IRepository } from "../interfaces/interfaces";

export default abstract class BaseRepository<T extends Document> implements IRepository<T>{

    constructor(protected model:Model<T>){
        this.model=model
    }

    async getAll(query: FilterQuery<T>, options: QueryOptions): Promise<T[] | null> {
        try {
            const { sort, limit, skip } = options
            return await this.model.find(query).sort(sort).limit(limit!).skip(skip!)
        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from user BaseRepository: ', error.message) : console.log('Unknown error from user BaseRepository: ', error)
            return null
        }

    }
    async getOneById(id: string): Promise<T | null> {
        try {
            return await this.model.findById(id)
        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from user BaseRepository: ', error.message) : console.log('Unknown error from user BaseRepository: ', error)
            return null
        }
    }
    async create(userData: Partial<T>): Promise<T | null> {
        try {
            const user = new this.model(userData)
            return await user.save()
        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from user BaseRepository: ', error.message) : console.log('Unknown error from user BaseRepository: ', error)
            return null
        }

    }
   
    async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
        try {
            console.log('entered update in base repository', id);
            
            const updateQuery: UpdateQuery<T> = {}
            if (data.$set) {
                updateQuery.$set = data.$set
            }

            if (data.$push) {
                updateQuery.$push = data.$push
            }

            let updateResult= await this.model.findOneAndUpdate({ _id: id }, updateQuery, { new: true })
            console.log('updateResult from repo:', updateResult);
            
            return updateResult
        } catch (error: unknown) {
            console.log('entered error in base repository');

            console.log('update user db error: ', error);
            error instanceof Error ? console.log('Error message from user BaseRepository: ', error.message) : console.log('Unknown error from user BaseRepository: ', error)
            return null
        }

    }

    async deleteOne(id: string): Promise<DeleteResult | null> {
        try {
            return await this.model.findByIdAndDelete(id)
        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from chat BaseRepository: ', error.message) : console.log('Unknown error from chat BaseRepository: ', error)
            return null
        }
    }

}