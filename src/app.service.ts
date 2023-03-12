import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppRepository } from './app.repository';
const cache = require('./config/redis.config');

@Injectable()
export class AppService {
  constructor(
    private readonly appRepository: AppRepository,
    private jwtService: JwtService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async saveUser(body: any): Promise<any> {
    try {
      const saveUser = await this.appRepository.saveUser(body);
      const payload = {
        id: saveUser.id,
        username: saveUser.username,
        email: saveUser.email,
      };
      const accessToken = await this.jwtService.sign(payload);
      payload['gender'] = saveUser.gender;
      payload['age'] = saveUser.age || null;
      await cache.zAdd(`{users_all}`, {
        score: new Date().getTime(),
        value: JSON.stringify(payload),
      });
      return { accessToken: accessToken };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getUsers(page = 1, pageSize = 5): Promise<any> {
    try {
      let res = [];
      const count = await this.appRepository.count();
      const { skip, limit } = this.getPagination(page, pageSize);
      if (page === 1) {
        const data = await cache.ZRANGE_WITHSCORES(`{users_all}`, skip, limit, {
          REV: true,
        });
        console.log(`redis users all Data`, data);
        if (data.length > 0) {
          data.forEach((ele) => {
            res.push(JSON.parse(ele.value));
          });
          return {
            docs: res.length < limit ? res : res.slice(0, res.length - 1),
            nextPage: res.length < limit ? null : +page + 1,
            totalDocs: count,
          };
        }
      }
      const getUsers = await this.appRepository.getAllUsers(skip, limit);
      res = getUsers.map((ele) => ({
        id: ele.id,
        username: ele.username,
        age: ele.age,
        email: ele.email,
        gender: ele.gender,
      }));
      if (page === 1) {
        res.forEach(async (ele) => {
          await cache.zAdd(`{users_all}`, {
            score: new Date().getTime(),
            value: JSON.stringify(ele),
          });
        });
        await cache.expire(`{users_all}`, 600);
      }
      return {
        docs: res.length < limit ? res : res.slice(0, res.length - 1),
        nextPage: res.length < limit ? null : +page + 1,
        totalDocs: count,
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }
  async getUserFromId(id: string): Promise<any> {
    try {
      const data = await cache.get(`{user_backend}:${id}`);
      if (data) {
        return JSON.parse(data);
      }
      const userObj = await this.appRepository.getUserById(id);
      const setCache = await cache.set(
        `{user_backend}:${userObj.id}`,
        JSON.stringify(userObj),
      );
      await cache.expire(`{user_backend}:${userObj.id}`, 600);
      console.log(`Cache set`, setCache);
      return userObj;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error Getting User');
    }
  }
  async updateUser(body: any): Promise<any> {
    try {
      const userObj = await this.getUserFromId(body.id);
      const updateUserObj = { ...userObj };
      updateUserObj['username'] = body.userName ?? userObj.username;
      updateUserObj['email'] = body.email ?? userObj.email;
      updateUserObj['age'] = body.age ?? userObj.age;
      updateUserObj['gender'] = body.gender ?? userObj.gender;
      console.log(`updated obj`, updateUserObj);
      const saveUpadatedUser = await this.appRepository.updateUser(
        updateUserObj,
      );
      return saveUpadatedUser;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async deleteUser(id: string) {
    try {
      const deleteUser = await this.appRepository.delete(id);
      return deleteUser;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error');
    }
  }
  public getPagination(page: number, pageSize: number) {
    if (!page) page = 1;
    if (!pageSize) pageSize = 5;
    page = page - 1;
    const skip = page <= 0 ? 0 : page * pageSize;
    const limit = +(Number.isNaN(pageSize) ? 30 : pageSize);
    return {
      skip,
      limit,
      page: page + 1,
    };
  }
}
