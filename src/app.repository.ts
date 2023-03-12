import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserSchema } from './model/user.model';
import { User } from './model/user.model';
import { Model } from 'mongoose';

@Injectable()
export class AppRepository {
  constructor(
    @InjectModel('users_data') private readonly userModel: Model<User>,
  ) {}

  async saveUser(body: any) {
    try {
      const userObj = new this.userModel({
        username: body.userName,
        age: body.age ?? null,
        email: body.email,
        gender: body.gender,
      });
      const result = await userObj.save();
      console.log(`Response from Db Saved`, result);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getAllUsers(skip: number, limit: number) {
    try {
      console.log(`skip`, skip, `limit`, limit);
      const res = await this.userModel.find({}, null, {
        skip: skip,
        limit: limit,
      });
      console.log(`Users Array`, res);
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error');
    }
  }
  async getUserById(id: string) {
    try {
      const res = await this.userModel.findById(id);
      console.log(`User Object`, res);
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error getting User');
    }
  }
  async updateUser(body: any) {
    try {
      const res = await this.userModel.findByIdAndUpdate(
        { _id: body.id ?? body._id },
        {
          username: body.username,
          age: body.age,
          email: body.email,
          gender: body.gender,
        },
        { new: true },
      );
      console.log(`updated response`, res);
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async delete(userId: string) {
    try {
      const res = await this.userModel.deleteOne({ id: userId });
      return res;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Unable to initiate Delete');
    }
  }
  async count(): Promise<any> {
    return await this.userModel.count();
  }
}
