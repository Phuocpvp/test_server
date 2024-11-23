import { Controller, Post, Get, Param, Body, Query, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { Answer } from '../schema/answer.schema';
import { JwtAuthGuard } from '../configuration/jwt-auth.guard'; 

@Controller('answer')
export class AnswerController {
  constructor(private readonly AnswerService: AnswerService) {}

  // Tạo câu trả lời mới
  @UseGuards(JwtAuthGuard) // Bảo vệ bằng Guard
  @Post()
  async create(@Req() req, @Body() answerData: Omit<Answer, 'userID'>) {
    const userID = req.user.id; // Lấy user ID từ request sau khi xác thực
    return this.AnswerService.createAnswer({ ...answerData, userID }); // Thêm userID vào dữ liệu trả lời
  }

  // Lấy tất cả câu trả lời
  @Get()
  async getAll() {
    return this.AnswerService.getAllAnswers();
  }

  // Lấy câu trả lời dựa trên 3 ID: userId, diseaseId, questionId
  @Get('by-ids')
  async getByUserDiseaseQuestion(
    @Query('userID') userID: string,
    @Query('diseaseID') diseaseID: string,
    @Query('questionID') questionID: string,
  ) {
    return this.AnswerService.getAnswerByIds(userID, diseaseID, questionID);
  }

  @Put('update')
   async update(
   @Query('userID') userID: string,
   @Query('diseaseID') diseaseID: string,
   @Query('questionID') questionID: string,
   @Body() updateData: Partial<Answer>
   ) {
   return this.AnswerService.updateAnswer(userID, diseaseID, questionID, updateData);
   }

   @Delete('delete')
   async delete(
   @Query('userID') userID: string,
   @Query('diseaseID') diseaseID: string,
   @Query('questionID') questionID: string
   ) {
   return this.AnswerService.deleteAnswer(userID, diseaseID, questionID);
   }

   @Get('check')
   async isAnswered(
     @Query('userID') userID: string,
     @Query('diseaseID') diseaseID: string,
     @Query('questionID') questionID: string,
   ) {
     const isAnswered = await this.AnswerService.checkAnswer(userID, diseaseID, questionID);
     return { answered: isAnswered };
   }
}
