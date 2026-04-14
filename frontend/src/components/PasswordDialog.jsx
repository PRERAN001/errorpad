const PasswordDialog = ({
  open,
  title,
  description,
  submitLabel = 'Continue',
  cancelLabel = 'Cancel',
  loading = false,
  error = '',
  placeholder = 'Enter password',
  onSubmit,
  onCancel,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') || '');
    onSubmit(password);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/50">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Protected pad</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          {description ? <p className="mt-2 text-sm text-neutral-400">{description}</p> : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">Password</label>
            <input
              name="password"
              type="password"
              autoFocus
              placeholder={placeholder}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Checking...' : submitLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {cancelLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordDialog;
