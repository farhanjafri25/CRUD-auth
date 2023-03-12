import { Controller, Get } from '@nestjs/common';
import { AppService } from '../app.service';
import { AppGateway } from './socket.gateway';

@Controller()
export class SocketController {
  constructor(
    private readonly appService: AppService,
    private readonly appGateway: AppGateway,
  ) {}

  @Get('/socket')
  async findAll() {
    // Fetch all resources from the database
    const resources = await this.appService.getUsers();
    // Emit the resources to all users in the same room
    this.appGateway.server.emit('resources', resources);

    return resources;
  }
}
