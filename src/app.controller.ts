import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppInterceptor } from './app.interceptor';
import { AppService } from './app.service';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetCurrentUser } from './decorators/currentUser.decorator';

@Controller()
@UseInterceptors(AppInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(AuthGuard())
  getHello(@GetCurrentUser() user: any): string {
    console.log(`User -->`, user);
    return this.appService.getHello();
  }
  @Post('/save')
  async saveUser(@Body() body: UserDto): Promise<any> {
    try {
      const validUserKeys = ['userName', 'age', 'email', 'gender'];
      const isValidUserObj = Object.keys(body).every((key) =>
        validUserKeys.includes(key),
      );
      if (!isValidUserObj) {
        throw new BadRequestException('Something Went Wrong');
      }
      if (body['userName']) {
        if (!body['userName'].match(/^[0-9a-zA-Z]+$/)) {
          throw new BadRequestException(
            'Username must not contain special characters',
          );
        }
        if (!body['email'].match(/\S+@\S+\.\S+/)) {
          throw new BadRequestException('Invalid Email');
        }
        if (body?.userName && body?.userName.length < 5)
          throw new BadRequestException(
            'Please enter username greater than 5 characters',
          );
        const saveUserObj = await this.appService.saveUser(body);
        if (saveUserObj) {
          return saveUserObj;
        } else {
          throw new BadRequestException('Something Went Wrong');
        }
      } else {
        throw new BadRequestException('Username Cannot be Empty');
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error');
    }
  }

  @Get('/all')
  @UseGuards(AuthGuard())
  async getUsers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    try {
      const res = await this.appService.getUsers(+page, +pageSize);
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error Fetching Users');
    }
  }
  @Get('/me')
  @UseGuards(AuthGuard())
  async getUser(
    @GetCurrentUser('id') userId: string,
    @Query('id') id: string,
  ): Promise<any> {
    try {
      if (userId !== id) return { code: 401, message: 'Unauthorized' };
      const res = await this.appService.getUserFromId(id);
      return {
        id: res.id ?? res._id,
        username: res.username,
        age: res.age,
        email: res.email,
        gender: res.gender,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error');
    }
  }
  @Post('/update/user')
  @UseGuards(AuthGuard())
  async updateUser(
    @GetCurrentUser('id') userId: string,
    @Body() body: UpdateUserDto,
  ): Promise<any> {
    try {
      if (userId !== body.id) return { code: 401, message: 'Unauthorized' };
      const validUserKeys = ['id', 'userName', 'age', 'email', 'gender'];
      const isValidUserObj = Object.keys(body).every((key) =>
        validUserKeys.includes(key),
      );
      if (!isValidUserObj) {
        throw new BadRequestException('Something Went Wrong');
      }
      if (body['userName']) {
        if (!body['userName'].match(/^[0-9a-zA-Z]+$/)) {
          throw new BadRequestException(
            'Username must not contain special characters',
          );
        }
        if (body?.userName && body?.userName.length < 5)
          throw new BadRequestException(
            'Please enter username greater than 5 characters',
          );
        const updateUser = await this.appService.updateUser(body);
        if (updateUser) {
          return updateUser;
        }
        throw new BadRequestException('Unable to update User');
      } else {
        throw new BadRequestException('Username Cannot be Empty');
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something went wrong');
    }
  }
  @Delete()
  @UseGuards(AuthGuard())
  async deleteUser(
    @GetCurrentUser('id') userId: string,
    @Query('id') id: string,
  ) {
    try {
      if (userId !== id) return { code: 401, message: 'Unauthorized' };
      const res = await this.appService.deleteUser(id);
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error');
    }
  }
}