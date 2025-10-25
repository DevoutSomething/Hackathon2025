import { Routes, Route } from "react-router-dom";
import "./App.css";
import "../styles/Landing.css";
import Learn from "./pages/Learn.tsx";
import Result from "./pages/Result.tsx";
import Landing from "./pages/Landing.tsx";
import Video from "./pages/Video.tsx";
import Header from "./components/Header";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/result" element={<Result />} />
        <Route path="/video" element={<Video />} />
      </Routes>
    </div>
  );
}

export default App;
