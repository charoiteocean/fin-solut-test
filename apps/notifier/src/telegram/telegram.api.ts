import { Injectable } from '@nestjs/common';
import { Api } from 'grammy';

export interface TelegramApiConfig {
  botToken: string;
  apiRoot: string;
}

@Injectable()
export class TelegramApi {
  private readonly api: Api;

  constructor(config: TelegramApiConfig) {
    this.api = new Api(config.botToken, { apiRoot: config.apiRoot });
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    await this.api.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  }
}
