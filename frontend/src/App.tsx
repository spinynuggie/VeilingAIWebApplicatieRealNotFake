import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Testing from "./pages/Testing"

function App() {
  return (
    <div>
     {/* Define routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/Landing" replace />} />

        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />}/>
        <Route path="/Landing" element={<Landing />}/>
        <Route path="/Testing" element={<Testing/>}/>
      </Routes>
    </div>
  );
}

export default App;
