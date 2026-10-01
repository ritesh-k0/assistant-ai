/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AssistantProvider, useAssistant } from './context/AssistantContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IncomingCallModal } from './components/IncomingCallModal';
import { FloatingVoiceButton } from './components/FloatingVoiceButton';
import { DashboardView } from './views/DashboardView';
import { ChatView } from './views/ChatView';
import { VoiceView } from './views/VoiceView';
import { CalendarView } from './views/CalendarView';
import { RemindersView } from './views/RemindersView';
import { TasksView } from './views/TasksView';
import { RoutineView } from './views/RoutineView';
import { MemoryView } from './views/MemoryView';
import { CallsView } from './views/CallsView';
import { ContactsView } from './views/ContactsView';
import { SocialMediaView } from './views/SocialMediaView';
import { SettingsView } from './views/SettingsView';

const AppContent: React.FC = () => {
  const { activeTab } = useAssistant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'chat':
        return <ChatView />;
      case 'voice':
        return <VoiceView />;
      case 'calendar':
        return <CalendarView />;
      case 'reminders':
        return <RemindersView />;
      case 'tasks':
        return <TasksView />;
      case 'routine':
        return <RoutineView />;
      case 'memory':
        return <MemoryView />;
      case 'calls':
        return <CallsView />;
      case 'contacts':
        return <ContactsView />;
      case 'social':
        return <SocialMediaView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* View body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Persistent global widgets */}
      <FloatingVoiceButton />
      <IncomingCallModal />
    </div>
  );
};

export default function App() {
  return (
    <AssistantProvider>
      <AppContent />
    </AssistantProvider>
  );
}
