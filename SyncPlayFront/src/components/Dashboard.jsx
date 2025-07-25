import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TestTube, 
  Camera, 
  Activity, 
  CheckCircle, 
  Clock, 
  Eye, 
  Calendar, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart as PieChartIcon
} from 'lucide-react';

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [screenshotModal, setScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  const API_BASE_URL = 'http://localhost:8075/api';

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(selectedDateRange));
      
      const response = await fetch(
        `${API_BASE_URL}/dashboard/analytics?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to fetch dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCaseClick = async (testCase) => {
    setSelectedTestCase(testCase);
    try {
      const response = await fetch(`${API_BASE_URL}/screenshots/testcase/${testCase.testcaseId}`);
      if (response.ok) {
        const screenshotData = await response.json();
        setScreenshots(screenshotData);
      }
    } catch (err) {
      console.error('Failed to fetch screenshots:', err);
    }
  };

  const openScreenshot = (screenshot) => {
    setSelectedScreenshot(screenshot);
    setScreenshotModal(true);
  };

  const formatTrendData = () => {
    if (!analyticsData?.executionTrends) return [];
    return analyticsData.executionTrends.dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString(),
      total: analyticsData.executionTrends.totalExecutions[index],
      passed: analyticsData.executionTrends.passedExecutions[index],
      failed: analyticsData.executionTrends.failedExecutions[index]
    }));
  };

  const pieData = analyticsData ? [
    { name: 'Passed', value: analyticsData.passFailRates.passedTests, color: '#059669' },
    { name: 'Failed', value: analyticsData.passFailRates.failedTests, color: '#DC2626' }
  ] : [];

  const filteredTestCases = analyticsData?.testCaseAnalytics?.filter(testCase =>
    testCase.testcaseName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue', trend }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className={`p-2 rounded-xl bg-gradient-to-r ${
              color === 'blue' ? 'from-blue-50 to-blue-100' :
              color === 'green' ? 'from-emerald-50 to-emerald-100' :
              color === 'purple' ? 'from-purple-50 to-purple-100' :
              color === 'red' ? 'from-red-50 to-red-100' :
              'from-gray-50 to-gray-100'
            }`}>
              <Icon className={`w-5 h-5 ${
                color === 'blue' ? 'text-blue-600' :
                color === 'green' ? 'text-emerald-600' :
                color === 'purple' ? 'text-purple-600' :
                color === 'red' ? 'text-red-600' :
                'text-gray-600'
              }`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-600" />}
              {trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
              {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-400" />}
              <p className={`text-sm font-medium ${
                change >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '+' : ''}{change}% from last period
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TestCaseCard = ({ testCase }) => (
    <div 
      className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
      onClick={() => handleTestCaseClick(testCase)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {testCase.testcaseName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">ID: {testCase.testcaseId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            testCase.passRate >= 90 ? 'bg-emerald-100 text-emerald-800' :
            testCase.passRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {testCase.passRate.toFixed(1)}%
          </span>
          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-lg font-bold text-gray-900">{testCase.totalExecutions}</p>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-xl">
          <p className="text-xs text-emerald-600 mb-1">Passed</p>
          <p className="text-lg font-bold text-emerald-700">{testCase.passedExecutions}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-xl">
          <p className="text-xs text-red-600 mb-1">Failed</p>
          <p className="text-lg font-bold text-red-700">{testCase.failedExecutions}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{testCase.averageExecutionTime.toFixed(1)}s avg</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(testCase.lastExecuted).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  const ScreenshotModal = () => (
    screenshotModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Screenshot Preview</h3>
              <button
                onClick={() => setScreenshotModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>
          {selectedScreenshot && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Step</p>
                  <p className="text-sm text-gray-600">{selectedScreenshot.stepName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Type</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selectedScreenshot.screenshotType === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                    selectedScreenshot.screenshotType === 'FAILURE' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedScreenshot.screenshotType}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Created</p>
                  <p className="text-sm text-gray-600">{new Date(selectedScreenshot.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <img
                  src={`${API_BASE_URL}/screenshots/file/${selectedScreenshot.fileName}`}
                  alt={selectedScreenshot.stepName}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.3s' }}></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading dashboard data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your analytics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Test Analytics</h1>
                  <p className="text-sm text-gray-500">Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'testcases', label: 'Test Cases', icon: TestTube },
              { key: 'screenshots', label: 'Screenshots', icon: Camera },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && analyticsData && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Test Cases"
                value={analyticsData.overallStats.totalTestCases}
                icon={TestTube}
                color="blue"
                trend="up"
              />
              <StatCard
                title="Total Executions"
                value={analyticsData.overallStats.totalExecutions}
                icon={Activity}
                color="green"
                trend="up"
              />
              <StatCard
                title="Success Rate"
                value={`${analyticsData.overallStats.overallPassRate.toFixed(1)}%`}
                icon={CheckCircle}
                color="green"
                trend="up"
              />
              <StatCard
                title="Avg Execution Time"
                value={`${analyticsData.overallStats.averageExecutionTime.toFixed(1)}s`}
                icon={Clock}
                color="purple"
                trend="down"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Execution Trends */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Execution Trends</h3>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formatTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} name="Total" />
                    <Line type="monotone" dataKey="passed" stroke="#059669" strokeWidth={2} name="Passed" />
                    <Line type="monotone" dataKey="failed" stroke="#DC2626" strokeWidth={2} name="Failed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pass/Fail Distribution */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Pass/Fail Distribution</h3>
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Test Case Performance */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Test Case Performance</h3>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.testCaseAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="testcaseName" angle={-45} textAnchor="end" height={100} fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="passRate" fill="#059669" name="Pass Rate %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="averageExecutionTime" fill="#3B82F6" name="Avg Time (s)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'testcases' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search test cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{filteredTestCases.length} test cases</span>
              </div>
            </div>

            {/* Test Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestCases.map((testCase) => (
                <TestCaseCard key={testCase.testcaseId} testCase={testCase} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'screenshots' && selectedTestCase && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Screenshots for {selectedTestCase.testcaseName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {screenshots.length} screenshots found
                  </p>
                </div>
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              
              {screenshots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No screenshots available</h4>
                  <p className="text-gray-500">Screenshots will appear here when test cases are executed</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {screenshots.map((screenshot) => (
                    <div
                      key={screenshot.id}
                      className="bg-gray-50 rounded-xl p-4 hover:shadow-md hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
                      onClick={() => openScreenshot(screenshot)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          screenshot.screenshotType === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                          screenshot.screenshotType === 'FAILURE' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {screenshot.screenshotType}
                        </span>
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {screenshot.stepName}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">{screenshot.fileName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(screenshot.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'screenshots' && !selectedTestCase && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">View Screenshots</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Select a test case from the Test Cases tab to view its screenshots and execution details
            </p>
            <button
              onClick={() => setActiveTab('testcases')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
            >
              Go to Test Cases
            </button>
          </div>
        )}
      </main>

      {/* Screenshot Modal */}
      <ScreenshotModal />
    </div>
  );
};

export default Dashboard;