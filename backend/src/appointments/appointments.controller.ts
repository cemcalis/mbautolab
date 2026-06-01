import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('api/appointments')
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  /* POST /api/appointments — create request */
  @Post()
  create(
    @Body()
    dto: {
      customerName: string;
      customerPhone: string;
      plate: string;
      brand?: string;
      problemDesc: string;
      problemPhoto?: string;
      requestedDate: string;
      requestedTime: string;
      master: string;
    },
  ) {
    return this.svc.create(dto);
  }

  /* GET /api/appointments?status=pending&master=Fatih */
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('master') master?: string,
    @Query('date') date?: string,
  ) {
    return this.svc.findAll({ status, master, date });
  }

  /* GET /api/appointments/calendar?master=Fatih */
  @Get('calendar')
  getCalendar(@Query('master') master?: string) {
    return this.svc.getCalendar(master);
  }

  /* GET /api/appointments/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  /* PATCH /api/appointments/:id/approve */
  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      confirmedDate: string;
      confirmedTime: string;
      masterNote?: string;
    },
  ) {
    return this.svc.approve(id, dto);
  }

  /* PATCH /api/appointments/:id/reject */
  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { rejectionReason: string },
  ) {
    return this.svc.reject(id, dto);
  }

  /* PATCH /api/appointments/:id/cancel */
  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { cancelReason?: string },
  ) {
    return this.svc.cancel(id, dto);
  }
}
