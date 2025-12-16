import { useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextProvider } from "../context/Textcontext.jsx";

export default function Errorpadmainpage() {
  const navigate = useNavigate();
  const { setText, query, setQuery, setYes } = useContext(TextProvider);

  const send = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setYes(true);
      navigate(`/${query}`);
    } catch {
      setYes(true);
      navigate(`/${query}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">

      <div className="w-full max-w-2xl px-8 py-10 bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 relative">
        
      
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_1px_1px,#262626_1px,transparent_0)] bg-[size:18px_18px] pointer-events-none" />

        <h1 className="relative text-5xl font-bold text-center mb-8 tracking-tight">
          Scribble Pad!
        </h1>

        <form className="relative flex gap-3" onSubmit={send}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="type anything..."
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-5 py-4 outline-none text-lg placeholder-neutral-500 focus:border-white transition"
          />

          <button
            className="bg-white text-black px-7 rounded-xl text-lg font-medium hover:bg-neutral-200 transition"
          >
            Go
          </button>
        </form>

        <p className="relative text-center text-neutral-500 mt-6 text-sm">
          write freely — share easily
        </p>
      </div>
    </div>
  );
}
