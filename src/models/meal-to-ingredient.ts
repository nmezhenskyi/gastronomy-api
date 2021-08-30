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

   @ManyToOne(() => Meal, meal => meal.ingredients, { onDelete: 'CASCADE' })
   meal!: Meal

   @ManyToOne(() => Ingredient, ingredient => ingredient.meals, { onDelete: 'SET NULL' })
   ingredient!: Ingredient

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
