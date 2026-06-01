import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceRecord } from './service-record.entity';

@Entity()
export class ServicePhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  photoData: string; // Base64 compressed JPEG string

  @Column()
  recordId: number;

  @ManyToOne(() => ServiceRecord, (record) => record.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recordId' })
  record: ServiceRecord;
}
