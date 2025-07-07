import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  Terminal,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Pause,
  Bug,
  Activity,
  Monitor
} from 'lucide-react';

const DebugExecution = ({ testCase, debugSession, isDarkMode, onBack }) => {
  const [sessionData, setSessionData] = useState(debugSession);
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [status, setStatus] = useState('starting');
  const [connecting, setConnecting] = useState(false);
  const [inspectorUrl, setInspectorUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const wsRef = useRef(null);
  const logsEndRef = useRef(null);
  const statusPollRef = useRef(null);

  useEffect(() => {
    if (debugSession) {
      setSessionId(debugSession.sessionId);
      setInspectorUrl(debugSession.inspectorUrl);
      setStatus('running');

      // Connect WebSocket for real-time updates
      connectWebSocket(debugSession.sessionId);
      // Poll status
      startStatusPolling(debugSession.sessionId);
    }

    return () => {
      wsRef.current?.close();
      clearInterval(statusPollRef.current);
    };
  }, [debugSession]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const connectWebSocket = sessionId => { /* ...existing implementation... */ };
  const startStatusPolling = sessionId => { /* ...existing implementation... */ };
  const stopDebugExecution = async () => { /* ...existing implementation... */ };
  const openInspector = () => {
    if (inspectorUrl) {
      window.open(inspectorUrl, '_blank', 'width=1200,height=800');
    }
  };
  const getStatusColor = status => { /* ...existing implementation... */ };
  const getStatusIcon = status => { /* ...existing implementation... */ };
  const getLogTypeColor = type => { /* ...existing implementation... */ };
  const formatTimestamp = timestamp => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>      
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>  
        <div className="flex items-center justify-between">
          {/* Back and Title */}
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tests
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-semibold flex items-center">
                <Bug className="w-5 h-5 mr-2 text-purple-600" />
                Debug Execution
              </h1>
              <p className="text-sm text-gray-500 mt-1">{testCase.name}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              <span className="ml-2 capitalize">{status}</span>
            </div>
            {/* Inspector Button */}
            {(status === 'running' || status === 'starting') && inspectorUrl && (
              <button onClick={openInspector} className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md">
                <Monitor className="w-4 h-4 mr-2" />
                Open Inspector<ExternalLink className="w-3 h-3 ml-1" />
              </button>
            )}
            {/* Stop Button */}
            {(status === 'running' || status === 'starting') && (
              <button onClick={stopDebugExecution} className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md">
                <Square className="w-4 h-4 mr-2" /> Stop
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel: Test Details */}
        <div className={`w-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-r p-6 overflow-y-auto`}>          
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" /> Test Details
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="font-medium text-gray-700">Session ID</label>
              <p className="mt-1 font-mono text-gray-900 dark:text-gray-200 text-xs">{sessionId || 'Not started'}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Current Step</label>
              <p className="mt-1 text-gray-900 dark:text-gray-200">{currentStep || 'Waiting...'}</p>
            </div>
            {testCase.steps?.length > 0 && (
              <div>
                <label className="font-medium text-gray-700">Test Steps</label>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {testCase.steps.map((step, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Logs */}
        <div className="w-2/3 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Terminal className="w-5 h-5 mr-2 text-green-500" /> Logs
          </h2>
          <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            {logs.map((log, idx) => (
              <div key={idx} className={`mb-2 text-sm ${getLogTypeColor(log.type)}`}>                
                <span className="font-mono text-xs mr-2">{formatTimestamp(log.timestamp)}</span>
                {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugExecution;
