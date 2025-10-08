import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

function App() {
  return (
    <div>
     {/* Define routes */}
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />}/>
        <Route path="/Landing" element={<Landing />}/>
      </Routes>
    </div>
  );
}

export default App;
