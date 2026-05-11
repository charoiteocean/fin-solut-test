import { TelegramService } from '../../src/telegram/telegram.service';

describe('TelegramService', () => {
  let api: { sendMessage: jest.Mock };
  let service: TelegramService;

  beforeEach(() => {
    api = { sendMessage: jest.fn().mockResolvedValue(undefined) };
    service = new TelegramService(api as any);
  });

  it('formats with bold title and escaped HTML', async () => {
    await service.send({ chatId: '1', title: 'Alert <bad>', message: 'CPU 95% & rising' });

    expect(api.sendMessage).toHaveBeenCalledWith(
      '1',
      '<b>Alert &lt;bad&gt;</b>\n\nCPU 95% &amp; rising',
    );
  });
});
