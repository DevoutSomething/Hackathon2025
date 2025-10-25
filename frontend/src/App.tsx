import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home.tsx";
import Learn from "./pages/Learn.tsx";
import Result from "./pages/Result.tsx";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/result" element={<Result />} />

      </Routes>
    </div>
  );
}

export default App;
