import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import Home from './screens/Home';
import Stream from "./screens/Stream";
import './styles/bootstrap-custom.scss';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={
            <Home />
          } />
          <Route path="/stream" element={
            <Stream />
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;
