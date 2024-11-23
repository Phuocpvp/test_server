import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schema/user.schema';
import { RegisterDTO } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(register: RegisterDTO) {
    const hashedPassword = await bcrypt.hash(register.password, 10);
    const newUser = new this.userModel({
      ...register,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }
    throw new Error('Invalid credentials');
  }

  generateAccessToken(user: UserDocument) {
    const payload = { username: user.username };
    return this.jwtService.sign(payload, {
      secret: process.env.SECRETKEY,
      expiresIn: '5m',
    });
  }

  generateRefreshToken(user: UserDocument) {
    const payload = { username: user.username };
    return this.jwtService.sign(payload, {
      secret: process.env.REFRESHKEY,
      expiresIn: '30d',
    });
  }

  // Phương thức để xác thực Refresh Token
  async validateRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.REFRESHKEY,
      });
      return await this.userModel.findOne({ username: payload.username });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
