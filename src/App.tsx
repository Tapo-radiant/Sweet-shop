import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Buyer from "./pages/Buyer";
import Seller from "./pages/Seller";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/buyer" element={<Buyer />} />
      <Route path="/seller" element={<Seller />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
