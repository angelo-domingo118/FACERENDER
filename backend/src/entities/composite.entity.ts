import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Case } from './case.entity';
import { Feature } from './feature.entity';

@Entity('composites')
export class Composite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  caseId!: string;

  @Column()
  status!: string;

  @Column('jsonb')
  operatorDetails!: Record<string, any>;

  @Column('jsonb')
  witnessDetails!: Record<string, any>;

  @Column('jsonb')
  incidentDetails!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, user => user.composites)
  user!: User;

  @ManyToOne(() => Case, case_ => case_.composites)
  case!: Case;

  @ManyToMany(() => Feature)
  @JoinTable()
  features!: Feature[];
} 