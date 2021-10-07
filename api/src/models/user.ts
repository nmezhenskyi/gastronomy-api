import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToMany,
   JoinTable,
   OneToMany
} from 'typeorm'
import { Cocktail } from './cocktail'
import { Meal } from './meal'
import { CocktailReview } from './cocktail-review'
import { MealReview } from './meal-review'

@Entity()
export class User {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({ length: 255 })
   name!: string

   @Column({
      type: 'varchar',
      length: 255,
      unique: true
   })
   email!: string

   @Column({ length: 255 })
   password!: string

   @Column({
      type: 'varchar',
      length: 100,
      nullable: true
   })
   location: string | null

   @Column({
      type: 'varchar',
      length: 255,
      nullable: true
   })
   photo: string | null

   @ManyToMany(() => Cocktail)
   @JoinTable({ name: 'user_saved_cocktail' })
   savedCocktails: Cocktail[]

   @ManyToMany(() => Meal)
   @JoinTable({ name: 'user_saved_meal' })
   savedMeals: Meal[]

   @OneToMany(() => CocktailReview, cocktailReview => cocktailReview.user)
   cocktailReviews!: CocktailReview[]

   @OneToMany(() => MealReview, mealReview => mealReview.user)
   mealReviews!: MealReview[]

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
