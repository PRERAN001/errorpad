import User from '../model/usermodel.js';
import { verifyPassword } from '../utils/password.js';

export const getPadByName = async (padName) => {
  if (!padName) return null;
  return User.findOne({ userquery: padName });
};

export const hasPadAccess = (pad, password = '') => {
  if (!pad) return false;
  if (!pad.isProtected) return true;
  return verifyPassword(password, pad.passwordHash);
};

export const requirePadAccess = async (padName, password = '') => {
  const pad = await getPadByName(padName);

  if (!pad) {
    return {
      ok: false,
      status: 404,
      message: 'Pad not found',
      pad: null,
    };
  }

  if (!hasPadAccess(pad, password)) {
    return {
      ok: false,
      status: 403,
      message: 'Protected pad. Invalid password.',
      pad,
    };
  }

  return {
    ok: true,
    status: 200,
    message: 'ok',
    pad,
  };
};
