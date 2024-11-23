import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { HealthTrackingService } from './health-tracking.service';
import { HealthTracking } from 'src/schema/healthTracking.schema';
import { Sleep } from 'src/schema/sleep.schema';
import { BodyIndex } from 'src/schema/bodyIndex.schema';
import { UserService } from 'src/user/user.service';

@Controller('health-tracking')
export class HealthTrackingController {
  constructor(private readonly healthTrackingService: HealthTrackingService,
    private readonly userService: UserService,
  ) {}

  // Lấy tất cả HealthTracking
  @Get()
  async findAll(): Promise<HealthTracking[]> {
    return this.healthTrackingService.findAll();
  }

  // Lấy HealthTracking theo ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HealthTracking> {
    return this.healthTrackingService.findOne(id);
  }

  @Post('create-empty/:userId')
  async createEmptyHealthTracking(
    @Param('userId') userId: string,
  ): Promise<HealthTracking> {
    return this.healthTrackingService.createEmptyHealthTracking(userId); // Gọi service để tạo HealthTracking mới
  }

  // Tạo mới HealthTracking
  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() createHealthTracking: HealthTracking,
  ): Promise<HealthTracking> {
    return this.healthTrackingService.createHealthTracking(
      userId,
      createHealthTracking,
    );
  }

  // Cập nhật HealthTracking theo ID
  @Put(':id')
  async update(
    @Param('userId') id: string,
    @Body() updateHealthTracking: HealthTracking,
  ): Promise<HealthTracking> {
    return this.healthTrackingService.update(id, updateHealthTracking);
  }

  // Cập nhật SLEEP
  @Put('sleep/:userId')
  async updateSleep(
    @Param('userId') userId: string,
    @Body() sleepData: Sleep,
  ) {
    return this.healthTrackingService.updateSleep(userId, sleepData);
  }

  @Post('update-bodyindex')
  async updateBodyIndex(
    @Req() request: any,
    @Body() bodyIndexData: BodyIndex,
  ): Promise<HealthTracking> {
    const token = request.headers['Authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }
    const username = this.userService.decodeToken(token);
    console.log('Decoded username:', username);
    // Cập nhật BodyIndex với userId
    return this.healthTrackingService.updateBodyIndex(username, bodyIndexData);
  }

  // Xóa HealthTracking theo ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<string> {
    return this.healthTrackingService.remove(id);
  }
}
