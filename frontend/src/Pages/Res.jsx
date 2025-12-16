import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Res = () => {
  const { query } = useParams();
  const [restext, setRestext] = useState("");

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASEURL}/${query}`
        );
        setRestext(response.data.usercontext);
      } catch {
        setRestext("");
      }
    };
    fetchText();
  }, [query]);

  const saveText = async () => {
    await axios.post(`${import.meta.env.VITE_BASEURL}/${query}`, {
      usercontext: restext,
    });
    console.log("Text saved:", restext);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-neutral-950 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Scribble Pad</h1>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400 text-lg">{query}</span>
        </div>
        <button
          onClick={saveText}
          className="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-200 active:scale-95 transition-all"
        >
          Save
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 31px,
              #1a1a1a 31px,
              #1a1a1a 32px
            )`,
            backgroundPosition: '0 16px'
          }}
        />

        <textarea
          className="w-full min-h-screen bg-transparent text-white text-lg px-8 outline-none resize-none placeholder-neutral-700 relative z-10"
          style={{
            lineHeight: '32px',
            paddingTop: '16px',
            paddingBottom: '16px'
          }}
          value={restext}
          onChange={(e) => setRestext(e.target.value)}
          placeholder="start writing..."
        />
      </div>
    </div>
  );
};

export default Res;