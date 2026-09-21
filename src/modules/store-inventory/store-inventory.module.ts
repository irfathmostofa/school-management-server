import { Module } from "@nestjs/common";
import { StoreInventoryController } from "./store-inventory.controller";
import { StoreInventoryService } from "./store-inventory.service";

@Module({
  controllers: [StoreInventoryController],
  providers: [StoreInventoryService],
  exports: [StoreInventoryService],
})
export class StoreInventoryModule {}
