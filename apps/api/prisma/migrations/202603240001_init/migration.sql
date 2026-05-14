-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'IN_PROGRESS', 'PARTIAL_COMPLETED', 'COMPLETED', 'SETTLED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BatchStatus" AS ENUM ('PENDING', 'DISPATCHING', 'LOADING', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."VehicleOrderStatus" AS ENUM ('PENDING_DISPATCH', 'DISPATCHED', 'ARRIVED_FACTORY', 'LOADING', 'DEPARTED', 'ARRIVED_PORT', 'CUSTOMS_DECLARING', 'EXITED_COUNTRY', 'ENTERED_COUNTRY', 'DELIVERING', 'SIGNED', 'COMPLETED', 'ABNORMAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AbnormalStatus" AS ENUM ('OPEN', 'PROCESSING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."OwnerType" AS ENUM ('OWNED', 'OUTSOURCED');

-- CreateEnum
CREATE TYPE "public"."VehicleStatus" AS ENUM ('AVAILABLE', 'DISPATCHED', 'MAINTENANCE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "public"."DriverStatus" AS ENUM ('AVAILABLE', 'ON_DUTY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "public"."OperatorType" AS ENUM ('DRIVER', 'DISPATCHER', 'FIELD', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."SignStatus" AS ENUM ('UNSIGNED', 'PARTIAL', 'SIGNED');

-- CreateEnum
CREATE TYPE "public"."ReceiptPaymentType" AS ENUM ('RECEIVABLE', 'PAYABLE');

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "country" TEXT,
    "address" TEXT,
    "settlementType" TEXT,
    "creditDays" INTEGER,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inquiry" (
    "id" TEXT NOT NULL,
    "inquiryNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesUserId" TEXT,
    "cargoName" TEXT NOT NULL,
    "cargoDescription" TEXT,
    "originPlace" TEXT NOT NULL,
    "destinationPlace" TEXT NOT NULL,
    "totalWeight" DOUBLE PRECISION,
    "totalVolume" DOUBLE PRECISION,
    "totalQuantity" INTEGER,
    "expectedTime" TIMESTAMP(3),
    "specialRequirement" TEXT,
    "inquiryStatus" TEXT NOT NULL,
    "quotedAmount" DECIMAL(18,2),
    "quoteCurrency" TEXT,
    "quoteValidUntil" TIMESTAMP(3),
    "convertedProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "projectNo" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "inquiryId" TEXT,
    "businessType" TEXT,
    "originPlace" TEXT NOT NULL,
    "destinationPlace" TEXT NOT NULL,
    "contractAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "contractCurrency" TEXT NOT NULL DEFAULT 'CNY',
    "estimatedCost" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "actualCost" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "grossProfit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "grossProfitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plannedVehicleCount" INTEGER NOT NULL DEFAULT 0,
    "actualVehicleCount" INTEGER NOT NULL DEFAULT 0,
    "completedVehicleCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "projectStatus" "public"."ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "remark" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShipmentBatch" (
    "id" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "batchName" TEXT NOT NULL,
    "sequenceNo" INTEGER NOT NULL DEFAULT 1,
    "plannedVehicleCount" INTEGER NOT NULL DEFAULT 0,
    "actualVehicleCount" INTEGER NOT NULL DEFAULT 0,
    "batchStatus" "public"."BatchStatus" NOT NULL DEFAULT 'PENDING',
    "loadingDate" TIMESTAMP(3),
    "departureDate" TIMESTAMP(3),
    "estimatedArrivalDate" TIMESTAMP(3),
    "actualArrivalDate" TIMESTAMP(3),
    "remark" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Supplier" (
    "id" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "country" TEXT,
    "supplierType" TEXT,
    "settlementType" TEXT,
    "rating" INTEGER,
    "supplierStatus" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleResource" (
    "id" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleLength" DOUBLE PRECISION,
    "vehicleWidth" DOUBLE PRECISION,
    "maxLoadWeight" DOUBLE PRECISION,
    "ownerType" "public"."OwnerType" NOT NULL DEFAULT 'OUTSOURCED',
    "supplierId" TEXT,
    "vehicleStatus" "public"."VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "gpsDeviceNo" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Driver" (
    "id" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "idNo" TEXT,
    "licenseNo" TEXT,
    "nationality" TEXT,
    "supplierId" TEXT,
    "driverStatus" "public"."DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleOrder" (
    "id" TEXT NOT NULL,
    "vehicleOrderNo" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "batchId" TEXT,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "supplierId" TEXT,
    "cargoName" TEXT NOT NULL,
    "cargoDescription" TEXT,
    "loadAddress" TEXT NOT NULL,
    "unloadAddress" TEXT NOT NULL,
    "customsPort" TEXT,
    "destinationCountry" TEXT,
    "plannedDepartureTime" TIMESTAMP(3),
    "actualDepartureTime" TIMESTAMP(3),
    "estimatedArrivalTime" TIMESTAMP(3),
    "actualArrivalTime" TIMESTAMP(3),
    "currentNodeCode" TEXT,
    "currentStatus" "public"."VehicleOrderStatus" NOT NULL DEFAULT 'PENDING_DISPATCH',
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "signStatus" "public"."SignStatus" NOT NULL DEFAULT 'UNSIGNED',
    "remark" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrackingNode" (
    "id" TEXT NOT NULL,
    "vehicleOrderId" TEXT NOT NULL,
    "nodeCode" TEXT NOT NULL,
    "nodeName" TEXT NOT NULL,
    "nodeStatus" TEXT NOT NULL,
    "nodeTime" TIMESTAMP(3) NOT NULL,
    "locationText" TEXT,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "operatorType" "public"."OperatorType" NOT NULL DEFAULT 'SYSTEM',
    "operatorId" TEXT,
    "photoUrls" TEXT[],
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DispatchRecord" (
    "id" TEXT NOT NULL,
    "dispatchNo" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "batchId" TEXT,
    "vehicleOrderId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "dispatcherId" TEXT,
    "dispatchTime" TIMESTAMP(3) NOT NULL,
    "dispatchStatus" TEXT NOT NULL,
    "instructionText" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispatchRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CargoItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "batchId" TEXT,
    "vehicleOrderId" TEXT,
    "cargoName" TEXT NOT NULL,
    "packageType" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unitWeight" DOUBLE PRECISION,
    "totalWeight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "isOversize" BOOLEAN NOT NULL DEFAULT false,
    "isOverweight" BOOLEAN NOT NULL DEFAULT false,
    "canSplit" BOOLEAN NOT NULL DEFAULT true,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CargoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AbnormalEvent" (
    "id" TEXT NOT NULL,
    "abnormalNo" TEXT NOT NULL,
    "projectId" TEXT,
    "batchId" TEXT,
    "vehicleOrderId" TEXT,
    "abnormalType" TEXT NOT NULL,
    "abnormalLevel" TEXT NOT NULL,
    "abnormalStatus" "public"."AbnormalStatus" NOT NULL DEFAULT 'OPEN',
    "reportUserId" TEXT,
    "reportTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationText" TEXT,
    "description" TEXT NOT NULL,
    "impactAmount" DECIMAL(18,2),
    "impactHours" INTEGER,
    "solutionText" TEXT,
    "closedBy" TEXT,
    "closedTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbnormalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectIncome" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "incomeType" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectCost" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "batchId" TEXT,
    "vehicleOrderId" TEXT,
    "costType" TEXT NOT NULL,
    "supplierId" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "costStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "remark" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReceiptPayment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "relatedType" "public"."ReceiptPaymentType" NOT NULL,
    "relatedId" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "payerPayeeName" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemRole" (
    "id" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "roleStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "departmentId" TEXT,
    "roleId" TEXT,
    "userStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OperationLog" (
    "id" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "operatorId" TEXT,
    "operatorName" TEXT,
    "actionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beforeData" JSONB,
    "afterData" JSONB,
    "ipAddress" TEXT,

    CONSTRAINT "OperationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "public"."Customer"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_inquiryNo_key" ON "public"."Inquiry"("inquiryNo");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_convertedProjectId_key" ON "public"."Inquiry"("convertedProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectNo_key" ON "public"."Project"("projectNo");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentBatch_batchNo_key" ON "public"."ShipmentBatch"("batchNo");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_supplierCode_key" ON "public"."Supplier"("supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleResource_vehicleNo_key" ON "public"."VehicleResource"("vehicleNo");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_driverPhone_key" ON "public"."Driver"("driverPhone");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleOrder_vehicleOrderNo_key" ON "public"."VehicleOrder"("vehicleOrderNo");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchRecord_dispatchNo_key" ON "public"."DispatchRecord"("dispatchNo");

-- CreateIndex
CREATE UNIQUE INDEX "AbnormalEvent_abnormalNo_key" ON "public"."AbnormalEvent"("abnormalNo");

-- CreateIndex
CREATE UNIQUE INDEX "SystemRole_roleCode_key" ON "public"."SystemRole"("roleCode");

-- CreateIndex
CREATE UNIQUE INDEX "SystemUser_username_key" ON "public"."SystemUser"("username");

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_convertedProjectId_fkey" FOREIGN KEY ("convertedProjectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "public"."Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentBatch" ADD CONSTRAINT "ShipmentBatch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleResource" ADD CONSTRAINT "VehicleResource_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Driver" ADD CONSTRAINT "Driver_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleOrder" ADD CONSTRAINT "VehicleOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleOrder" ADD CONSTRAINT "VehicleOrder_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."ShipmentBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleOrder" ADD CONSTRAINT "VehicleOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleOrder" ADD CONSTRAINT "VehicleOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."VehicleResource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleOrder" ADD CONSTRAINT "VehicleOrder_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleOrder" ADD CONSTRAINT "VehicleOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackingNode" ADD CONSTRAINT "TrackingNode_vehicleOrderId_fkey" FOREIGN KEY ("vehicleOrderId") REFERENCES "public"."VehicleOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DispatchRecord" ADD CONSTRAINT "DispatchRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DispatchRecord" ADD CONSTRAINT "DispatchRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."ShipmentBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DispatchRecord" ADD CONSTRAINT "DispatchRecord_vehicleOrderId_fkey" FOREIGN KEY ("vehicleOrderId") REFERENCES "public"."VehicleOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DispatchRecord" ADD CONSTRAINT "DispatchRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."VehicleResource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DispatchRecord" ADD CONSTRAINT "DispatchRecord_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CargoItem" ADD CONSTRAINT "CargoItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CargoItem" ADD CONSTRAINT "CargoItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."ShipmentBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CargoItem" ADD CONSTRAINT "CargoItem_vehicleOrderId_fkey" FOREIGN KEY ("vehicleOrderId") REFERENCES "public"."VehicleOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AbnormalEvent" ADD CONSTRAINT "AbnormalEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AbnormalEvent" ADD CONSTRAINT "AbnormalEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."ShipmentBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AbnormalEvent" ADD CONSTRAINT "AbnormalEvent_vehicleOrderId_fkey" FOREIGN KEY ("vehicleOrderId") REFERENCES "public"."VehicleOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectIncome" ADD CONSTRAINT "ProjectIncome_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectCost" ADD CONSTRAINT "ProjectCost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectCost" ADD CONSTRAINT "ProjectCost_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."ShipmentBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectCost" ADD CONSTRAINT "ProjectCost_vehicleOrderId_fkey" FOREIGN KEY ("vehicleOrderId") REFERENCES "public"."VehicleOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectCost" ADD CONSTRAINT "ProjectCost_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReceiptPayment" ADD CONSTRAINT "ReceiptPayment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SystemUser" ADD CONSTRAINT "SystemUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."SystemRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

