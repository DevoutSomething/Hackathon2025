import { Routes, Route } from "react-router-dom";
import "./App.css";
import "../styles/Landing.css";
import Learn from "./pages/Learn.tsx";
import Result from "./pages/Result.tsx";
import Landing from "./pages/Landing.tsx";
import Video from "./pages/Video.tsx";
import Header from "./components/Header";
import Whiteboard from "./components/Whiteboard";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";

function App() {
  return (
    <UserSettingsProvider>
      <Routes>
        <Route path="/whiteboard" element={<Whiteboard />} />
        <Route path="/" element={
          <>
            <Header />
            <Landing />
          </>
        } />
        <Route path="/learn" element={
          <>
            <Header />
            <Learn />
          </>
        } />
        <Route path="/result" element={
          <>
            <Header />
            <Result />
          </>
        } />
        <Route path="/video" element={
          <>
            <Header />
            <Video />
          </>
        } />
      </Routes>
    </UserSettingsProvider>
  );
}

export default App;
