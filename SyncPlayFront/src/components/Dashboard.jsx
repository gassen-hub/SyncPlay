// Dashboard Component

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
const Dashboard = ({ isDarkMode }) => {
  const [stats, setStats] = useState({
    totalTestCases: 0,
    generatedScripts: 0,
    passedTests: 0,
    failedTests: 0
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Test Automation Dashboard
          </h1>
          <p className={`text-lg mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor and manage your test automation pipeline
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Test Cases</p>
              <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalTestCases}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <FileText className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Generated Scripts</p>
              <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.generatedScripts}</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <Code className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Passed Tests</p>
              <p className={`text-3xl font-bold mt-2 text-green-500`}>{stats.passedTests}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Failed Tests</p>
              <p className={`text-3xl font-bold mt-2 text-red-500`}>{stats.failedTests}</p>
            </div>
            <div className="p-3 bg-red-500 rounded-xl">
              <XCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Plus className="text-white" size={16} />
            </div>
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>New test case created</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Login functionality test - 2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="text-white" size={16} />
            </div>
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Test execution completed</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>User registration test - 5 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
