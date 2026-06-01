import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Vehicle } from './entities/vehicle.entity';
import { ServiceRecord } from './entities/service-record.entity';
import { ServicePhoto } from './entities/service-photo.entity';
import { Appointment } from './entities/appointment.entity';
import { VehiclesController } from './vehicles/vehicles.controller';
import { VehiclesService } from './vehicles/vehicles.service';
import { AppointmentsController } from './appointments/appointments.controller';
import { AppointmentsService } from './appointments/appointments.service';

const isProdDb = !!process.env.DATABASE_URL;

@Module({
  imports: [
    TypeOrmModule.forRoot(
      isProdDb
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [Vehicle, ServiceRecord, ServicePhoto, Appointment],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          }
        : {
            type: 'sqlite',
            database: 'mbautolab.sqlite',
            entities: [Vehicle, ServiceRecord, ServicePhoto, Appointment],
            synchronize: true,
          },
    ),
    TypeOrmModule.forFeature([Vehicle, ServiceRecord, ServicePhoto, Appointment]),
  ],
  controllers: [AppController, VehiclesController, AppointmentsController],
  providers: [AppService, VehiclesService, AppointmentsService],
})
export class AppModule {}
