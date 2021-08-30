import { getRepository, Like } from 'typeorm'
import { Meal } from '../models/meal'
import { ServiceResponse } from './service-response'

export const MealService = {
   /**
    * Finds meals in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @param offset Search offset
    * @param limit Search limit
    * @returns ServiceResponse object with found meals
    */
   async find(searchBy?: {
      name?: string,
      cuisine?: string
   }, offset = 0, limit = 1): Promise<ServiceResponse<Meal[]>> {
      try {
         const repository = getRepository(Meal)

         let searchName = searchBy !== undefined && searchBy.name !== undefined

         const found = await repository.find({
            select: ['id', 'name', 'cuisine', 'description'],
            where: searchName ? { ...searchBy, name: Like(`%${searchBy!.name}%`) } : searchBy,
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
         })

         if (!found || found.length === 0) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: found
         }
      }
      catch  (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds one meal in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with found meal
    */
   async findOne(searchBy: { id: string, name?: string } | { id?: string, name: string }): Promise<ServiceResponse<Meal>> {
      try {
         const repository = getRepository(Meal)

         const found = await repository.createQueryBuilder('m')
            .select([
               'm.id', 'm.name', 'm.description', 'm.cuisine',
               'm.notesOnIngredients', 'm.notesOnExecution', 'm.notesOnTaste'
            ])
            .addSelect(['cti.amount'])
            .addSelect(['i.id', 'i.name', 'i.category', 'i.description'])
            .where(`${
               (searchBy.id && searchBy.name) ? 'm.id = :id AND m.name = :name' :
               (searchBy.id ? 'm.id = :id' : (searchBy.name ? 'm.name = :name' : ''))
            }`, { id: searchBy.id, name: searchBy.name })
            .innerJoin('m.ingredients', 'mti')
            .innerJoin('mti.ingredient', 'i')
            .getOne()

         if (!found) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: found
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   
}
