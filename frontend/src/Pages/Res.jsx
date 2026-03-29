import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BASEURL}`); 

const Res = () => {
  const { query } = useParams();
  const [restext, setRestext] = useState("");
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASEURL}/${query}`);
        setRestext(res.data.usercontext || "");
      } catch (err) {
        console.log("New pad detected");
      }
    };

    fetchText();
    socket.emit("join-room", query); 

    socket.on("receive-content", (newText) => {
      setRestext(newText);
    });

    return () => socket.off("receive-content");
  }, [query]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }


    const delayTimer = setTimeout(() => {
      socket.emit("update-content", { 
        roomName: query, 
        usercontext: restext 
      });
    }, 1000); 

    return () => clearTimeout(delayTimer); 
  }, [restext, query]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="border-b border-neutral-800 px-6 py-4 flex justify-between bg-neutral-950">
        <h1 className="text-2xl font-bold">Error Pad | {query}</h1>
      </div>

      <textarea
        className="flex-1 bg-transparent p-8 outline-none resize-none text-lg"
        value={restext}
        onChange={(e) => setRestext(e.target.value)}
        placeholder="Start typing... saves automatically"
      />
    </div>
  );
};

export default Res;