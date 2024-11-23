import {
   Body,
   Controller,
   Get,
   Param,
   Put,
   Req,
   UseGuards,
   Post,
   UploadedFile,
   UseInterceptors,
   Res
} from '@nestjs/common';
import { User } from '../schema/user.schema';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/configuration/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Get()
   async getAllUsers(): Promise<User[]> {
      return this.userService.findAll();
   }

   @Get('profile-completion/:id')
   async getProfileCompletion(@Param('id') id: string) {
      const user = await this.userService.findById(id);
      if (!user) {
         return { message: 'User not found' };
      }
      const completion =
         await this.userService.calculateProfileCompletion(user);
      return { completion };
   }

   @Get('profile-completion')
   async getProfileCompletionbytoken(@Req() req) {
      const user = req.user; // user đã được lấy từ `token` thông qua JwtAuthGuard
      const completion =
         await this.userService.calculateProfileCompletion(user);
      return { completion };
   }

   @Get('profile')
   async getProfile(@Req() req: Request) {
      // Lấy user từ request đã được giải mã thông qua JWT Guard
      const user: any = req.user;
      return await this.userService.getUserProfile(user.id);
   }

   @Put('update')
   @UseInterceptors(
     FileInterceptor('avatar', {
       storage: diskStorage({
         destination: './uploads/avatars',  // Đường dẫn lưu ảnh
         filename: (req, file, callback) => {
           const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
           const ext = path.extname(file.originalname);
           const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
           callback(null, filename);
         },
       }),
       fileFilter: (req, file, callback) => {
         // Chỉ cho phép ảnh có định dạng jpg, jpeg, hoặc png
         if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
           return callback(new Error('File format is not supported'), false);
         }
         callback(null, true);
       },
     }),
   )
   async updateProfile(
     @Req() req: Request,
     @Body() updateData: Partial<User>, // Dữ liệu update người dùng
     @UploadedFile() file: Express.Multer.File, // File ảnh đại diện (nếu có)
     @Res() res,
   ) {
     const userId = req.user['id'];

     // Nếu có ảnh đại diện, lưu đường dẫn ảnh vào thông tin người dùng
     if (file) {
       const avatarUrl = `/uploads/avatars/${file.filename}`;
       updateData.avatar = avatarUrl;
     } else {
       // Nếu không có ảnh, không thay đổi trường avatar
       delete updateData.avatar;  // Xóa avatar khỏi updateData nếu không có ảnh
     }

     // Cập nhật thông tin người dùng
     const updatedUser = await this.userService.updateUser(userId, updateData);

     return res.status(200).json({
       message: 'Cập nhật thông tin thành công!',
       updatedUser,
     });
   }
}
