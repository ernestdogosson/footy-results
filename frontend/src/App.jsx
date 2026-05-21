import { Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import MatchList from './pages/MatchList.jsx';
import MatchDetail from './pages/MatchDetail.jsx';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MatchList />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
      </Routes>
    </>
  );
}
