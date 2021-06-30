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
      length: '150'
   })
   type!: string

   @Column({
      type: 'varchar',
      length: '150',
      unique: true
   })
   name!: string

   @Column({
      type: 'text',
      nullable: true
   })
   description: string

   @OneToMany(() => CocktailToIngredient, cocktailToIngredient => cocktailToIngredient.ingredient)
   ingredientToCoktails: CocktailToIngredient[]

   @OneToMany(() => MealToIngredient, mealToIngredient => mealToIngredient.ingredient)
   ingredientToMeals: MealToIngredient[]

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
