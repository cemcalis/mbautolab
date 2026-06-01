import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type AppointmentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  /* Customer info */
  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  /* Vehicle info */
  @Column()
  plate: string;

  @Column({ nullable: true })
  brand: string;

  /* Problem description */
  @Column({ type: 'text' })
  problemDesc: string;

  @Column({ type: 'text', nullable: true })
  problemPhoto: string; // base64 compressed image

  /* Appointment preference */
  @Column()
  requestedDate: string; // ISO date string YYYY-MM-DD

  @Column()
  requestedTime: string; // e.g. "10:00"

  @Column()
  master: string; // "Fatih" | "Mustafa"

  /* Status management */
  @Column({ default: 'pending' })
  status: AppointmentStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  cancelReason: string;

  /* Approved/finalized time (set by master) */
  @Column({ nullable: true })
  confirmedDate: string;

  @Column({ nullable: true })
  confirmedTime: string;

  @Column({ nullable: true })
  masterNote: string;

  @CreateDateColumn()
  createdAt: Date;
}
