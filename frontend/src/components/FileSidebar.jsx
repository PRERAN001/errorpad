import { useRef } from 'react';
import { buildPadDownloadUrl } from '../services/padApi.js';
import { formatBytes } from '../utils/formatBytes.js';

const FileSidebar = ({
  padName,
  files = [],
  password = '',
  protectedPad = false,
  uploadBusy = false,
  onUpload,
  onRefresh,
}) => {
  const fileInputRef = useRef(null);

  const handlePickFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onUpload(file);
    event.target.value = '';
  };

  return (
    <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Files</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Uploads & downloads</h3>
          <p className="mt-1 text-sm text-neutral-400">
            {protectedPad
              ? 'Protected pads require the same password for downloads.'
              : 'Attach files to the pad and download them anytime.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-black/30 p-4">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handlePickFile} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadBusy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadBusy ? 'Uploading...' : 'Upload file'}
        </button>
        <p className="mt-3 text-xs leading-5 text-neutral-500">
          Files upload to this pad, and downloads respect pad protection.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {files.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-neutral-400">
            No files yet. Drop your first attachment and make the pad even more useful.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.fileId}
              className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-black/35"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{file.originalName}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatBytes(file.size)} • {file.mimeType || 'unknown type'}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  File
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={buildPadDownloadUrl(padName, file.fileId, password)}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/25"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(buildPadDownloadUrl(padName, file.fileId, password))}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-white/10"
                >
                  Copy link
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default FileSidebar;
