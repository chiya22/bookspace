import { getServerSession } from 'next-auth';
import { authOptions } from './options';

export { authOptions };

export async function getSession() {
  return getServerSession(authOptions);
}
