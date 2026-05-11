import { Injectable } from '@nestjs/common';

import { TelegramApi } from './telegram.api';

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface NotificationPayload {
  chatId: string;
  title: string;
  message: string;
}

@Injectable()
export class TelegramService {
  constructor(private readonly api: TelegramApi) {}

  async send(payload: NotificationPayload): Promise<void> {
    const text = `<b>${escapeHtml(payload.title)}</b>\n\n${escapeHtml(payload.message)}`;
    await this.api.sendMessage(payload.chatId, text);
  }
}
