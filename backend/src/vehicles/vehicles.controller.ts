import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

@Controller('api/vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.vehiclesService.findAll(search);
  }

  @Get(':plate')
  async findOne(@Param('plate') plate: string) {
    return this.vehiclesService.findOne(plate);
  }

  @Post()
  async create(
    @Body() dto: {
      plate: string;
      brand: string;
      owner: string;
      phone: string;
      status: string;
      initialNotes?: string;
    },
  ) {
    return this.vehiclesService.create(dto);
  }

  @Post(':plate/records')
  async addRecord(
    @Param('plate') plate: string,
    @Body() dto: {
      km: number;
      desc: string;
      status: string;
      parts: string[];
      master: string;
      photos?: string[];
    },
  ) {
    return this.vehiclesService.addRecord(plate, dto);
  }
}
