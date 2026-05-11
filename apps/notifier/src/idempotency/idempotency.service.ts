import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessedEvent } from './entities/processed-event.entity';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(ProcessedEvent)
    private readonly repo: Repository<ProcessedEvent>,
  ) {}

  async isProcessed(eventId: string): Promise<boolean> {
    const found = await this.repo.findOne({ where: { eventId } });
    return found !== null;
  }

  async markProcessed(eventId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(ProcessedEvent)
      .values({ eventId })
      .orIgnore()
      .execute();
  }
}
