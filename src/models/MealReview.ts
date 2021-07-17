import {
   Entity,
   Column,
   PrimaryColumn,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToOne
} from 'typeorm'
import { Meal } from './Meal'
import { User } from './User'

@Entity()
export class MealReview {
   @PrimaryColumn()
   mealId!: string

   @PrimaryColumn()
   userId!: string

   @Column()
   rating!: number

   @Column({
      type: 'varchar',
      length: 2000
   })
   review!: string

   @ManyToOne(() => Meal, meal => meal.reviews, { onDelete: 'CASCADE' })
   meal!: Meal

   @ManyToOne(() => User, user => user.mealReviews, { onDelete: 'SET NULL' })
   user!: User

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
