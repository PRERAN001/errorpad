import fs from 'fs';
import path from 'path';

import FileAsset from '../models/filemodel.js';
import { upload } from '../config/multer.js';
import { hasPadAccess, requirePadAccess } from '../services/padAccess.js';
import {
  createSupabaseSignedDownloadUrl,
  deleteSupabaseObject,
  getSupabaseStorageStatus,
  isSupabaseStorageConfigured,
  uploadFileToSupabaseStorage,
} from '../services/supabaseStorageService.js';
import User from '../model/usermodel.js';

const getPassword = (req) => req.body?.password || req.query?.password || '';
const normalizePadName = (value) => String(value || '').trim();

const fileDownloadName = (file) => encodeURIComponent(file.originalName || 'download');

export const uploadMiddleware = upload;

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const padName = normalizePadName(req.body?.padName || req.body?.folderId || req.query?.padName || req.query?.folderId);
    const password = String(getPassword(req));

    if (padName) {
      const pad = await User.findOne({ userquery: padName });
      if (!pad) {
        return res.status(404).json({ message: 'Pad not found' });
      }
      if (pad.isProtected && !hasPadAccess(pad, password)) {
        return res.status(403).json({ message: 'Protected pad. Invalid password.' });
      }
    }

    const supabaseEnabled = isSupabaseStorageConfigured();
    const storageStatus = getSupabaseStorageStatus();

    let storageProvider = 'local';
    let storagePath = '';
    let storagePublicUrl = '';
    let filePath = req.file.path;

    if (supabaseEnabled) {
      const uploadResult = await uploadFileToSupabaseStorage({
        localFilePath: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        padName,
        storedName: req.file.filename,
      });

      storageProvider = 'supabase';
      storagePath = uploadResult.objectPath;
      storagePublicUrl = uploadResult.publicUrl;
      filePath = '';

      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const asset = await FileAsset.create({
      padName,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      storageProvider,
      storagePath,
      storagePublicUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filePath,
    });

    return res.status(201).json({
      fileId: asset._id,
      originalName: asset.originalName,
      padName: asset.padName,
      size: asset.size,
      storageProvider: asset.storageProvider,
      storagePublicUrl: asset.storagePublicUrl,
      storageStatus,
      warning: supabaseEnabled
        ? undefined
        : 'Supabase storage is not configured; file was saved locally.',
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

export const listFiles = async (req, res) => {
  const padName = normalizePadName(req.params.padName || req.params.folderId);
  const password = String(getPassword(req));

  try {
    if (padName) {
      const access = await requirePadAccess(padName, password);
      if (!access.ok) {
        return res.status(access.status).json({ message: access.message });
      }
    }

    const files = await FileAsset.find({ padName }).sort({ uploadedAt: -1 });

    return res.status(200).json(
      files.map((file) => ({
        fileId: file._id,
        originalName: file.originalName,
        storageProvider: file.storageProvider,
        storagePublicUrl: file.storagePublicUrl,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.uploadedAt,
        padName: file.padName,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
};

export const downloadFile = async (req, res) => {
  const fileId = req.params.fileId;
  const password = String(getPassword(req));

  try {
    const asset = await FileAsset.findById(fileId);

    if (!asset) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (asset.padName) {
      const access = await requirePadAccess(asset.padName, password);
      if (!access.ok) {
        return res.status(access.status).json({ message: access.message });
      }
    }

    res.setHeader('Content-Type', asset.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileDownloadName(asset)}"`);

    if (asset.storageProvider === 'supabase' && asset.storagePath) {
      const signedUrl = await createSupabaseSignedDownloadUrl({
        objectPath: asset.storagePath,
        originalName: asset.originalName,
      });
      return res.redirect(signedUrl);
    }

    if (!asset.filePath || !fs.existsSync(asset.filePath)) {
      return res.status(404).json({ message: 'File is missing from storage' });
    }

    return res.sendFile(path.resolve(asset.filePath));
  } catch (error) {
    return res.status(500).json({ message: 'Download failed', error: error.message });
  }
};

export const removeFile = async (req, res) => {
  const fileId = req.params.fileId;
  const password = String(getPassword(req));

  try {
    const asset = await FileAsset.findById(fileId);

    if (!asset) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (asset.padName) {
      const access = await requirePadAccess(asset.padName, password);
      if (!access.ok) {
        return res.status(access.status).json({ message: access.message });
      }
    }

    if (asset.storageProvider === 'supabase' && asset.storagePath) {
      await deleteSupabaseObject(asset.storagePath);
    } else if (asset.filePath && fs.existsSync(asset.filePath)) {
      fs.unlinkSync(asset.filePath);
    }

    await asset.deleteOne();

    return res.status(200).json({ message: 'File deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

export const legacyUploadHandler = upload.single('file');

export const legacyUpload = async (req, res) => {
  req.body = req.body || {};
  return uploadFile(req, res);
};

export const legacyListFiles = async (req, res) => {
  req.params.padName = req.params.folderId;
  return listFiles(req, res);
};
