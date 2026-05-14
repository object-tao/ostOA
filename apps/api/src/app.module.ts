import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AppController } from './controllers/app.controller';
import { AuthController } from './controllers/auth.controller';
import { BatchesController } from './controllers/batches.controller';
import { DispatchController } from './controllers/dispatch.controller';
import { InTransitController } from './controllers/in-transit.controller';
import { ProjectsController } from './controllers/projects.controller';
import { VehicleOrdersController } from './controllers/vehicle-orders.controller';
import { AbnormalEventsController } from './controllers/abnormal-events.controller';
import { FinanceController } from './controllers/finance.controller';
import { InquiriesController } from './controllers/inquiries.controller';
import { MasterDataController, ResourcesController } from './controllers/resources.controller';
import { TasksController } from './controllers/tasks.controller';
import { WaybillsController } from './controllers/waybills.controller';
import { CustomsController } from './controllers/customs.controller';
import { ApprovalsController } from './controllers/approvals.controller';
import { SystemAdminController } from './controllers/system-admin.controller';
import { OversizeTransportController } from './controllers/oversize-transport.controller';
import { TariffController } from './controllers/tariff.controller';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './services/auth.service';
import { ProjectsService } from './services/projects.service';
import { BatchesService } from './services/batches.service';
import { VehicleOrdersService } from './services/vehicle-orders.service';
import { DispatchService } from './services/dispatch.service';
import { ResourcesService } from './services/resources.service';
import { InTransitService } from './services/in-transit.service';
import { AbnormalEventsService } from './services/abnormal-events.service';
import { FinanceService } from './services/finance.service';
import { InquiriesService } from './services/inquiries.service';
import { TasksService } from './services/tasks.service';
import { WaybillsService } from './services/waybills.service';
import { CustomsService } from './services/customs.service';
import { ApprovalsService } from './services/approvals.service';
import { SystemAdminService } from './services/system-admin.service';
import { OversizeTransportService } from './services/oversize-transport.service';
import { TariffService } from './services/tariff.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'heavy-cargo-secret'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    InquiriesController,
    ProjectsController,
    BatchesController,
    VehicleOrdersController,
    DispatchController,
    ResourcesController,
    MasterDataController,
    InTransitController,
    AbnormalEventsController,
    FinanceController,
    WaybillsController,
    TasksController,
    CustomsController,
    ApprovalsController,
    SystemAdminController,
    OversizeTransportController,
    TariffController,
  ],
  providers: [
    PrismaService,
    AuthService,
    InquiriesService,
    ProjectsService,
    BatchesService,
    VehicleOrdersService,
    DispatchService,
    ResourcesService,
    InTransitService,
    AbnormalEventsService,
    FinanceService,
    WaybillsService,
    TasksService,
    CustomsService,
    ApprovalsService,
    SystemAdminService,
    OversizeTransportService,
    TariffService,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
