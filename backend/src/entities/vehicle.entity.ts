import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ServiceRecord } from './service-record.entity';

@Entity()
export class Vehicle {
  @PrimaryColumn()
  id: string; // Clean Plate without spaces, e.g. '34MBA99'

  @Column()
  plate: string; // Formatted plate, e.g. '34 MBA 99'

  @Column()
  brand: string;

  @Column()
  owner: string;

  @Column()
  phone: string;

  @Column()
  status: string; // sirada, bakimda, test, hazir, teslim

  @Column()
  lastUpdated: string;

  @OneToMany(() => ServiceRecord, (record) => record.vehicle, { cascade: true })
  records: ServiceRecord[];
}
