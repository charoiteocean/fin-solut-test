import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Server alert', maxLength: 256 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title!: string;

  @ApiProperty({ example: 'CPU usage 95%', maxLength: 4096 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  message!: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^-?\d+$/, { message: 'chatId must be a numeric string' })
  chatId!: string;
}
