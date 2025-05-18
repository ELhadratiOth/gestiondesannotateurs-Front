import { Route, Routes, Navigate } from 'react-router-dom';

import LoginCardPage from './components/LoginCardPage';
import BlockOfCompos  from './components/Block-of-compos';
import Space from './components/space';
function App() {
  return (
    <>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <BlockOfCompos>
              <h1>Home</h1>
            </BlockOfCompos>
          }
        />
        <Route path="/auth" element={<LoginCardPage />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route
          path="/space"
          element={
            <BlockOfCompos>
              <Space />{' '}
            </BlockOfCompos>
          }
        />
      </Routes>
    </>
  );
}

export default App;
