import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  action!: string;

  @Column()
  entityType!: string;

  @Column()
  entityId!: number;

  @Column('jsonb')
  changes!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, user => user.auditLogs)
  user!: User;
} 