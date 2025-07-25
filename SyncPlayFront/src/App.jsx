import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header'; // Add this import
import Dashboard from './components/Dashboard';
import TestCasesList from './components/TestCasesList';
import CreateTestCase from './components/CreateTestCase';
import ExecutableTestsTable from './components/ExecutableTestsTable';
import ScheduleManager from './components/ScheduleManager';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard isDarkMode={isDarkMode} />;
      case 'testcases':
        return <TestCasesList isDarkMode={isDarkMode} onCreateNew={() => setActiveView('create-testcase')} />;
      case 'create-testcase':
        return <CreateTestCase isDarkMode={isDarkMode} onBack={() => setActiveView('testcases')} />;
      case 'executable-tests':
        return <ExecutableTestsTable isDarkMode={isDarkMode} />;
      case 'ScheduleManager':
        return <ScheduleManager isDarkMode={isDarkMode} />;
      default:
        return <Dashboard isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      <div className="flex-1 flex flex-col">
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          activeView={activeView}
        />
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}