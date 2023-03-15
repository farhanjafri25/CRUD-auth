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
import { AppGateway } from './socket/socket.gateway';

@Controller()
@UseInterceptors(AppInterceptor)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appGateWay: AppGateway,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  getHello(@GetCurrentUser() user: any): string {
    console.log(`User -->`, user);
    return this.appService.getHello();
  }
  //save a new user in db and return an accesstoken
  @Post('/save')
  async saveUser(@Body() body: UserDto): Promise<any> {
    try {
      //check if the body has only these valid keys, any keys other than this would result in 400 status code
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
        //save user if keys are valid
        const saveUserObj = await this.appService.saveUser(body);
        if (saveUserObj) {
          //emit message to socket and returns an access token to http request
          this.appGateWay.server.emit('new_user', saveUserObj);
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

  //get all users by pagination
  @Get('/all')
  @UseGuards(AuthGuard())
  async getUsers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<any> {
    try {
      const res = await this.appService.getUsers(+page, +pageSize);
      this.appGateWay.server.emit('resources', res);
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error Fetching Users');
    }
  }
  //get current user data by accesstoken
  @Get('/me')
  @UseGuards(AuthGuard())
  async getUser(@GetCurrentUser('id') userId: string): Promise<any> {
    try {
      const res = await this.appService.getUserFromId(userId);
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error');
    }
  }
  //updates current user based on access token and the updated data passed
  @Post('/update/user')
  @UseGuards(AuthGuard())
  async updateUser(
    @GetCurrentUser('id') userId: string,
    @Body() body: UpdateUserDto,
  ): Promise<any> {
    try {
      body['id'] = userId;
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
          this.appGateWay.server.emit('user_updated', updateUser);
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
  //deletes a user record by its accesstoken
  @Delete()
  @UseGuards(AuthGuard())
  async deleteUser(@GetCurrentUser('id') userId: string) {
    try {
      const res = await this.appService.deleteUser(userId);
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error');
    }
  }
  //generates a new access token by user ID
  @Post('/generateTokens')
  async generateTokens(@Body('id') id: string) {
    try {
      const res = await this.appService.generateTokens(id);
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error generating New Access token');
    }
  }
}
