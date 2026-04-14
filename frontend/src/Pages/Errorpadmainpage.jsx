import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextProvider } from "../context/Textcontext.jsx";
import PasswordDialog from "../components/PasswordDialog.jsx";
import { createPad, fetchPadMeta, verifyPad } from "../services/padApi.js";

export default function Errorpadmainpage() {
  const navigate = useNavigate();
  const { query, setQuery } = useContext(TextProvider);
  const [protectPad, setProtectPad] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [unlockPadName, setUnlockPadName] = useState("");
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const cleanedQuery = useMemo(() => query.trim(), [query]);

  const send = async (e) => {
    e.preventDefault();
    const padName = cleanedQuery;
    if (!padName) return;
    setError("");
    setIsSubmitting(true);

    try {
      const metaRes = await fetchPadMeta(padName);
      const { exists, isProtected } = metaRes.data;

      if (!exists) {
        if (protectPad && !password.trim()) {
          setError("Please choose a password for the protected pad.");
          setIsSubmitting(false);
          return;
        }

        await createPad(padName, {
          protect: protectPad,
          password,
        });

        navigate(`/${padName}`, {
          state: { padPassword: protectPad ? password : "" },
        });
        return;
      }

      if (isProtected) {
        setUnlockPadName(padName);
        setUnlockError("");
        setUnlockOpen(true);
        return;
      }

      navigate(`/${padName}`);
    } catch {
      setError("Unable to open this pad. Please check the pad name and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlock = async (enteredPassword) => {
    if (!unlockPadName) return;
    setUnlockError("");

    if (!enteredPassword.trim()) {
      setUnlockError("Password is required.");
      return;
    }

    try {
      await verifyPad(unlockPadName, enteredPassword);
      setUnlockOpen(false);
      navigate(`/${unlockPadName}`, { state: { padPassword: enteredPassword } });
    } catch {
      setUnlockError("Incorrect password. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_30%)]" />

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-neutral-400">
              Collaborative pads, polished up
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Create a pad, protect it, and share it beautifully.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
              ErrorPad keeps writing fast, supports protected pads, and now lets you attach and download files right inside each pad.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Auto-save', 'Your text syncs live across the room.'],
                ['Protected pads', 'Password-gate a pad before anyone can read it.'],
                ['Files', 'Upload and download attachments per pad.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <form onSubmit={send} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Pad name</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="enter a pad name..."
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-lg text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">Protect this pad</p>
                    <p className="text-sm text-neutral-400">Require a password before anyone can view or edit.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProtectPad((value) => !value)}
                    className={`relative h-9 w-16 rounded-full border transition ${protectPad ? 'border-emerald-400/50 bg-emerald-400/30' : 'border-white/10 bg-white/10'}`}
                  >
                    <span
                      className={`absolute top-1 h-7 w-7 rounded-full bg-white transition ${protectPad ? 'left-8' : 'left-1'}`}
                    />
                  </button>
                </div>

                {protectPad ? (
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-neutral-300">Pad password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="set a strong password"
                      className="w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                    />
                  </div>
                ) : null}
              </div>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-base font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Opening pad...' : 'Create or open pad'}
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            'Shared pad links work instantly.',
            'If a pad is protected, only the password holder can read it.',
            'Attachments stay tied to the pad and download safely.',
          ].map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-black/30 p-5 text-sm text-neutral-300 backdrop-blur-xl">
              {item}
            </div>
          ))}
        </section>

      </main>

      <PasswordDialog
        open={unlockOpen}
        title="Unlock this pad"
        description="Enter the password to view and edit the pad."
        submitLabel="Unlock pad"
        error={unlockError}
        onSubmit={handleUnlock}
        onCancel={() => setUnlockOpen(false)}
      />
    </div>
  );
}
