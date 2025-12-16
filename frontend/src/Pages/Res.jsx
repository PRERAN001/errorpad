import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { TextProvider } from "../context/Textcontext.jsx";

const Res = () => {
  const { query } = useParams();
  const { setText } = useContext(TextProvider);
  const [restext, setRestext] = useState("");

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/${query}`);
        setText(response.data.usercontext);
        setRestext(response.data.usercontext);
      } catch {
        setRestext("no text found, type something");
      }
    };
    fetchText();
  }, [query, setText]);

  const saveText = async () => {
    await axios.post(`http://localhost:3000/${query}`, {
      usercontext: restext
    });
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <textarea
        className="area text-2xl flex-1"
        value={restext}
        onChange={(e) => setRestext(e.target.value)}
      />
      <button onClick={saveText}>Save</button>
    </div>
  );
};

export default Res;
