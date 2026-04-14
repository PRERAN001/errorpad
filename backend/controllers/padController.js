import User from '../model/usermodel.js';
import { hashPassword } from '../utils/password.js';
import { hasPadAccess, requirePadAccess } from '../services/padAccess.js';

const getPassword = (req) => req.body?.password || req.query?.password || '';
const normalizeContent = (value) => {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return '';
  return JSON.stringify(value);
};

export const getPadMeta = async (req, res) => {
  const padName = req.params.padName || req.params.userquery;

  try {
    const pad = await User.findOne({ userquery: padName });

    if (!pad) {
      return res.status(200).json({
        exists: false,
        isProtected: false,
        hasContent: false,
      });
    }

    const hasContent = Boolean(pad.usercontext && pad.usercontext.trim().length > 0);

    return res.status(200).json({
      exists: true,
      isProtected: Boolean(pad.isProtected),
      hasContent,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createPad = async (req, res) => {
  const padName = req.params.padName || req.params.userquery;
  console.log(padName)
  const { protect = false, password = '' } = req.body || {};

  try {
    const existingPad = await User.findOne({ userquery: padName });

    if (existingPad) {
      const hasContent = Boolean(existingPad.usercontext && existingPad.usercontext.trim().length > 0);
      return res.status(200).json({
        created: false,
        exists: true,
        isProtected: Boolean(existingPad.isProtected),
        hasContent,
      });
    }
    console.log("existing paddd",existingPad)

    if (protect && !String(password).trim()) {
      return res.status(400).json({ message: 'Password required for protected pad' });
    }

    const createdPad = await User.create({
      userquery: padName,
      usercontext: '',
      isProtected: Boolean(protect),
      passwordHash: protect ? hashPassword(String(password)) : '',
    });

    return res.status(201).json({
      created: true,
      exists: true,
      isProtected: Boolean(createdPad.isProtected),
      hasContent: false,
    });
  } catch (error) {
    console.log("errpr",error)
    return res.status(500).json({ error: error.message });
  }
};

export const verifyPad = async (req, res) => {
  const padName = req.params.padName || req.params.userquery;
  const password = String(req.body?.password || '');

  try {
    const pad = await User.findOne({ userquery: padName });

    if (!pad) {
      return res.status(404).json({ message: 'Pad not found' });
    }

    if (!pad.isProtected) {
      return res.status(200).json({ ok: true });
    }

    const access = hasPadAccess(pad, password);
    if (!access) {
      return res.status(401).json({ ok: false, message: 'Invalid password' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    
    return res.status(500).json({ error: error.message });
  }
};

export const getPad = async (req, res) => {
  const padName = req.params.padName || req.params.userquery;
  const password = String(getPassword(req));

  try {
    const access = await requirePadAccess(padName, password);

    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const pad = access.pad;

    return res.status(200).json({
      userquery: pad.userquery,
      usercontext: pad.usercontext,
      isProtected: Boolean(pad.isProtected),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPadText = async (req, res) => {
  const padName = req.params.padName || req.params.userquery;
  const password = String(getPassword(req));

  try {
    const access = await requirePadAccess(padName, password);

    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const formattedContent = access.pad.usercontext.replace(/\\n/g, '\n');
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(formattedContent);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// v1 legacy route variant: intentionally skips password verification
export const getPadTextV1 = async (req, res) => {
  const padName = req.params.padName || req.params.userquery;

  try {
    const pad = await User.findOne({ userquery: padName });
    if (!pad) {
      return res.status(404).json({ message: 'Pad not found' });
    }

    const formattedContent = pad.usercontext.replace(/\\n/g, '\n');
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(formattedContent);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const savePad = async (req, res) => {
  const padName = req.params.padName || req.params.userquery;
  const password = String(getPassword(req));
  const usercontext = normalizeContent(req.body?.usercontext ?? req.body);

  try {
    const existingPad = await User.findOne({ userquery: padName });

    if (existingPad && existingPad.isProtected && !hasPadAccess(existingPad, password)) {
      return res.status(403).json({ message: 'Protected pad. Invalid password.' });
    }

    await User.findOneAndUpdate(
      { userquery: padName },
      { usercontext },
      { new: true, upsert: true }
    );

    return res.status(201).json({ message: 'done enjoy !! (updated)' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// v1 legacy route variant: intentionally skips password verification
export const savePadV1 = async (req, res) => {
  const padName = req.params.padName || req.params.userquery;
  const usercontext = normalizeContent(req.body?.usercontext ?? req.body);

  try {
    await User.findOneAndUpdate(
      { userquery: padName },
      { usercontext },
      { new: true, upsert: true }
    );

    return res.status(201).json({ message: 'done enjoy !! (updated)' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
