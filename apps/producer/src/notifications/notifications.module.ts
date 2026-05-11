import { Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsPublisher } from './publishers/notifications.publisher';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsPublisher],
})
export class NotificationsModule {}
