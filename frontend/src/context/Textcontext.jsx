import { createContext, useState } from "react";

export const TextProvider = createContext();

const Textcontext = ({ children }) => {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [yes, setYes] = useState(false);

  return (
    <TextProvider.Provider value={{ text, setText, query, setQuery, yes, setYes }}>
      {children}
    </TextProvider.Provider>
  );
};

export default Textcontext;
