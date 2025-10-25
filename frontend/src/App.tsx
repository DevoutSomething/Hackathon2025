import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home.tsx";
import Learn from "./pages/Learn.tsx";
import Result from "./pages/Result.tsx";
import QuizForm from "./components/QuizForm.tsx";
import Landing from "./pages/Landing.tsx";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/result" element={<Result />} />
        <Route path="/quiz" element={<QuizForm />} />
      </Routes>
    </div>
  );
}

export default App;
