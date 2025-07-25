import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Upload,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Code2,
  Bug,
  ExternalLink,
  ArrowLeft,
  Square,
  Terminal,
  Activity,
  Monitor,
  EyeOff
} from 'lucide-react';
import DebugExecution from './DebugExecution';

// Main Executable Tests Component
const ExecutableTestsTable = ({ isDarkMode = false }) => {
  const [executableTests, setExecutableTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(null);
  const [debugExecuting, setDebugExecuting] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [currentView, setCurrentView] = useState('table');
  const [currentDebugTest, setCurrentDebugTest] = useState(null);

  useEffect(() => {
    fetchExecutableTests();
  }, []);

  const fetchExecutableTests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8075/api/testcases');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const testCases = await response.json();
      
      const testsWithScripts = await Promise.all(
        testCases.map(async (testCase) => {
          try {
            const scriptResponse = await fetch(`http://localhost:8075/api/testcases/${testCase.id}/script`);
            if (scriptResponse.ok) {
              const script = await scriptResponse.json();
              return { ...testCase, script };
            }
            return null;
          } catch {
            return null;
          }
        })
      );
      
      const executable = testsWithScripts.filter(test => test !== null);
      setExecutableTests(executable);
      
      const results = {};
      for (const test of executable) {
        if (test.script?.id) {
          try {
            const resultsResponse = await fetch(`http://localhost:8075/api/results/script/${test.script.id}`);
            if (resultsResponse.ok) {
              const testResultsList = await resultsResponse.json();
              results[test.script.id] = testResultsList[0];
            }
          } catch (err) {
            console.error('Error fetching results:', err);
          }
        }
      }
      setTestResults(results);
      
    } catch (err) {
      console.error('Error fetching executable tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeTest = async (testCaseId) => {
    setExecuting(testCaseId);
    try {
      const response = await fetch(`http://localhost:8075/api/testcases/${testCaseId}/execute`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to execute test');
      
      const result = await response.json();
      
      const test = executableTests.find(t => t.id === testCaseId);
      if (test?.script?.id) {
        setTestResults(prev => ({
          ...prev,
          [test.script.id]: result
        }));
      }
      
    } catch (err) {
      console.error('Error executing test:', err);
      alert('Failed to execute test');
    } finally {
      setExecuting(null);
    }
  };

  const executeTestInDebugMode = async (testCase) => {
    setDebugExecuting(testCase.id);
    try {
      // Switch to debug view with the selected test case
      setCurrentDebugTest(testCase);
      setCurrentView('debug');
    } catch (err) {
      console.error('Error starting debug execution:', err);
      alert(`Failed to start debug execution: ${err.message}`);
    } finally {
      setDebugExecuting(null);
    }
  };

  const handleBackFromDebug = () => {
    setCurrentView('table');
    setCurrentDebugTest(null);
    // Refresh the test results when returning from debug
    fetchExecutableTests();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASSED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'RUNNING':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Render DebugExecution component when in debug view
  if (currentView === 'debug' && currentDebugTest) {
    return (
      <DebugExecution
        testCase={currentDebugTest}
        onBack={handleBackFromDebug}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Render main table view
  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
     

      <div className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Loading executable tests...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Test Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Script File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Execution Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {executableTests.length > 0 ? (
                  executableTests.map((test) => {
                    const result = testResults[test.script?.id];
                    return (
                      <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {test.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {test.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Code2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {test.script?.fileName || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {result ? (
                            <div className="flex items-center">
                              {getStatusIcon(result.status)}
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                                {result.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Not run</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {result?.executionTime ? `${result.executionTime}ms` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center space-x-2 justify-end">
                            <button
                              onClick={() => executeTest(test.id)}
                              disabled={executing === test.id || debugExecuting === test.id}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs rounded-md transition-colors duration-200 font-medium"
                            >
                              {executing === test.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 mr-1" />
                                  Execute
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => executeTestInDebugMode(test)}
                              disabled={executing === test.id || debugExecuting === test.id}
                              className="inline-flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs rounded-md transition-colors duration-200 font-medium"
                              title="Execute with Debug Mode"
                            >
                              {debugExecuting === test.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Starting...
                                </>
                              ) : (
                                <>
                                  <Bug className="w-3 h-3 mr-1" />
                                  Debug
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Code2 className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No Executable Tests Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Generate some test scripts first to see executable tests here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutableTestsTable;