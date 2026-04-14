import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let initialized = false;
let statusCache = {
  configured: false,
  reason: 'not-initialized',
};

const getSupabaseUrl = () => String(process.env.SUPABASE_URL || '').trim();
const getSupabaseServiceRoleKey = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const getSupabaseBucket = () => String(process.env.SUPABASE_STORAGE_BUCKET || '').trim();

const shouldPublicRead = () => String(process.env.SUPABASE_PUBLIC_READ || 'false').toLowerCase() === 'true';

const initSupabaseClient = () => {
  if (initialized) return;
  initialized = true;

  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  const bucket = getSupabaseBucket();

  if (!url) {
    statusCache = { configured: false, reason: 'missing-supabase-url' };
    return;
  }

  if (!key) {
    statusCache = { configured: false, reason: 'missing-supabase-service-role-key' };
    return;
  }

  if (!bucket) {
    statusCache = { configured: false, reason: 'missing-supabase-storage-bucket' };
    return;
  }

  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  statusCache = { configured: true, reason: 'configured' };
};

const assertConfigured = () => {
  initSupabaseClient();

  if (!supabaseClient) {
    throw new Error(`Supabase storage is not configured: ${statusCache.reason}`);
  }
};

export const isSupabaseStorageConfigured = () => {
  initSupabaseClient();
  return Boolean(supabaseClient);
};

export const getSupabaseStorageStatus = () => {
  initSupabaseClient();
  return {
    configured: Boolean(supabaseClient),
    reason: statusCache.reason,
    bucketSet: Boolean(getSupabaseBucket()),
    publicRead: shouldPublicRead(),
  };
};

const buildObjectPath = ({ padName, storedName, originalName }) => {
  const safePad = String(padName || 'global').replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeOriginal = path.basename(String(originalName || 'file')).replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${safePad}/${storedName}-${safeOriginal}`;
};

export const uploadFileToSupabaseStorage = async ({ localFilePath, originalName, mimeType, padName = '', storedName }) => {
  assertConfigured();

  if (!localFilePath || !fs.existsSync(localFilePath)) {
    throw new Error(`Temporary upload file not found: ${localFilePath}`);
  }

  const buffer = await fs.promises.readFile(localFilePath);
  const objectPath = buildObjectPath({ padName, storedName, originalName });

  const { error } = await supabaseClient.storage
    .from(getSupabaseBucket())
    .upload(objectPath, buffer, {
      contentType: mimeType || 'application/octet-stream',
      upsert: false,
      cacheControl: '3600',
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const publicRead = shouldPublicRead();
  const publicUrl = publicRead
    ? supabaseClient.storage.from(getSupabaseBucket()).getPublicUrl(objectPath).data.publicUrl
    : '';

  return {
    objectPath,
    publicUrl,
  };
};

export const createSupabaseSignedDownloadUrl = async ({ objectPath, originalName }) => {
  assertConfigured();

  const { data, error } = await supabaseClient.storage
    .from(getSupabaseBucket())
    .createSignedUrl(objectPath, 60, {
      download: originalName || true,
    });

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Failed to create signed download URL');
  }

  return data.signedUrl;
};

export const deleteSupabaseObject = async (objectPath) => {
  assertConfigured();

  const { error } = await supabaseClient.storage
    .from(getSupabaseBucket())
    .remove([objectPath]);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
};
