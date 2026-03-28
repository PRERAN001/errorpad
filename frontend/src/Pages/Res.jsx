import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

// Connect to your backend port 8000
const socket = io("http://localhost:8000"); 

const Res = () => {
  const { query } = useParams();
  const [restext, setRestext] = useState("");
  const isInitialMount = useRef(true);

  // STEP 1: Initial Load & Socket Setup
  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/${query}`);
        setRestext(res.data.usercontext || "");
      } catch (err) {
        console.log("New pad detected");
      }
    };

    fetchText();
    socket.emit("join-room", query); // Tell server which room to join

    // Listen for updates from OTHER users
    socket.on("receive-content", (newText) => {
      setRestext(newText);
    });

    return () => socket.off("receive-content");
  }, [query]);

  // STEP 2: The Auto-Save (Debounce) Logic
  useEffect(() => {
    // Avoid saving immediately when the page first loads the data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }


    const delayTimer = setTimeout(() => {
      // This is what actually triggers the DB change on the server
      socket.emit("update-content", { 
        roomName: query, 
        usercontext: restext 
      });
    }, 1000); // 1 second delay

    return () => clearTimeout(delayTimer); // Reset timer if user types again
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