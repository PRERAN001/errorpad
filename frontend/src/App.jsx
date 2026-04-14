import Errorpadmainpage from "./Pages/Errorpadmainpage.jsx";
import Res from "./Pages/Res.jsx";
import { Navigate, Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<Errorpadmainpage />} />
        <Route path="/:query" element={<Res />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
