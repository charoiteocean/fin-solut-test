import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateNotificationDto } from '../../src/notifications/dto/create-notification.dto';

describe('CreateNotificationDto', () => {
  const validate = (raw: unknown) => {
    const dto = plainToInstance(CreateNotificationDto, raw);
    return validateSync(dto);
  };

  it('passes for valid payload', () => {
    const errors = validate({ title: 'Alert', message: 'CPU 95%', chatId: '123456' });
    expect(errors).toHaveLength(0);
  });

  it('rejects empty title', () => {
    const errors = validate({ title: '', message: 'm', chatId: '1' });
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('rejects message over 4096 chars', () => {
    const errors = validate({ title: 't', message: 'x'.repeat(4097), chatId: '1' });
    expect(errors.some((e) => e.property === 'message')).toBe(true);
  });

  it('rejects non-numeric chatId', () => {
    const errors = validate({ title: 't', message: 'm', chatId: 'abc' });
    expect(errors.some((e) => e.property === 'chatId')).toBe(true);
  });

  it('accepts negative chatId (group chat)', () => {
    const errors = validate({ title: 't', message: 'm', chatId: '-100123' });
    expect(errors).toHaveLength(0);
  });
});
