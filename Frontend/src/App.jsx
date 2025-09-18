import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GroundWaterMain from "./pages/GroundWaterMain";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GroundWaterMain />} /> 
      </Routes>
    </Router>
  );
}

export default App;
