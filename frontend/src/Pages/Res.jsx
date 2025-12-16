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
        setRestext("no text found, type something");
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
    <div className="min-h-screen bg-neutral-950 flex justify-center px-4 py-6">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col">


        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_1px_1px,#262626_1px,transparent_0)] bg-[size:18px_18px] opacity-40 pointer-events-none" />


        <textarea
          className="relative flex-1 w-full bg-transparent text-neutral-100 
                     text-2xl leading-relaxed p-10 outline-none resize-none
                     placeholder-neutral-500 custom-scroll"
          value={restext}
          onChange={(e) => setRestext(e.target.value)}
          placeholder="start writing..."
        />


        <div className="relative flex justify-end border-t border-neutral-800 px-6 py-4">
          <button
            onClick={saveText}
            className="bg-white text-black px-6 py-2 rounded-xl text-sm font-medium hover:bg-neutral-200 active:scale-95 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Res;
