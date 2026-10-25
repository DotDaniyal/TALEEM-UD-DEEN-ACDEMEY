import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LiveBayanStudio } from './pages/LiveBayanStudio';
import { JoinBayanPage } from './pages/JoinBayanPage';
import { UpcomingBayansPage } from './pages/UpcomingBayansPage';
import { RecordedBayansPage } from './pages/RecordedBayansPage';
import { AudioLibraryPage } from './pages/AudioLibraryPage';
import { BayanDetailsPage } from './pages/BayanDetailsPage';
import { AboutSpeakerPage } from './pages/AboutSpeakerPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { Check } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, isAdmin, bannerNotice, setBannerNotice, currentAudioTrack } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'live':
        return <LiveBayanStudio />;
      case 'join':
        return <JoinBayanPage />;
      case 'upcoming':
        return <UpcomingBayansPage />;
      case 'recordings':
        return <RecordedBayansPage />;
      case 'audio-library':
        return <AudioLibraryPage />;
      case 'recording-details':
        return <BayanDetailsPage />;
      case 'speaker':
        return <AboutSpeakerPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      case 'admin-login':
        return <AdminLoginPage />;
      case 'admin-dashboard':
        return isAdmin ? <AdminDashboard /> : <AdminLoginPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F2421]">
      <Header />

      {/* Floating System Notification */}
      {bannerNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-sans flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{bannerNotice}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-stone-400 hover:text-stone-700 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full ${currentAudioTrack ? 'pb-28' : ''}`}>
        {renderView()}
      </main>

      <Footer />
      <AudioPlayerBar />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
