import {
   Entity,
   Column,
   PrimaryColumn,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToOne
} from 'typeorm'
import { Cocktail } from './Cocktail'
import { User } from './User'

@Entity()
export class CocktailReview {
   @PrimaryColumn()
   cocktailId!: string

   @PrimaryColumn()
   userId!: string

   @Column()
   rating!: number

   @Column({
      type: 'varchar',
      length: 2000
   })
   review!: string

   @ManyToOne(() => Cocktail, cocktail => cocktail.reviews, { onDelete: 'CASCADE' })
   cocktail!: Cocktail

   @ManyToOne(() => User, user => user.cocktailReviews, { onDelete: 'SET NULL' })
   user!: User

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
