import { Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import MatchList from './pages/MatchList.jsx';
import MatchDetail from './pages/MatchDetail.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MatchList />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}
