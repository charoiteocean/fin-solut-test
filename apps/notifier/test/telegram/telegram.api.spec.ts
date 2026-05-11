import { TelegramApi } from '../../src/telegram/telegram.api';

const sendMessageMock = jest.fn();

jest.mock('grammy', () => ({
  Api: jest.fn().mockImplementation(() => ({
    sendMessage: sendMessageMock,
  })),
}));

describe('TelegramApi', () => {
  beforeEach(() => sendMessageMock.mockReset());

  it('passes chatId, text, parse_mode HTML, link preview disabled', async () => {
    sendMessageMock.mockResolvedValue({ message_id: 42 });
    const api = new TelegramApi({ botToken: 't', apiRoot: 'http://mock:1080' });

    await api.sendMessage('123', '<b>hi</b>');

    expect(sendMessageMock).toHaveBeenCalledWith('123', '<b>hi</b>', {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  });

  it('rethrows grammy errors', async () => {
    sendMessageMock.mockRejectedValue(new Error('429 Too Many Requests'));
    const api = new TelegramApi({ botToken: 't', apiRoot: 'http://mock:1080' });

    await expect(api.sendMessage('1', 'x')).rejects.toThrow(/429/);
  });
});
