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
  Zap
} from 'lucide-react';

// Sidebar Component
const Sidebar = ({ activeView, setActiveView, isDarkMode, setIsDarkMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'from-blue-500 to-blue-600' },
    { id: 'testcases', label: 'Test Cases', icon: FileText, color: 'from-green-500 to-green-600' },
    { id: 'scripts', label: 'Generated Scripts', icon: Code, color: 'from-purple-500 to-purple-600' },
    { id: 'results', label: 'Test Results', icon: BarChart3, color: 'from-orange-500 to-orange-600' },
    { id: 'executable-tests', label: 'Test Execution', icon: Play, color: 'from-red-500 to-red-600' },
    { id: 'ScheduleManager', label: 'ScheduleManager', icon: Play, color: 'from-red-500 to-red-600' },

  ];

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const MenuItem = ({ item, isBottom = false }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    
    return (
      <button
        onClick={() => setActiveView(item.id)}
        className={`
          w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden
          ${isActive 
            ? `bg-gradient-to-r ${item.color || 'from-blue-500 to-purple-600'} text-white shadow-lg transform scale-[1.02]` +
              (isDarkMode ? ' shadow-gray-900/50' : ' shadow-blue-500/25')
            : isDarkMode 
              ? 'text-gray-300 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 backdrop-blur-sm'
          }
          ${isCollapsed ? 'justify-center px-2' : ''}
          hover:scale-105 active:scale-95
        `}
      >
        <div className={`
          absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-10
          ${item.color ? `bg-gradient-to-r ${item.color}` : 'bg-gradient-to-r from-blue-500 to-purple-600'}
          ${isActive ? 'opacity-0' : ''}
        `} />
        
        <Icon 
          size={20} 
          className={`
            ${isActive ? 'text-white' : ''} flex-shrink-0 transition-all duration-300
            ${isActive ? 'drop-shadow-sm' : ''}
          `} 
        />
        
        {!isCollapsed && <span className="flex-1 text-left relative z-10">{item.label}</span>}
        
        {isCollapsed && (
          <div className={`
            absolute left-full ml-3 px-3 py-2 rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 pointer-events-none
            ${isDarkMode 
              ? 'bg-gray-800 text-white border border-gray-700 shadow-xl' 
              : 'bg-gray-900 text-white shadow-xl'
            }
          `}>
            {item.label}
            <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-900'}`} />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={`
      transition-all duration-300 ease-in-out flex flex-col relative
      ${isCollapsed ? 'w-16' : 'w-80'}
      ${isDarkMode 
        ? 'bg-gray-800/90 shadow-2xl shadow-gray-900/50 border-r border-gray-700' 
        : 'bg-white/90 shadow-2xl shadow-gray-900/10 border-r border-gray-200/50'
      }
      backdrop-blur-xl h-full
    `}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5 pointer-events-none" />
      
      {/* Header */}
      <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100/50'} relative z-10`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-3">
                <TestTube className="text-white" size={20} />
              </div>
              <div>
                <h1 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  PlaySync
                </h1>
                <p className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Zap size={10} />
                  Test Automation Hub
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-yellow-400' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-orange-500'
              }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
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
        <div className="p-5 relative z-10">
          <div className={`relative transition-all duration-300 transform ${isSearchFocused ? 'scale-105' : ''}`}>
            <Search 
              size={18} 
              className={`
                absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300
                ${isSearchFocused 
                  ? isDarkMode ? 'text-blue-400' : 'text-blue-500'
                  : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }
              `} 
            />
            <input
              type="text"
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`
                w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-300 font-medium
                ${isDarkMode 
                  ? 'bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                  : 'bg-gray-50/80 border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }
                backdrop-blur-sm focus:shadow-lg
              `}
            />
          </div>
        </div>
      )}

      {/* Quick Action */}
      {!isCollapsed && (
        <div className="px-5 pb-5 relative z-10">
          <button 
            onClick={() => setActiveView('create-testcase')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-sm hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:scale-105 active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Create Test Case</span>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-5 py-2 space-y-2 relative z-10 overflow-y-auto">
        {(searchQuery ? filteredMenuItems : menuItems).map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
        
        {searchQuery && filteredMenuItems.length === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Search size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items found</p>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className={`p-5 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100/50'} space-y-2 relative z-10`}>
        {bottomMenuItems.map((item) => (
          <MenuItem key={item.id} item={item} isBottom={true} />
        ))}
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className={`p-5 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100/50'} relative z-10`}>
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold">TA</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Test Automation
              </p>
              <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                admin@playsync.com
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Sidebar;