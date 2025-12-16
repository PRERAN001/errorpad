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
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-xl px-6">
        <h1 className="text-5xl font-semibold text-center mb-10">Errorpad</h1>
        <form className="flex" onSubmit={send}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="type anything..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-l-lg px-4 py-3 outline-none text-lg"
          />
          <button className="bg-black text-white px-6 rounded-r-lg text-lg">
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
