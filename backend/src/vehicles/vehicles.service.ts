import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { ServiceRecord } from '../entities/service-record.entity';
import { ServicePhoto } from '../entities/service-photo.entity';

// Helper to generate a crisp vector CAD blueprint for mock items
function generateSvgBlueprint(partName: string): string {
  const cleanName = partName.toUpperCase();
  const isBrake = cleanName.includes('FREN') || cleanName.includes('BALATA') || cleanName.includes('DİSK') || cleanName.includes('DISK');
  const isFilter = cleanName.includes('YAĞ') || cleanName.includes('FİLTRE') || cleanName.includes('POLEN') || cleanName.includes('HAVA');
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background-color: #0d0f14; font-family: 'Courier New', monospace;">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 162, 232, 0.08)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  <rect x="10" y="10" width="380" height="280" fill="none" stroke="rgba(0, 162, 232, 0.35)" stroke-width="1.5" />
  
  <!-- Coordinate Axis -->
  <line x1="200" y1="15" x2="200" y2="285" stroke="rgba(229, 27, 36, 0.2)" stroke-width="1" stroke-dasharray="3,3" />
  <line x1="15" y1="150" x2="385" y2="150" stroke="rgba(229, 27, 36, 0.2)" stroke-width="1" stroke-dasharray="3,3" />
  
  <!-- Mechanical Wireframe -->
  <circle cx="200" cy="150" r="65" fill="none" stroke="#00a2e8" stroke-width="2.5" style="filter: drop-shadow(0px 0px 4px rgba(0, 162, 232, 0.4));" />
  <circle cx="200" cy="150" r="22" fill="none" stroke="#00a2e8" stroke-width="1.5" />
  <circle cx="200" cy="150" r="6" fill="#00a2e8" />
  
  ${isBrake ? `
    <!-- Brake caliper assembly -->
    <path d="M 140 100 A 78 78 0 0 1 260 100" fill="none" stroke="#e51b24" stroke-width="7" stroke-linecap="round" />
    <text x="145" y="80" fill="#e51b24" font-size="8" font-weight="bold">BREMBO SYSTEM REF</text>
    <line x1="120" y1="150" x2="135" y2="150" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
    <line x1="265" y1="150" x2="280" y2="150" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
  ` : isFilter ? `
    <!-- Filter cartridge ribs -->
    <rect x="160" y="90" width="80" height="120" rx="4" fill="rgba(0,162,232,0.05)" stroke="#00a2e8" stroke-width="2" />
    <line x1="160" y1="120" x2="240" y2="120" stroke="#00a2e8" stroke-width="1.5" />
    <line x1="160" y1="150" x2="240" y2="150" stroke="#00a2e8" stroke-width="1.5" />
    <line x1="160" y1="180" x2="240" y2="180" stroke="#00a2e8" stroke-width="1.5" />
    <circle cx="200" cy="150" r="14" fill="rgba(229,27,36,0.15)" stroke="#e51b24" stroke-width="1.5" />
  ` : `
    <!-- Piston connection rods -->
    <line x1="200" y1="90" x2="200" y2="210" stroke="#e51b24" stroke-width="2.5" />
    <rect x="175" y="70" width="50" height="20" rx="3" fill="rgba(0,162,232,0.1)" stroke="#00a2e8" stroke-width="2" />
  `}
  
  <!-- Technical Labels -->
  <text x="25" y="32" fill="rgba(255, 255, 255, 0.45)" font-size="9" font-weight="bold">CAD MODEL: ${cleanName}</text>
  <text x="25" y="278" fill="rgba(255, 255, 255, 0.35)" font-size="8">MBAUTOLAB SERVICE HISTORY AUTO-GRAPHICS SYSTEM</text>
  <text x="310" y="32" fill="rgba(0, 162, 232, 0.6)" font-size="8">SCALE 1:1</text>
  <text x="310" y="44" fill="rgba(0, 162, 232, 0.6)" font-size="8">UNIT: MM</text>
  
  <!-- M-Branding Stamps -->
  <rect x="345" y="264" width="10" height="12" fill="#00a2e8" />
  <rect x="357" y="264" width="10" height="12" fill="#003a94" />
  <rect x="369" y="264" width="10" height="12" fill="#e51b24" />
</svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

@Injectable()
export class VehiclesService implements OnModuleInit {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(ServiceRecord)
    private readonly recordRepository: Repository<ServiceRecord>,
    @InjectRepository(ServicePhoto)
    private readonly photoRepository: Repository<ServicePhoto>,
  ) {}

  // Trigger seeding hook when the backend initializes
  async onModuleInit() {
    // Seeding disabled to only use real vehicles
    // await this.seed();
  }

  // Format plates safely
  formatPlate(plate: string): string {
    if (!plate) return '';
    return plate.toUpperCase().trim().replace(/[^A-Z0-9\s]/g, '');
  }

  getCleanId(plate: string): string {
    return this.formatPlate(plate).replace(/\s+/g, '');
  }

  // Fetch all vehicles
  async findAll(search?: string): Promise<Vehicle[]> {
    const query = this.vehicleRepository.createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.records', 'records')
      .leftJoinAndSelect('records.photos', 'photos');

    if (search) {
      const cleanSearch = `%${search.toLowerCase().trim()}%`;
      query.where(
        'LOWER(vehicle.plate) LIKE :search OR LOWER(vehicle.brand) LIKE :search OR LOWER(vehicle.owner) LIKE :search',
        { search: cleanSearch },
      );
    }

    // Sort newest updated vehicles first
    query.orderBy('vehicle.lastUpdated', 'DESC');
    const list = await query.getMany();
    
    // Sort nested records by ID/Date descending
    list.forEach(v => {
      if (v.records) {
        v.records.sort((a, b) => b.id - a.id);
      }
    });

    return list;
  }

  // Fetch single vehicle details by Plate
  async findOne(plate: string): Promise<Vehicle> {
    const cleanId = this.getCleanId(plate);
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: cleanId },
      relations: ['records', 'records.photos'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Plaka sistemde kayıtlı değil: ${plate}`);
    }

    // Sort records descending (newest first)
    if (vehicle.records) {
      vehicle.records.sort((a, b) => b.id - a.id);
    }

    return vehicle;
  }

  // Create new vehicle entry
  async create(dto: {
    plate: string;
    brand: string;
    owner: string;
    phone: string;
    status: string;
    initialNotes?: string;
  }): Promise<Vehicle> {
    const plateFormatted = this.formatPlate(dto.plate);
    const cleanId = this.getCleanId(dto.plate);

    // Duplication Check
    const exists = await this.vehicleRepository.findOne({ where: { id: cleanId } });
    if (exists) {
      throw new BadRequestException(`Bu plakalı araç zaten kayıtlı: ${plateFormatted}`);
    }

    const nowStr = this.getFormattedDate();
    
    const vehicle = this.vehicleRepository.create({
      id: cleanId,
      plate: plateFormatted,
      brand: dto.brand,
      owner: dto.owner,
      phone: dto.phone,
      status: dto.status,
      lastUpdated: nowStr,
    });

    const savedVehicle = await this.vehicleRepository.save(vehicle);

    // Initial Record creation
    const record = this.recordRepository.create({
      date: nowStr,
      km: 0,
      desc: dto.initialNotes || 'Araç ilk kayıt kaydı oluşturuldu.',
      master: 'Fatih',
      vehicleId: cleanId,
    });
    await this.recordRepository.save(record);

    return this.findOne(cleanId);
  }

  // Add Service record history
  async addRecord(
    plate: string,
    dto: {
      km: number;
      desc: string;
      status: string;
      parts: string[];
      master: string;
      photos?: string[]; // Array of base64 compressed strings
    },
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(plate); // Throws NotFound if missing
    const nowStr = this.getFormattedDate();

    // 1. Update vehicle parents state
    vehicle.status = dto.status;
    vehicle.lastUpdated = nowStr;
    await this.vehicleRepository.save(vehicle);

    // 2. Add maintenance record
    const partsString = dto.parts ? dto.parts.join(', ') : '';
    const record = this.recordRepository.create({
      date: nowStr,
      km: dto.km,
      desc: dto.desc,
      parts: partsString,
      master: dto.master,
      vehicleId: vehicle.id,
    });
    const savedRecord = await this.recordRepository.save(record);

    // 3. Save photos base64 structures
    if (dto.photos && dto.photos.length > 0) {
      const photoEntities = dto.photos.map(p => this.photoRepository.create({
        photoData: p,
        recordId: savedRecord.id,
      }));
      await this.photoRepository.save(photoEntities);
    }

    return this.findOne(vehicle.id);
  }

  // Date formatted localized representation
  getFormattedDate(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  // Seeding sample datasets inside SQLite on first boots
  private async seed() {
    const count = await this.vehicleRepository.count();
    if (count > 0) return; // DB already has records

    console.log('🌱 MBAUTOLAB SQLite seeding starting...');

    const nowStr = this.getFormattedDate();

    // Seed 1: BMW M5 (34 MBA 99)
    const m5 = this.vehicleRepository.create({
      id: '34MBA99',
      plate: '34 MBA 99',
      brand: 'BMW M5 Sedan (F90)',
      owner: 'Cem Yılmaz',
      phone: '0532 555 3499',
      status: 'teslim',
      lastUpdated: nowStr,
    });
    await this.vehicleRepository.save(m5);

    const r1 = await this.recordRepository.save(this.recordRepository.create({
      date: '31.05.2026 11:30',
      km: 120540,
      desc: '120.000 KM periyodik bakımı yapıldı. Liqui Moly 5W-30 motor yağı, yağ filtresi, hava filtresi ve polen filtresi yenilendi. Yağ kaçakları gözlenmedi.',
      parts: 'Motor Yağı, Yağ Filtresi, Hava Filtresi, Polen Filtresi',
      master: 'Fatih',
      vehicleId: '34MBA99',
    }));

    await this.photoRepository.save([
      this.photoRepository.create({ photoData: generateSvgBlueprint('Yağ Filtresi'), recordId: r1.id }),
      this.photoRepository.create({ photoData: generateSvgBlueprint('Hava Filtresi'), recordId: r1.id }),
    ]);

    const r2 = await this.recordRepository.save(this.recordRepository.create({
      date: '15.02.2026 15:45',
      km: 114200,
      desc: 'Ön ve arka fren balataları Brembo marka balatalar ile değiştirildi. Disklerin torna işlemi yapıldı, fren hidroliği (Dot 4) yenilendi.',
      parts: 'Ön Fren Balataları, Arka Fren Balataları, Fren Hidroliği',
      master: 'Fatih',
      vehicleId: '34MBA99',
    }));
    await this.photoRepository.save(
      this.photoRepository.create({ photoData: generateSvgBlueprint('Brembo Fren Balatası'), recordId: r2.id }),
    );

    // Seed 2: Audi A6 (34 AUT 45)
    const a6 = this.vehicleRepository.create({
      id: '34AUT45',
      plate: '34 AUT 45',
      brand: 'Audi A6 Avant 2.0 TDI',
      owner: 'Mustafa Koç',
      phone: '0542 444 4545',
      status: 'hazir',
      lastUpdated: nowStr,
    });
    await this.vehicleRepository.save(a6);

    const r3 = await this.recordRepository.save(this.recordRepository.create({
      date: '30.05.2026 16:20',
      km: 94800,
      desc: 'Şanzıman yağı ve şanzıman filtresi orijinal set ile değiştirildi. Bilgisayarlı arıza teşhisi yapıldı, adaptasyon ayarları tamamlandı.',
      parts: 'Şanzıman Yağı, Şanzıman Filtresi',
      master: 'Mustafa',
      vehicleId: '34AUT45',
    }));
    await this.photoRepository.save(
      this.photoRepository.create({ photoData: generateSvgBlueprint('Şanzıman Filtresi'), recordId: r3.id }),
    );

    const r4 = await this.recordRepository.save(this.recordRepository.create({
      date: '20.10.2025 10:00',
      km: 80100,
      desc: 'Ağır bakım kapsamında triger kayış seti ve devirdaim su pompası değiştirildi. Kırmızı organik antifriz yenilendi.',
      parts: 'Triger Kayışı Seti, Devirdaim Pompası, Antifriz',
      master: 'Mustafa',
      vehicleId: '34AUT45',
    }));
    await this.photoRepository.save([
      this.photoRepository.create({ photoData: generateSvgBlueprint('Triger Seti'), recordId: r4.id }),
      this.photoRepository.create({ photoData: generateSvgBlueprint('Devirdaim Pompası'), recordId: r4.id }),
    ]);

    // Seed 3: Mercedes C200 (06 LAB 10)
    const c200 = this.vehicleRepository.create({
      id: '06LAB10',
      plate: '06 LAB 10',
      brand: 'Mercedes-Benz C200d W205',
      owner: 'Ahmet Hakan',
      phone: '0505 111 1010',
      status: 'bakimda',
      lastUpdated: nowStr,
    });
    await this.vehicleRepository.save(c200);

    const r5 = await this.recordRepository.save(this.recordRepository.create({
      date: '31.05.2026 09:15',
      km: 165000,
      desc: 'Araçta tekleme ve güç kaybı şikayetiyle başlandı. Turbo hortumunda yırtık tespit edildi, yedek parça siparişi geçildi. Enjektör pulları sökülüp temizlendi.',
      parts: 'Turbo Hortumu, Enjektör Pulları',
      master: 'Fatih',
      vehicleId: '06LAB10',
    }));
    await this.photoRepository.save(
      this.photoRepository.create({ photoData: generateSvgBlueprint('Turbo Intercooler Hortumu'), recordId: r5.id }),
    );

    console.log('🌱 MBAUTOLAB SQLite seeding completed successfully!');
  }
}
