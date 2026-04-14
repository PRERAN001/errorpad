import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import FileSidebar from '../components/FileSidebar.jsx';
import PadHeader from '../components/PadHeader.jsx';
import PasswordDialog from '../components/PasswordDialog.jsx';
import {
  fetchPad,
  fetchPadFiles,
  fetchPadMeta,
  savePad,
  uploadPadFile,
  verifyPad,
} from '../services/padApi.js';

const baseURL = import.meta.env.VITE_BASEURL || 'http://localhost:8000';
const socket = io(baseURL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
});

const Res = () => {
  const { query } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialPassword = useMemo(() => location.state?.padPassword || '', [location.state]);

  const [meta, setMeta] = useState({ exists: false, isProtected: false, hasContent: false });
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState(initialPassword);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateError, setGateError] = useState('');
  const [saveState, setSaveState] = useState('Ready');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const hasHydrated = useRef(false);
  const saveTimer = useRef(null);
  const hydrateTimer = useRef(null);

  const loadPad = useCallback(async (activePassword = '') => {
    setIsLoading(true);
    setGateError('');

    try {
      const metaRes = await fetchPadMeta(query);
      const padMeta = metaRes.data;
      setMeta(padMeta);

      if (!padMeta.exists) {
        setNotFound(true);
        return;
      }

      if (padMeta.isProtected && !activePassword.trim()) {
        setGateOpen(true);
        return;
      }

      if (padMeta.isProtected) {
        await verifyPad(query, activePassword);
      }

      const [padRes, fileRes] = await Promise.all([
        fetchPad(query, activePassword),
        fetchPadFiles(query, activePassword),
      ]);

      setContent(padRes.data.usercontext || '');
      setFiles(Array.isArray(fileRes.data) ? fileRes.data : []);
      setPassword(activePassword);
      setNotFound(false);
      setGateOpen(false);
      setSaveState('Synced');
      if (hydrateTimer.current) {
        clearTimeout(hydrateTimer.current);
      }
      hydrateTimer.current = setTimeout(() => {
        hasHydrated.current = true;
      }, 0);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        setGateError('Incorrect password. Please try again.');
        setGateOpen(true);
      } else if (status === 404) {
        setNotFound(true);
      } else {
        setGateError('Unable to load this pad right now.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    hasHydrated.current = false;
    setPassword(initialPassword);
    setGateOpen(false);
    setNotFound(false);
    loadPad(initialPassword);

    socket.emit('join-room', query);

    const handleReceive = (newText) => {
      setContent(typeof newText === 'string' ? newText : JSON.stringify(newText || ''));
      setSaveState('Live sync');
    };

    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);
    const handleUpdateError = () => {
      setGateError('The password is no longer valid for this pad.');
      setGateOpen(true);
    };

    socket.on('receive-content', handleReceive);
    socket.on('connect', handleConnection);
    socket.on('disconnect', handleDisconnection);
    socket.on('content-update-error', handleUpdateError);

    return () => {
      socket.off('receive-content', handleReceive);
      socket.off('connect', handleConnection);
      socket.off('disconnect', handleDisconnection);
      socket.off('content-update-error', handleUpdateError);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (hydrateTimer.current) clearTimeout(hydrateTimer.current);
    };
  }, [initialPassword, loadPad, query]);

  useEffect(() => {
    if (!hasHydrated.current || isLoading || gateOpen || notFound) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    setSaveState('Saving...');
    saveTimer.current = setTimeout(async () => {
      try {
        await savePad(query, content, password);
        socket.emit('update-content', {
          roomName: query,
          usercontext: content,
          password,
        });
        setSaveState('Saved');
      } catch (error) {
        const status = error?.response?.status;
        if (status === 403) {
          setGateError('You do not have permission to edit this protected pad.');
          setGateOpen(true);
        } else {
          setSaveState('Save failed');
        }
      }
    }, 650);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, query, password, isLoading, gateOpen, notFound]);

  const refreshFiles = async () => {
    try {
      const fileRes = await fetchPadFiles(query, password);
      setFiles(Array.isArray(fileRes.data) ? fileRes.data : []);
    } catch {
      setFiles([]);
    }
  };

  const handleGateSubmit = async (enteredPassword) => {
    if (!enteredPassword.trim()) {
      setGateError('Password is required.');
      return;
    }

    try {
      await verifyPad(query, enteredPassword);
      setPassword(enteredPassword);
      setGateError('');
      setGateOpen(false);
      await loadPad(enteredPassword);
    } catch {
      setGateError('Incorrect password. Please try again.');
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setUploadBusy(true);
    try {
      await uploadPadFile(query, file, password);
      await refreshFiles();
      setSaveState('Files synced');
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) {
        setGateError('Upload blocked. This pad is password protected.');
        setGateOpen(true);
      } else {
        setGateError('Upload failed. Please try again.');
      }
    } finally {
      setUploadBusy(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/${query}`;
    try {
      await navigator.clipboard.writeText(url);
      setSaveState('Link copied');
    } catch {
      setSaveState('Copy failed');
    }
  };

  if (isLoading && !notFound) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-neutral-300 backdrop-blur-xl">
            Loading pad...
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
          <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Pad missing</p>
            <h1 className="mt-4 text-3xl font-semibold text-white">We couldn&apos;t find this pad.</h1>
            <p className="mt-4 text-sm leading-7 text-neutral-400">
              This pad does not exist yet. Go back to the home screen, create it, and start writing.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Back home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_35%)]" />

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <PadHeader
          padName={query}
          isProtected={meta.isProtected}
          isConnected={isConnected}
          saveState={saveState}
          onCopyLink={handleCopyLink}
        />

        <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3 text-xs text-neutral-500">
              <span>Live editor</span>
              <span>{meta.isProtected ? 'Password protected' : 'Open pad'}</span>
            </div>
            <textarea
              className="min-h-[65vh] w-full resize-none rounded-3xl border border-white/10 bg-black/45 p-6 text-lg leading-8 text-white outline-none transition placeholder:text-neutral-600 focus:border-white/25"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Start typing... your text saves automatically."
            />
          </div>

          <div className="space-y-6">
            <FileSidebar
              padName={query}
              files={files}
              password={password}
              protectedPad={meta.isProtected}
              uploadBusy={uploadBusy}
              onUpload={handleUpload}
              onRefresh={refreshFiles}
            />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-neutral-400 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="font-semibold text-white">How this pad behaves</p>
              <ul className="mt-3 space-y-2">
                <li>• Passwords are required before protected pads can be read or edited.</li>
                <li>• Files are stored with the pad and can be downloaded safely.</li>
                <li>• Socket sync keeps collaborators up to date in near real time.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <PasswordDialog
        open={gateOpen}
        title={`Unlock ${query}`}
        description="Enter the pad password to view content, edit text, and manage uploads."
        submitLabel="Unlock pad"
        loading={false}
        error={gateError}
        onSubmit={handleGateSubmit}
        onCancel={() => navigate('/')}
      />
    </div>
  );
};

export default Res;
