import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private repo: Repository<Appointment>,
  ) {}

  /* ── Create new appointment request ── */
  async create(dto: {
    customerName: string;
    customerPhone: string;
    plate: string;
    brand?: string;
    problemDesc: string;
    problemPhoto?: string;
    requestedDate: string;
    requestedTime: string;
    master: string;
  }): Promise<Appointment> {
    const appt = this.repo.create({
      ...dto,
      plate: dto.plate.toUpperCase().replace(/\s+/g, ''),
      status: 'pending',
    });
    return this.repo.save(appt);
  }

  /* ── Get all appointments (with optional filters) ── */
  async findAll(opts?: {
    status?: string;
    master?: string;
    date?: string;
  }): Promise<Appointment[]> {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC');
    if (opts?.status) qb.andWhere('a.status = :status', { status: opts.status });
    if (opts?.master) qb.andWhere('a.master = :master', { master: opts.master });
    if (opts?.date)
      qb.andWhere('(a.confirmedDate = :date OR a.requestedDate = :date)', {
        date: opts.date,
      });
    return qb.getMany();
  }

  /* ── Get single appointment ── */
  async findOne(id: number): Promise<Appointment> {
    const appt = await this.repo.findOne({ where: { id } });
    if (!appt) throw new NotFoundException(`Randevu #${id} bulunamadı.`);
    return appt;
  }

  /* ── Approve ── */
  async approve(
    id: number,
    dto: {
      confirmedDate: string;
      confirmedTime: string;
      masterNote?: string;
    },
  ): Promise<Appointment> {
    const appt = await this.findOne(id);
    appt.status = 'approved';
    appt.confirmedDate = dto.confirmedDate;
    appt.confirmedTime = dto.confirmedTime;
    appt.masterNote = dto.masterNote || '';
    return this.repo.save(appt);
  }

  /* ── Reject ── */
  async reject(
    id: number,
    dto: { rejectionReason: string },
  ): Promise<Appointment> {
    const appt = await this.findOne(id);
    appt.status = 'rejected';
    appt.rejectionReason = dto.rejectionReason;
    return this.repo.save(appt);
  }

  /* ── Cancel (by master or customer) ── */
  async cancel(
    id: number,
    dto: { cancelReason?: string },
  ): Promise<Appointment> {
    const appt = await this.findOne(id);
    appt.status = 'cancelled';
    appt.cancelReason = dto.cancelReason || '';
    return this.repo.save(appt);
  }

  /* ── Get calendar data: approved appointments grouped by date ── */
  async getCalendar(master?: string): Promise<
    Record<
      string,
      { id: number; time: string; customerName: string; plate: string; master: string }[]
    >
  > {
    const qb = this.repo
      .createQueryBuilder('a')
      .select(['a.id', 'a.confirmedDate', 'a.confirmedTime', 'a.customerName', 'a.plate', 'a.master'])
      .where('a.status = :status', { status: 'approved' });

    if (master) qb.andWhere('a.master = :master', { master });

    const appts = await qb.getMany();
    const map: Record<string, any[]> = {};
    for (const a of appts) {
      const key = a.confirmedDate;
      if (!map[key]) map[key] = [];
      map[key].push({
        id: a.id,
        time: a.confirmedTime,
        customerName: a.customerName,
        plate: a.plate,
        master: a.master,
      });
    }
    // Sort each day's appointments by time
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }
}
