import {
   Entity,
   Column,
   PrimaryColumn,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToOne
} from 'typeorm'
import { Cocktail } from './Cocktail'
import { Ingredient } from './Ingredient'

@Entity()
export class CocktailToIngredient {
   @PrimaryColumn()
   cocktailId!: string

   @PrimaryColumn()
   ingredientId!: string

   @Column()
   amount!: string

   @ManyToOne(() => Cocktail, cocktail => cocktail.ingredients, { onDelete: 'CASCADE' })
   cocktail!: Cocktail

   @ManyToOne(() => Ingredient, ingredient => ingredient.cocktails, { onDelete: 'SET NULL' })
   ingredient!: Ingredient

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
