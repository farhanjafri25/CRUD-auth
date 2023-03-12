import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  age: { type: Number, required: false },
  email: { type: String, required: true },
  gender: { type: String, required: false },
});

export interface User {
  id: string;
  username: string;
  age: number;
  email: string;
  gender: string;
}
