import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   OneToMany
} from 'typeorm'
import { MealToIngredient } from './meal-to-ingredient'
import { MealReview } from './meal-review'

@Entity()
export class Meal {
   @PrimaryGeneratedColumn()
   id!: string

   @Column({
      length: 100,
      unique: true
   })
   name!: string

   @Column({
      type: 'text',
      nullable: true
   })
   description: string | null

   @Column({
      type: 'varchar',
      length: 20,
      nullable: true
   })
   cuisine: string | null

   @Column('text')
   instructions!: string

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnIngredients: string | null

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnExecution: string | null

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnTaste: string | null

   @OneToMany(() => MealToIngredient, mealToIngredient => mealToIngredient.meal, { eager: true })
   ingredients!: MealToIngredient[]

   @OneToMany(() => MealReview, mealReview => mealReview.meal)
   reviews!: MealReview[]

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
