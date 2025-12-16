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
      <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-neutral-950">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Scribble Pad</h1>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400 text-lg">{query}</span>
        </div>
        <button
          onClick={saveText}
          className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-200 active:scale-95 transition-all"
        >
          Save
        </button>
      </div>

      <div className="flex-1 relative">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 39px,
              #262626 39px,
              #262626 40px
            )`,
            backgroundPosition: '0 20px'
          }}
        ></div>

        <textarea
          className="w-full h-full bg-transparent text-white text-xl leading-10 px-8 py-6 outline-none resize-none placeholder-neutral-700"
          style={{
            lineHeight: '40px',
            paddingTop: '20px'
          }}
          value={restext}
          onChange={(e) => setRestext(e.target.value)}
          placeholder="start writing..."
        />
      </div>

      <style>{`
        textarea::placeholder {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default Res;