import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface ValidationError {
  field?: string;
  message: string;
}

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  requestId?: string;

  @ApiPropertyOptional({ type: [Object] })
  errors?: ValidationError[];
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error message' })
  message: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  requestId?: string;

  @ApiPropertyOptional({ type: [Object] })
  errors?: ValidationError[];
}
