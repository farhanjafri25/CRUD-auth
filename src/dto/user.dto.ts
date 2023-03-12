import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsOptional()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  gender: string;
}
