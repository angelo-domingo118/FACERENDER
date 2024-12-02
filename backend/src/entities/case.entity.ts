import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Composite } from './composite.entity';

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  caseNumber!: string;

  @Column()
  status!: string;

  @Column()
  description!: string;

  @Column()
  incidentDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Composite, composite => composite.case)
  composites!: Composite[];
} 