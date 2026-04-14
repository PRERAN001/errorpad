import crypto from 'crypto';

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  if (!storedHash || !password) return false;

  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const candidateHash = crypto.scryptSync(password, salt, 64).toString('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(candidateHash, 'hex')
    );
  } catch {
    return false;
  }
};
