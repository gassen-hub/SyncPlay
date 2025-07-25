import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Home, 
  FileText, 
  Play, 
  BarChart3, 
  Settings, 
  Plus,
  Search,
  User,
  LogOut,
  TestTube,
  Code,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Upload,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle,
  Moon,
  Sun,
  Zap,
  Calendar,
  Database,
  Shield,
  Bell,
  HelpCircle,
  ChevronRight,
  Folder,
  Monitor,
  List,
  Target,
  Users,
  LayoutDashboard,
  FlaskConical,
  Terminal,
  TrendingUp,
  PlaySquare,
  Timer
} from 'lucide-react';

// Professional Sidebar Component
const Sidebar = ({ activeView, setActiveView, isDarkMode, setIsDarkMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      color: 'blue',
      description: 'Overview and metrics'
    },
    { 
      id: 'testcases', 
      label: 'Test Cases', 
      icon: FlaskConical, 
      color: 'emerald',
      description: 'Manage test scenarios'
    },
    { 
      id: 'scripts', 
      label: 'Generated Scripts', 
      icon: Terminal, 
      color: 'purple',
      description: 'Auto-generated test scripts'
    },
    { 
      id: 'results', 
      label: 'Test Results', 
      icon: TrendingUp, 
      color: 'orange',
      description: 'Analysis and reports'
    },
    { 
      id: 'executable-tests', 
      label: 'Test Execution', 
      icon: PlaySquare, 
      color: 'red',
      description: 'Run and monitor tests'
    },
    { 
      id: 'ScheduleManager', 
      label: 'Schedule Manager', 
      icon: Timer, 
      color: 'indigo',
      description: 'Automated test scheduling'
    },
  ];

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' },
    { id: 'logout', label: 'Logout', icon: LogOut, color: 'gray' },
  ];

  const colorSchemes = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      hover: 'hover:bg-blue-50',
      hoverDark: 'hover:bg-blue-900/20',
      text: 'text-blue-600',
      textDark: 'text-blue-400'
    },
    emerald: {
      bg: 'from-emerald-500 to-emerald-600',
      hover: 'hover:bg-emerald-50',
      hoverDark: 'hover:bg-emerald-900/20',
      text: 'text-emerald-600',
      textDark: 'text-emerald-400'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      hover: 'hover:bg-purple-50',
      hoverDark: 'hover:bg-purple-900/20',
      text: 'text-purple-600',
      textDark: 'text-purple-400'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      hover: 'hover:bg-orange-50',
      hoverDark: 'hover:bg-orange-900/20',
      text: 'text-orange-600',
      textDark: 'text-orange-400'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      hover: 'hover:bg-red-50',
      hoverDark: 'hover:bg-red-900/20',
      text: 'text-red-600',
      textDark: 'text-red-400'
    },
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      hover: 'hover:bg-indigo-50',
      hoverDark: 'hover:bg-indigo-900/20',
      text: 'text-indigo-600',
      textDark: 'text-indigo-400'
    },
    gray: {
      bg: 'from-gray-500 to-gray-600',
      hover: 'hover:bg-gray-50',
      hoverDark: 'hover:bg-gray-700/50',
      text: 'text-gray-600',
      textDark: 'text-gray-400'
    }
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const MenuItem = ({ item, isBottom = false }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    const scheme = colorSchemes[item.color] || colorSchemes.gray;
    
    return (
      <div className="relative group">
        <button
          onClick={() => setActiveView(item.id)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative
            ${isActive 
              ? `bg-gradient-to-r ${scheme.bg} text-white shadow-md` 
              : isDarkMode 
                ? `text-gray-300 ${scheme.hoverDark} hover:text-white` 
                : `text-gray-700 ${scheme.hover} hover:text-gray-900`
            }
            ${isCollapsed ? 'justify-center px-3' : ''}
            hover:shadow-sm
          `}
        >
          <Icon 
            size={18} 
            className={`flex-shrink-0 ${isActive ? 'text-white' : ''}`}
          />
          
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <div className="font-medium">{item.label}</div>
              {item.description && !isBottom && (
                <div className={`text-xs mt-0.5 ${
                  isActive 
                    ? 'text-white/80' 
                    : isDarkMode 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              )}
            </div>
          )}
          
          {!isCollapsed && isActive && (
            <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          )}
        </button>
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className={`
            absolute left-full ml-3 px-3 py-2 rounded-md text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none
            ${isDarkMode 
              ? 'bg-gray-900 text-white border border-gray-700' 
              : 'bg-gray-800 text-white'
            }
            shadow-lg
          `}>
            <div className="flex flex-col">
              <span className="font-medium">{item.label}</span>
              {item.description && (
                <span className="text-xs opacity-75 mt-1">{item.description}</span>
              )}
            </div>
            <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-800'
            }`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      transition-all duration-300 ease-in-out flex flex-col
      ${isCollapsed ? 'w-16' : 'w-72'}
      ${isDarkMode 
        ? 'bg-gray-900 border-r border-gray-700' 
        : 'bg-white border-r border-gray-200'
      }
      h-full
    `}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TestTube className="text-white" size={16} />
              </div>
              <div>
                <h1 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  PlaySync
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Test Automation Platform
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded-md transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-yellow-400' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-orange-500'
              }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-md transition-all ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              <ChevronLeft 
                size={16} 
                className={`transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search 
              size={16} 
              className={`
                absolute left-3 top-1/2 transform -translate-y-1/2 
                ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
              `} 
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`
                w-full pl-9 pr-4 py-2 rounded-lg text-sm transition-all duration-200
                ${isDarkMode 
                  ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }
                focus:outline-none
              `}
            />
          </div>
        </div>
      )}

      {/* Quick Action */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <button 
            onClick={() => setActiveView('create-testcase')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={16} />
            <span>New Test Case</span>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {!isCollapsed && 'Main Menu'}
        </div>
        
        {(searchQuery ? filteredMenuItems : menuItems).map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
        
        {searchQuery && filteredMenuItems.length === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Search size={20} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items found</p>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} space-y-1`}>
        {bottomMenuItems.map((item) => (
          <MenuItem key={item.id} item={item} isBottom={true} />
        ))}
      </div>

      
    </div>
  );
};

export default Sidebar;