import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Setup from "./pages/Setup";
import Sync from "./pages/Sync";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/sync" element={<Sync />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/setup" element={<Setup />} />
      </Routes>
    </Layout>
  );
}
