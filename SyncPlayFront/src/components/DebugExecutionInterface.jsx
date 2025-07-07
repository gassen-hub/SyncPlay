import React, { useState, useEffect, useRef } from 'react';
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
  Activity
} from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const DebugExecutionInterface = ({ testCase, onBack, isDarkMode }) => {
  const [debugSession, setDebugSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('IDLE');
  const [showConsole, setShowConsole] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Start debug session when component mounts
    startDebugSession();
    
    // Cleanup on unmount
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
    // Auto-scroll to bottom when new messages arrive
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const startDebugSession = async () => {
    try {
      setSessionStatus('STARTING');
      
      // Start debug session on backend
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
      
      // Connect to WebSocket
      connectWebSocket(result.sessionId);
      
    } catch (error) {
      console.error('Error starting debug session:', error);
      addMessage('ERROR', 'Failed to start debug session: ' + error.message, 'ERROR');
      setSessionStatus('ERROR');
    }
  };

  const connectWebSocket = (sessionId) => {
    try {
      // Connect to WebSocket endpoint
const ws = new WebSocket("ws://localhost:8075/ws-debug");
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Subscribe to debug session
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE',
          sessionId: sessionId
        }));
        
        addMessage('STATUS', 'Connected to debug session', 'INFO');
        setSessionStatus('CONNECTED');
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleDebugMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSessionStatus('DISCONNECTED');
      };
      
      ws.onerror = (error) => {
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
    
    // Update session status based on message type
    if (message.type === 'STATUS') {
      if (message.message.includes('completed')) {
        setSessionStatus('COMPLETED');
      } else if (message.message.includes('failed')) {
        setSessionStatus('FAILED');
      } else if (message.message.includes('stopped')) {
        setSessionStatus('STOPPED');
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
                Back
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
              {/* Session Status */}
              <div className="flex items-center space-x-2">
                {getStatusIcon(sessionStatus)}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sessionStatus)}`}>
                  {sessionStatus}
                </span>
              </div>
              
              {/* WebSocket Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Stop Button */}
              {sessionStatus === 'CONNECTED' || sessionStatus === 'RUNNING' ? (
                <button
                  onClick={stopDebugSession}
                  className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Debug Console */}
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'} ${showConsole ? '' : 'hidden'}`}>
          {/* Console Header */}
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
          
          {/* Messages */}
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

export default DebugExecutionInterface;