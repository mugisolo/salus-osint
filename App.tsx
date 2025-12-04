
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';

type AppView = 'SITE' | 'DASHBOARD';

export default function App() {
  const [view, setView] = useState<AppView>('SITE');

  if (view === 'DASHBOARD') {
    return <Dashboard onReturnToSite={() => setView('SITE')} />;
  }

  return <LandingPage onLaunchDashboard={() => setView('DASHBOARD')} />;
}
