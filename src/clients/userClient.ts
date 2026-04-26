import axios from 'axios';
import { config } from '../config';

interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  [key: string]: unknown;
}

export interface MemberInfo {
  email: string;
  firstName: string;
  lastName: string;
}

export class UserLookupError extends Error {
  constructor(memberId: string, cause?: unknown) {
    super(`Failed to look up user ${memberId}`);
    this.name = 'UserLookupError';
    if (cause) this.cause = cause;
  }
}

const client = axios.create({
  baseURL: config.USER_SERVICE_URL,
  timeout: 5_000,
});

export async function getUserById(memberId: string): Promise<MemberInfo> {
  try {
    const { data } = await client.get<UserResponse>(`/users/${memberId}`);
    return { email: data.email, firstName: data.first_name, lastName: data.last_name };
  } catch (err) {
    throw new UserLookupError(memberId, err);
  }
}
