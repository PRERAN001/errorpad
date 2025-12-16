import Errorpadmainpage from "./Pages/Errorpadmainpage.jsx";
import Res from "./Pages/Res.jsx";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<Errorpadmainpage />} />
        <Route path="/:query" element={<Res />} />
      </Routes>
    </>
  );
};

export default App;
