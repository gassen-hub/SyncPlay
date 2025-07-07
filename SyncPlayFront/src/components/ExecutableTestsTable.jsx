import React, { useState, useEffect, useRef } from 'react';
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

// Debug Execution Interface Component
const DebugExecutionInterface = ({ testCase, onBack, isDarkMode }) => {
  const [debugSession, setDebugSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('IDLE');
  const [showConsole, setShowConsole] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    startDebugSession();
    
    return () => {
      if (debugSession) {
        stopDebugSession();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [testCase.id]);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const startDebugSession = async () => {
    try {
      setSessionStatus('STARTING');
      
      const response = await fetch(`http://localhost:8075/api/debug/start/${testCase.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to start debug session');
      }
      
      const result = await response.json();
      setDebugSession(result);
      
      connectWebSocket(result.sessionId);
      
    } catch (error) {
      console.error('Error starting debug session:', error);
      addMessage('ERROR', 'Failed to start debug session: ' + error.message, 'ERROR');
      setSessionStatus('ERROR');
    }
  };

  const connectWebSocket = (sessionId) => {
    try {
      const socket = new WebSocket('ws://localhost:8075/ws-debug');
      wsRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Subscribe to the debug session topic
        // Since we're using STOMP, we need to send subscription message
        const subscribeMessage = {
          command: 'SUBSCRIBE',
          destination: `/topic/debug/${sessionId}`,
          id: `sub-${sessionId}`
        };
        
        socket.send(JSON.stringify(subscribeMessage));
        
        addMessage('STATUS', 'Connected to debug session', 'INFO');
        setSessionStatus('CONNECTED');
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleDebugMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          // If it's not JSON, treat as plain text message
          addMessage('CONSOLE_LOG', event.data, 'INFO');
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSessionStatus('DISCONNECTED');
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setSessionStatus('ERROR');
      };
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setSessionStatus('ERROR');
    }
  };

  const handleDebugMessage = (message) => {
    addMessage(message.type, message.message, message.level, message.data);
    
    if (message.type === 'STATUS') {
      if (message.message.includes('completed')) {
        setSessionStatus('COMPLETED');
      } else if (message.message.includes('failed')) {
        setSessionStatus('FAILED');
      } else if (message.message.includes('stopped')) {
        setSessionStatus('STOPPED');
      } else if (message.message.includes('running')) {
        setSessionStatus('RUNNING');
      }
    }
  };

  const addMessage = (type, message, level, data = null) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      type,
      message,
      level,
      data,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const stopDebugSession = async () => {
    if (!debugSession) return;
    
    try {
      const response = await fetch(`http://localhost:8075/api/debug/stop/${debugSession.sessionId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        addMessage('STATUS', 'Debug session stopped', 'INFO');
        setSessionStatus('STOPPED');
      }
    } catch (error) {
      console.error('Error stopping debug session:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONNECTED':
      case 'RUNNING':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'STARTING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'FAILED':
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'STOPPED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONNECTED':
      case 'RUNNING':
        return <Activity className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'STARTING':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'FAILED':
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'STOPPED':
        return <Square className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessageIcon = (type, level) => {
    switch (type) {
      case 'CONSOLE_LOG':
        return <Terminal className="w-4 h-4 text-blue-500" />;
      case 'BROWSER_ACTION':
        return <Monitor className="w-4 h-4 text-purple-500" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'STATUS':
        return <Bug className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessageColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 dark:text-red-400';
      case 'WARN':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'INFO':
        return 'text-blue-600 dark:text-blue-400';
      case 'DEBUG':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-10`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tests
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Debug Execution: {testCase.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testCase.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(sessionStatus)}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sessionStatus)}`}>
                  {sessionStatus}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {(sessionStatus === 'CONNECTED' || sessionStatus === 'RUNNING') && (
                <button
                  onClick={stopDebugSession}
                  className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Debug
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {/* Debug Console */}
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-gray-500" />
              <h2 className="font-medium text-gray-900 dark:text-gray-100">Debug Console</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({messages.length} messages)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`p-1 rounded ${autoScroll ? 'text-blue-500' : 'text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
              >
                {autoScroll ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setMessages([])}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Clear messages"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Terminal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Waiting for debug messages...
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  {getMessageIcon(message.type, message.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getMessageColor(message.level)}`}>
                        {message.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Side Panel */}
        <div className={`w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Debug Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Case ID</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{testCase.id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session ID</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {debugSession?.sessionId || 'Not started'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">WebSocket Topic</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {debugSession?.websocketTopic || 'Not connected'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(sessionStatus)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">{sessionStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  if (currentView === 'debug' && currentDebugTest) {
    return (
      <DebugExecutionInterface
        testCase={currentDebugTest}
        onBack={handleBackFromDebug}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Executable Tests</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Run your generated test scripts and view results
            </p>
          </div>
          
          <button
            onClick={fetchExecutableTests}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

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