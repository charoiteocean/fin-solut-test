import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Accept a notification request and publish it to the pipeline' })
  @ApiResponse({
    status: 202,
    description: 'Accepted; event published',
    schema: { example: { eventId: '8a1b...c0', status: 'accepted' } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 503, description: 'Broker unavailable' })
  async create(
    @Body() dto: CreateNotificationDto,
  ): Promise<{ eventId: string; status: 'accepted' }> {
    const { eventId } = await this.service.create(dto);
    return { eventId, status: 'accepted' };
  }
}
