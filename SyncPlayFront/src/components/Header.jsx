import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Moon,
  Sun,
  HelpCircle,
  Shield,
  Activity,
  Globe,
  Command,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';

const Header = ({ isDarkMode, setIsDarkMode, activeView }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Test Suite Completed',
      message: 'Login flow tests passed successfully',
      time: '2 minutes ago',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Test Execution Delayed',
      message: 'Scheduled test delayed due to resource constraints',
      time: '15 minutes ago',
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      id: 3,
      type: 'info',
      title: 'New Test Case Created',
      message: 'Payment validation test case added',
      time: '1 hour ago',
      icon: Zap,
      color: 'text-blue-500'
    }
  ];

  // Get page title based on active view
  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      testcases: 'Test Cases',
      'create-testcase': 'Create Test Case',
      scripts: 'Generated Scripts',
      results: 'Test Results',
      'executable-tests': 'Test Execution',
      ScheduleManager: 'Schedule Manager',
      settings: 'Settings'
    };
    return titles[activeView] || 'PlaySync';
  };

  const getPageDescription = () => {
    const descriptions = {
      dashboard: 'Overview of your test automation metrics and recent activities',
      testcases: 'Manage and organize your test scenarios',
      'create-testcase': 'Create a new test case for your application',
      scripts: 'View and manage auto-generated test scripts',
      results: 'Analyze test execution results and reports',
      'executable-tests': 'Execute and monitor your test suites',
      ScheduleManager: 'Schedule and automate your test executions',
      settings: 'Configure your PlaySync preferences'
    };
    return descriptions[activeView] || 'Test Automation Platform';
  };

  return (
    <header className={`
      sticky top-0 z-40 transition-all duration-200
      ${isDarkMode 
        ? 'bg-gray-900/95 border-b border-gray-700/50 backdrop-blur-sm' 
        : 'bg-white/95 border-b border-gray-200/50 backdrop-blur-sm'
      }
    `}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Page Info */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getPageTitle()}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {getPageDescription()}
              </p>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search 
                size={18} 
                className={`
                  absolute left-3 top-1/2 transform -translate-y-1/2 
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                `} 
              />
              <input
                type="text"
                placeholder="Search tests, scripts, or results..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                  }
                  focus:outline-none
                `}
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Command size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Actions & User */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-yellow-400' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-orange-500'
                }
              `}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`
                  relative p-2 rounded-lg transition-all duration-200
                  ${isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }
                `}
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className={`
                  absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50
                  ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                  }
                `}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <div key={notification.id} className={`
                          p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer
                          ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : ''}
                        `}>
                          <div className="flex items-start gap-3">
                            <Icon size={16} className={notification.color} />
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {notification.title}
                              </p>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {notification.message}
                              </p>
                              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <button className={`
              p-2 rounded-lg transition-all duration-200
              ${isDarkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }
            `}>
              <HelpCircle size={18} />
            </button>

            {/* Divider */}
            <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`
                  flex items-center gap-3 p-2 rounded-lg transition-all duration-200
                  ${isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }
                `}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">TA</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="text-left">
                  <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Test Admin
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Administrator
                  </p>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className={`
                  absolute right-0 mt-2 w-64 rounded-lg shadow-lg border z-50
                  ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                  }
                `}>
                  {/* Profile Header */}
                  <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">TA</span>
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Test Admin
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          admin@playsync.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Menu */}
                  <div className="p-2">
                    <button className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}>
                      <User size={16} />
                      View Profile
                    </button>
                    <button className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}>
                      <Settings size={16} />
                      Account Settings
                    </button>
                    <button className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}>
                      <Shield size={16} />
                      Privacy & Security
                    </button>
                    <button className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}>
                      <Activity size={16} />
                      Activity Log
                    </button>
                  </div>

                  {/* Logout */}
                  <div className={`p-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${isDarkMode 
                        ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      }
                    `}>
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;