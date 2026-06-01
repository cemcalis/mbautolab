import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { ServicePhoto } from './service-photo.entity';

@Entity()
export class ServiceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  km: number;

  @Column({ type: 'text' })
  desc: string;

  @Column({ type: 'text', nullable: true })
  parts: string; // Comma separated parts string

  @Column()
  master: string; // 'Fatih' or 'Mustafa'

  @Column()
  vehicleId: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @OneToMany(() => ServicePhoto, (photo) => photo.record, { cascade: true })
  photos: ServicePhoto[];
}
