import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   OneToMany
} from 'typeorm'
import { CocktailToIngredient } from './CocktailToIngredient'
import { MealToIngredient } from './MealToIngredient'

@Entity()
export class Ingredient {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({
      type: 'varchar',
      length: 100
   })
   category!: string

   @Column({
      type: 'varchar',
      length: 255,
      unique: true
   })
   name!: string

   @Column({
      type: 'text',
      nullable: true
   })
   description: string | null

   @OneToMany(() => CocktailToIngredient, cocktailToIngredient => cocktailToIngredient.ingredient)
   cocktails: CocktailToIngredient[]

   @OneToMany(() => MealToIngredient, mealToIngredient => mealToIngredient.ingredient)
   ingredientToMeals: MealToIngredient[]

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
