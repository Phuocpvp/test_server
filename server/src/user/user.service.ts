import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  // Cập nhật thông tin người dùng
  async updateUser(
    userId: string,
    updateData: { avatar?: string; username?: string; email?: string },
  ): Promise<User> {
    return await this.userModel.findByIdAndUpdate(
      userId,
      updateData, // Cập nhật dữ liệu với avatar URL nếu có
      { new: true }, // Trả về người dùng đã được cập nhật
    );
  }

  calculateProfileCompletion(user: User): number {
    // Lấy danh sách các thuộc tính từ schema của User
    const userSchemaPaths = this.userModel.schema.paths;
    // Bỏ qua các thuộc tính không cần thiết như '_id', '__v', 'IsDelete', etc.
    const excludedFields = ['_id', '__v', 'IsDelete', 'username', 'password'];
    const requiredFields = Object.keys(userSchemaPaths).filter(
      (field) => !excludedFields.includes(field),
    );
    // Đếm số thuộc tính đã được điền
    let filledFields = 0;
    for (const field of requiredFields) {
      if (
        user[field] !== null &&
        user[field] !== undefined &&
        user[field] !== ''
      ) {
        filledFields++;
      }
    }
    // Tính toán phần trăm hoàn thành
    const completionPercentage = (filledFields / requiredFields.length) * 100;

    return completionPercentage;
  }
  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  async getUserProfile(userId: string): Promise<User> {
    return await this.userModel.findById(userId).select('-password -_id -__v');
  }
  async updateUserAvatar(userId: string, avatarUrl: string) {
    if (!avatarUrl) {
      avatarUrl = ''; // Hoặc bạn có thể để null nếu không có ảnh
    }
    return this.userModel.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true },
    );
  }

  // Hàm này giải mã token và trả về userId
  decodeToken(token: string): string {
    try {
      const decodedToken: any = jwt.verify(token, process.env.SECRETKEY);
      console.log(token);
      console.log(process.env.SECRETKEY);
      return decodedToken.username; // Giả sử userId được lưu trong payload
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
