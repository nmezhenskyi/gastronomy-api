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
import { Cocktail } from './Cocktail'
import { Meal } from './Meal'
import { CocktailReview } from './CocktailReview'
import { MealReview } from './MealReview'

@Entity()
export class User {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({ length: 255 })
   name!: string

   @Column({ length: 255 })
   email!: string

   @Column({ length: 50 })
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
