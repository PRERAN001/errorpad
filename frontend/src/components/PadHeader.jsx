const PadHeader = ({
  padName,
  isProtected,
  isConnected,
  saveState,
  onCopyLink,
}) => {
  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">ErrorPad</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{padName}</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            A focused collaborative pad with password protection, autosave, uploads, and downloads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-neutral-300">
            {isConnected ? 'Live sync' : 'Offline'}
          </span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-neutral-300">
            {isProtected ? 'Protected' : 'Open'}
          </span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-neutral-300">
            {saveState}
          </span>
          <button
            type="button"
            onClick={onCopyLink}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-neutral-200"
          >
            Copy link
          </button>
        </div>
      </div>
    </header>
  );
};

export default PadHeader;
