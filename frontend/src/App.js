import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Home from './screens/Home';
import PDFSummary from './screens/PDFSummary/PDFSummary';
import Stream from './screens/Stream';

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
          <Route path="/pdfsummary" element={
            <PDFSummary />
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;
