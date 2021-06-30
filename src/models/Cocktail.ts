import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   OneToMany
} from 'typeorm'
import { CocktailToIngredient } from './CocktailToIngredient'

@Entity()
export class Cocktail {
   @PrimaryGeneratedColumn('uuid')
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
   description: string

   @Column('text')
   method!: string

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnIngredients: string

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnExecution: string

   @Column({
      type: 'text',
      nullable: true
   })
   notesOnTaste: string

   @OneToMany(() => CocktailToIngredient, cocktailToIngredient => cocktailToIngredient.cocktail, { eager: true })
   cocktailToIngredients!: CocktailToIngredient[]

   @CreateDateColumn()
   createdAt!: Date

   @UpdateDateColumn()
   updatedAt!: Date
}
