import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BodyIndex } from 'src/schema/bodyIndex.schema';
import { HealthTracking, HealthTrackingDocument } from 'src/schema/healthTracking.schema';
import { Sleep } from 'src/schema/sleep.schema';
import { User, UserDocument } from 'src/schema/user.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class HealthTrackingService {
  constructor(
    @InjectModel(HealthTracking.name) private healthTrackingModel: Model<HealthTrackingDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createEmptyHealthTracking(userId: string): Promise<HealthTracking> {
    // Kiểm tra xem userId có tồn tại không
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const healthTracking = await this.healthTrackingModel.create({
      user: userId,
      Day: new Date(), // Ngày hiện tại
      BODYINDEX: { weight: 0, height: 0, bmi: 0 }, // Giá trị mặc định cho BODYINDEX
      SLEEP: { sleepTime: 0, Start: new Date(), End: new Date() }, // Giá trị mặc định cho SLEEP
    });

    return healthTracking;
  }

  // Phương thức tạo mới HealthTracking, sử dụng schema trực tiếp
  async createHealthTracking(username: string, createHealthTrackingData: HealthTracking): Promise<HealthTracking> {
    // Kiểm tra xem userId có tồn tại trong bảng User không
    console.log(username);
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new Error('User not found');
    }

    // Tạo và lưu bản ghi mới cho HealthTracking
    const healthTracking = new this.healthTrackingModel({
      user: user.username,
      Day: createHealthTrackingData.Day.getDate,
      BODYINDEX: createHealthTrackingData.BODYINDEX,
      SLEEP: createHealthTrackingData.SLEEP,
    });

    // Lưu vào cơ sở dữ liệu và trả về bản ghi vừa tạo
    return healthTracking.save();
  }

  async findAll(): Promise<HealthTracking[]> {
    return this.healthTrackingModel.find().exec();
  }

  async findOne(id: string): Promise<HealthTracking> {
    const healthTracking = await this.healthTrackingModel.findById(id).exec();
    if (!healthTracking) {
      throw new Error(`HealthTracking with ID ${id} not found`);
    }
    return healthTracking;
  }

  async update(id: string, updateHealthTrackingData: Partial<HealthTracking>): Promise<HealthTracking> {
    const updatedHealthTracking = await this.healthTrackingModel
      .findByIdAndUpdate(id, updateHealthTrackingData, { new: true })
      .exec();
    if (!updatedHealthTracking) {
      throw new Error(`HealthTracking with ID ${id} not found`);
    }
    return updatedHealthTracking;
  }

  async updateSleep(userId: string, sleepData: Sleep): Promise<HealthTracking> {
    // Kiểm tra xem userId có tồn tại trong bảng User không
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
  
    // Kiểm tra xem user có bản ghi HealthTracking không, nếu không tạo mới
    let healthTracking = await this.healthTrackingModel.findOne({ user: user._id });
    if (!healthTracking) {
      // Tạo mới HealthTracking nếu không tồn tại
      healthTracking = new this.healthTrackingModel({
        user: user._id,
        SLEEP: sleepData,
      });
    } else {
      // Cập nhật SLEEP trong HealthTracking
      healthTracking.SLEEP = sleepData;
    }
  
    // Lưu lại bản ghi cập nhật
    return healthTracking.save();
  }
  
  // Hàm cập nhật BODYINDEX
  async updateBodyIndex(username: string, bodyIndexData: BodyIndex): Promise<HealthTracking> {
    // Tìm User theo username
    console.log(username);
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new BadRequestException(`User with username '${username}' not found`);
    }

    // Tìm bản ghi HealthTracking dựa trên ObjectId của user
    let healthTracking = await this.healthTrackingModel.findOne({ user: user._id });

    if (!healthTracking) {
      healthTracking = await this.healthTrackingModel.create({
        user: user._id,
        Day: new Date(), // Ngày hiện tại
        BODYINDEX: { weight: 0, height: 0, bmi: 0 }, // Giá trị mặc định cho BODYINDEX
        SLEEP: { sleepTime: 0, Start: new Date(), End: new Date() }, // Giá trị mặc định cho SLEEP
      });
    }

    // Cập nhật BODYINDEX
    healthTracking.BODYINDEX = bodyIndexData;

    // Lưu lại bản ghi HealthTracking
    return healthTracking.save();
  }
  

  async remove(id: string): Promise<string> {
    const result = await this.healthTrackingModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new Error(`HealthTracking with ID ${id} not found`);
    }
    return `HealthTracking with ID ${id} has been removed`;
  }
}
