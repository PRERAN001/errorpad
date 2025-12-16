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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-3 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Scribble Pad
          </h1>
          <p className="text-neutral-500 text-lg">
            write freely - share easily
          </p>
        </div>

        <form onSubmit={send} className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neutral-600 via-neutral-500 to-neutral-600 rounded-2xl blur opacity-25"></div>
          <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-8">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="enter a pad name to start..."
              className="w-full bg-black border-2 border-neutral-800 rounded-xl px-6 py-5 outline-none text-xl placeholder-neutral-600 focus:border-neutral-500 transition-all"
            />
            <button
              type="submit"
              className="mt-6 w-full bg-white text-black py-4 rounded-xl text-lg font-semibold hover:bg-neutral-200 active:scale-98 transition-all"
            >
              Create Pad
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-neutral-600 text-sm">
          <p>No sign up required. Just type and go.</p>
        </div>
      </div>
    </div>
  );
}