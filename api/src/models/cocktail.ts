import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   OneToMany
} from 'typeorm'
import { CocktailToIngredient } from './cocktail-to-ingredient'
import { CocktailReview } from './cocktail-review'

@Entity()
export class Cocktail {
   @PrimaryGeneratedColumn('uuid')
   id!: string

   @Column({ length: 100 })
   name!: string

   @Column({
      type: 'text',
      nullable: true
   })
   description!: string | null

   @Column('text')
   method!: string

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnIngredients!: string | null

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnExecution!: string | null

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnTaste!: string | null

   @OneToMany(() => CocktailToIngredient, cocktailToIngredient => cocktailToIngredient.cocktail)
   ingredients!: CocktailToIngredient[]

   @OneToMany(() => CocktailReview, cocktailReview => cocktailReview.cocktail)
   reviews!: CocktailReview[]

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
