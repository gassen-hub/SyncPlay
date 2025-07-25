import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import {
  ArrowLeft,
  Play,
  Square,
  RefreshCw,
  Terminal,
  Bug,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Monitor,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

const DebugExecution = ({ testCase, onBack, isDarkMode }) => {
  const [debugSession, setDebugSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('IDLE');
  const [showConsole, setShowConsole] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    // Start debug session when component mounts
    startDebugSession();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [testCase.id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const cleanup = () => {
    if (debugSession) {
      stopDebugSession();
    }
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const startDebugSession = async () => {
    try {
      setSessionStatus('STARTING');
      addMessage('STATUS', 'Starting debug session...', 'INFO');
      
      // Call Spring Boot backend to start debug session
      const response = await fetch('http://localhost:8075/api/debug/start/' + testCase.id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start debug session: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.sessionId) {
        const session = {
          sessionId: result.sessionId,
          testcaseId: testCase.id,
          startTime: new Date().toISOString(),
          websocketTopic: result.websocketTopic
        };
        
        setDebugSession(session);
        
        // Connect to WebSocket after session is created
        await connectWebSocket(session.sessionId);
        
        addMessage('STATUS', result.message || 'Debug session started successfully', 'INFO');
        setSessionStatus('RUNNING');
      } else {
        throw new Error('No session ID received from server');
      }
      
    } catch (error) {
      console.error('Error starting debug session:', error);
      addMessage('ERROR', 'Failed to start debug session: ' + error.message, 'ERROR');
      setSessionStatus('ERROR');
    }
  };

  const connectWebSocket = async (sessionId) => {
    return new Promise((resolve, reject) => {
      try {
        // Use native WebSocket instead of SockJS
        const stompClient = new Client({
          brokerURL: 'ws://localhost:8075/ws-debug',
          connectHeaders: {},
          debug: function (str) {
            console.log('STOMP: ' + str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = (frame) => {
          console.log('Connected: ' + frame);
          setIsConnected(true);
          
          // Subscribe to debug session topic
          stompClient.subscribe(`/topic/debug/${sessionId}`, (message) => {
            const debugMessage = JSON.parse(message.body);
            handleDebugMessage(debugMessage);
          });
          
          addMessage('STATUS', 'Connected to debug session', 'INFO');
          setSessionStatus('CONNECTED');
          resolve();
        };

        stompClient.onStompError = (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
          setIsConnected(false);
          setSessionStatus('ERROR');
          addMessage('ERROR', 'STOMP connection error', 'ERROR');
          reject(new Error('STOMP connection error'));
        };

        stompClient.onWebSocketClose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          
          if (sessionStatus !== 'STOPPED' && sessionStatus !== 'COMPLETED') {
            setSessionStatus('DISCONNECTED');
            addMessage('WARN', 'WebSocket connection lost. Attempting to reconnect...', 'WARN');
            
            // Attempt to reconnect
            reconnectTimeoutRef.current = setTimeout(() => {
              if (debugSession) {
                connectWebSocket(debugSession.sessionId);
              }
            }, 3000);
          }
        };

        stompClient.onWebSocketError = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
          setSessionStatus('ERROR');
          addMessage('ERROR', 'WebSocket connection error', 'ERROR');
          reject(error);
        };
        
        stompClientRef.current = stompClient;
        stompClient.activate();
        
        // Timeout for connection
        setTimeout(() => {
          if (!stompClient.connected) {
            stompClient.deactivate();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
        
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        setSessionStatus('ERROR');
        reject(error);
      }
    });
  };

  const handleDebugMessage = (message) => {
    console.log('Received debug message:', message);
    
    // Handle different message formats
    if (typeof message === 'string') {
      // Plain text message
      addMessage('CONSOLE_LOG', message, 'INFO');
    } else if (message.type && message.message) {
      // Structured message from Spring Boot
      addMessage(message.type, message.message, message.level || 'INFO', message.data);
      
      // Update session status based on message type and content
      if (message.type === 'STATUS') {
        if (message.message.includes('completed successfully')) {
          setSessionStatus('COMPLETED');
        } else if (message.message.includes('failed') || message.message.includes('error')) {
          setSessionStatus('FAILED');
        } else if (message.message.includes('stopped')) {
          setSessionStatus('STOPPED');
        } else if (message.message.includes('Starting') || message.message.includes('Running')) {
          setSessionStatus('RUNNING');
        }
      } else if (message.type === 'ERROR') {
        setSessionStatus('FAILED');
      }
    } else {
      // Unknown message format, display as is
      addMessage('CONSOLE_LOG', JSON.stringify(message), 'INFO');
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
    
    // Log to console for debugging
    console.log(`[${type}] ${message}`);
  };

  const stopDebugSession = async () => {
    if (!debugSession) return;
    
    try {
      setSessionStatus('STOPPING');
      addMessage('STATUS', 'Stopping debug session...', 'INFO');
      
      // Disconnect WebSocket first
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        setIsConnected(false);
      }
      
      // Call Spring Boot backend to stop debug session
      const response = await fetch(`http://localhost:8075/api/debug/stop/${debugSession.sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to stop debug session: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.message) {
        addMessage('STATUS', result.message, 'INFO');
        setSessionStatus('STOPPED');
      } else {
        throw new Error('Failed to stop debug session');
      }
      
    } catch (error) {
      console.error('Error stopping debug session:', error);
      addMessage('ERROR', 'Failed to stop debug session: ' + error.message, 'ERROR');
    }
  };

  const restartDebugSession = async () => {
    if (debugSession) {
      await stopDebugSession();
      // Wait a moment before restarting
      setTimeout(() => {
        startDebugSession();
      }, 1000);
    } else {
      startDebugSession();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    addMessage('STATUS', 'Console cleared', 'INFO');
  };

  const getStatusIcon = () => {
    switch (sessionStatus) {
      case 'IDLE':
        return <Monitor className="w-5 h-5 text-gray-500" />;
      case 'STARTING':
      case 'CONNECTED':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'RUNNING':
        return <Play className="w-5 h-5 text-green-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'STOPPED':
        return <Square className="w-5 h-5 text-gray-500" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'DISCONNECTED':
        return <WifiOff className="w-5 h-5 text-orange-500" />;
      default:
        return <Bug className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'RUNNING':
        return 'text-green-600';
      case 'COMPLETED':
        return 'text-green-600';
      case 'FAILED':
      case 'ERROR':
        return 'text-red-600';
      case 'STOPPED':
        return 'text-gray-600';
      case 'DISCONNECTED':
        return 'text-orange-600';
      case 'STARTING':
      case 'CONNECTED':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMessageIcon = (type, level) => {
    if (type === 'BROWSER_ACTION') {
      return <Monitor className="w-4 h-4 text-blue-500" />;
    } else if (type === 'TEST_RESULT') {
      return level === 'ERROR' ? 
        <XCircle className="w-4 h-4 text-red-500" /> : 
        <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (type === 'CONSOLE_LOG') {
      return <Terminal className="w-4 h-4 text-purple-500" />;
    } else if (type === 'ERROR') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else if (type === 'STATUS') {
      return <Activity className="w-4 h-4 text-blue-500" />;
    } else {
      return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessageColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600';
      case 'WARN':
        return 'text-orange-600';
      case 'INFO':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Debug Execution
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {testCase.name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {sessionStatus}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={restartDebugSession}
                disabled={sessionStatus === 'RUNNING' || sessionStatus === 'STARTING'}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  sessionStatus === 'RUNNING' || sessionStatus === 'STARTING'
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode 
                      ? 'text-blue-400 hover:bg-gray-700' 
                      : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restart</span>
              </button>
              
              <button
                onClick={stopDebugSession}
                disabled={sessionStatus !== 'RUNNING'}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  sessionStatus !== 'RUNNING'
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode 
                      ? 'text-red-400 hover:bg-gray-700' 
                      : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Console Controls */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowConsole(!showConsole)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {showConsole ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>Console</span>
            </button>
            
            <button
              onClick={clearMessages}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Auto-scroll
              </span>
            </label>
            
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {messages.length} messages
            </div>
          </div>
        </div>
      </div>

      {/* Console Output */}
      {showConsole && (
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          <div className={`${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} border rounded-lg h-[calc(100vh-200px)] flex flex-col`}>
            {/* Console Header */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center space-x-2">
                <Terminal className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Debug Console
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            {/* Console Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
              {messages.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No console output yet. Start debugging to see messages.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start space-x-3 py-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(msg.type, msg.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`break-words ${getMessageColor(msg.level)}`}>
                        {msg.message}
                      </div>
                      {msg.data && (
                        <div className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <pre className="whitespace-pre-wrap">
                            {typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugExecution;