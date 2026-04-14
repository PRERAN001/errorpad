import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    padName: {
      type: String,
      default: '',
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storedName: {
      type: String,
      required: true,
      unique: true,
    },
    storageProvider: {
      type: String,
      enum: ['local', 'supabase'],
      default: 'local',
    },
    storagePath: {
      type: String,
      default: '',
      index: true,
    },
    storagePublicUrl: {
      type: String,
      default: '',
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
    },
    size: {
      type: Number,
      default: 0,
    },
    filePath: {
      type: String,
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const FileAsset = mongoose.model('FileAsset', fileSchema);

export default FileAsset;
