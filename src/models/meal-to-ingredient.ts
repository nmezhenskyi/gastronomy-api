import {
   Entity,
   Column,
   PrimaryColumn,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToOne
} from 'typeorm'
import { Meal } from './meal'
import { Ingredient } from './ingredient'

@Entity()
export class MealToIngredient {
   @PrimaryColumn()
   mealId!: string

   @PrimaryColumn()
   ingredientId!: string

   @Column()
   amount!: string

   @ManyToOne(() => Meal, meal => meal.mealToIngredients, { onDelete: 'CASCADE' })
   meal!: Meal

   @ManyToOne(() => Ingredient, ingredient => ingredient.ingredientToMeals, { onDelete: 'SET NULL' })
   ingredient!: Ingredient

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
