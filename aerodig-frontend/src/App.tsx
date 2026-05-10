import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AtlasPage } from './pages/AtlasPage';
import { ConditionPage } from './pages/ConditionPage';
import { PathwaysPage } from './pages/PathwaysPage';
import { InstrumentsPage } from './pages/InstrumentsPage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { ProceduresPage } from './pages/ProceduresPage';
import { FrontierPage } from './pages/FrontierPage';
import { NetworkPage } from './pages/NetworkPage';
import { NewsPage } from './pages/NewsPage';
import { EventsPage } from './pages/EventsPage';
import { SearchPage } from './pages/SearchPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/atlas" element={<AtlasPage />} />
        <Route path="/atlas/:slug" element={<ConditionPage />} />
        <Route path="/pathways" element={<PathwaysPage />} />
        <Route path="/instruments" element={<InstrumentsPage />} />
        <Route path="/calculators" element={<CalculatorsPage />} />
        <Route path="/procedures" element={<ProceduresPage />} />
        <Route path="/frontier" element={<FrontierPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Layout>
  );
}
