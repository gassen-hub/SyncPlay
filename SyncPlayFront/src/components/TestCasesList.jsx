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
  FileText,
  Code,
  Loader,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  Save
} from 'lucide-react';

const TestCasesList = ({ isDarkMode, onViewTestCase, onCreateNew, onEditTestCase }) => {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingScript, setGeneratingScript] = useState({});
  const [executingTest, setExecutingTest] = useState({});
  const [scripts, setScripts] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewingTestCase, setViewingTestCase] = useState(null);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    steps: [],
    file: null
  });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchTestCases();
    fetchAllScripts();
  }, []);

  const fetchTestCases = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8075/api/testcases');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTestCases(data);
    } catch (err) {
      console.error('Error fetching test cases:', err);
      setError('Failed to load test cases.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllScripts = async () => {
    try {
      const testCasesResponse = await fetch('http://localhost:8075/api/testcases');
      if (testCasesResponse.ok) {
        const testCasesData = await testCasesResponse.json();
        const scriptsData = {};
        
        for (const testCase of testCasesData) {
          try {
            const scriptResponse = await fetch(`http://localhost:8075/api/testcases/${testCase.id}/script`);
            if (scriptResponse.ok) {
              const scriptData = await scriptResponse.json();
              scriptsData[testCase.id] = scriptData;
            }
          } catch (err) {
            console.log(`No script found for test case ${testCase.id}`);
          }
        }
        setScripts(scriptsData);
      }
    } catch (err) {
      console.error('Error fetching scripts:', err);
    }
  };

  const handleViewTestCase = async (testCaseId) => {
    try {
      const response = await fetch(`http://localhost:8075/api/testcases/${testCaseId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const testCase = await response.json();
      
      if (onViewTestCase) {
        onViewTestCase(testCaseId);
      } else {
        setViewingTestCase(testCase);
      }
    } catch (err) {
      console.error('Error fetching test case details:', err);
      setError('Failed to load test case details.');
    }
  };

  const handleEditTestCase = async (testCaseId) => {
    try {
      const response = await fetch(`http://localhost:8075/api/testcases/${testCaseId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const testCase = await response.json();
      
      if (onEditTestCase) {
        onEditTestCase(testCaseId);
      } else {
        setEditingTestCase(testCase);
        setEditForm({
          name: testCase.name,
          description: testCase.description,
          steps: testCase.steps || [],
          file: null
        });
      }
    } catch (err) {
      console.error('Error fetching test case for editing:', err);
      setError('Failed to load test case for editing.');
    }
  };

  const handleUpdateTestCase = async () => {
    if (!editingTestCase) return;

    setEditLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      const testcaseData = {
        name: editForm.name,
        description: editForm.description,
        steps: editForm.steps
      };
      
      formData.append('testcase', JSON.stringify(testcaseData));
      
      if (editForm.file) {
        formData.append('file', editForm.file);
      }

      const response = await fetch(`http://localhost:8075/api/testcases/${editingTestCase.id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to update test case: HTTP ${response.status}`);
      }

      const updatedTestCase = await response.json();
      
      setTestCases(prev => prev.map(tc => 
        tc.id === editingTestCase.id ? updatedTestCase : tc
      ));
      
      setEditingTestCase(null);
      setEditForm({ name: '', description: '', steps: [], file: null });
      
    } catch (err) {
      console.error('Error updating test case:', err);
      setError(`Failed to update test case: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const addStep = () => {
    setEditForm(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const updateStep = (index, value) => {
    setEditForm(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const removeStep = (index) => {
    setEditForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const generateScript = async (testCaseId) => {
    setGeneratingScript(prev => ({ ...prev, [testCaseId]: true }));
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8075/api/testcases/${testCaseId}/generate-script`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate script: HTTP ${response.status}`);
      }
      
      const scriptData = await response.json();
      setScripts(prev => ({ ...prev, [testCaseId]: scriptData }));
      
      setTimeout(() => {
        setGeneratingScript(prev => ({ ...prev, [testCaseId]: false }));
      }, 1000);
      
    } catch (err) {
      console.error('Error generating script:', err);
      setError(`Failed to generate script: ${err.message}`);
      setGeneratingScript(prev => ({ ...prev, [testCaseId]: false }));
    }
  };

  const executeTest = async (testCaseId) => {
    setExecutingTest(prev => ({ ...prev, [testCaseId]: true }));
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8075/api/testcases/${testCaseId}/execute`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute test: HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Test execution result:', result);
      
      setTimeout(() => {
        setExecutingTest(prev => ({ ...prev, [testCaseId]: false }));
      }, 2000);
      
    } catch (err) {
      console.error('Error executing test:', err);
      setError(`Failed to execute test: ${err.message}`);
      setExecutingTest(prev => ({ ...prev, [testCaseId]: false }));
    }
  };

  const deleteTestCase = async (testCaseId) => {
    try {
      const response = await fetch(`http://localhost:8075/api/testcases/${testCaseId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete test case: HTTP ${response.status}`);
      }
      
      setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
      setScripts(prev => {
        const updated = { ...prev };
        delete updated[testCaseId];
        return updated;
      });
      setDeleteConfirm(null);
      
    } catch (err) {
      console.error('Error deleting test case:', err);
      setError(`Failed to delete test case: ${err.message}`);
    }
  };

  const getScriptStatusIcon = (status) => {
    switch (status) {
      case 'GENERATED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'EXECUTING':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getScriptStatusColor = (status) => {
    switch (status) {
      case 'GENERATED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'EXECUTING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const filteredTestCases = testCases.filter((tc) =>
    tc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 rounded-2xl`}>      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none w-full text-gray-700 dark:text-gray-200"
          />
        </div>
        <button
          onClick={onCreateNew}
          className="mt-4 sm:mt-0 inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full shadow transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> New Test Case
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-center py-3 px-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestCases.length > 0 ? (
            filteredTestCases.map((tc) => {
              const script = scripts[tc.id];
              const isGenerating = generatingScript[tc.id];
              const isExecuting = executingTest[tc.id];
              
              return (
                <div
                  key={tc.id}
                  className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {tc.name}
                    </h3>
                    {script && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getScriptStatusColor(script.status)}`}>
                        {getScriptStatusIcon(script.status)}
                        {script.status}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {tc.description}
                  </p>

                  {tc.uploadedFileName && (
                    <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mb-3">
                      <FileText className="w-4 h-4 mr-1" />
                      {tc.uploadedFileName}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Steps: {tc.steps?.length || 0} | 
                    Created: {new Date(tc.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewTestCase(tc.id)}
                      title="View Details"
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>

                    <button
                      onClick={() => handleEditTestCase(tc.id)}
                      title="Edit Test Case"
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>

                    {script ? (
                      <button
                        onClick={() => executeTest(tc.id)}
                        disabled={isExecuting}
                        title="Execute Test"
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition disabled:opacity-50"
                      >
                        {isExecuting ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        {isExecuting ? 'Running...' : 'Execute'}
                      </button>
                    ) : (
                      <button
                        onClick={() => generateScript(tc.id)}
                        disabled={isGenerating}
                        title="Generate Script"
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <Code className="w-3 h-3" />
                        )}
                        {isGenerating ? 'Generating...' : 'Generate'}
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteConfirm(tc.id)}
                      title="Delete Test Case"
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
              No test cases found.
            </div>
          )}
        </div>
      )}

      {/* Edit Test Case Modal */}
      {editingTestCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Edit Test Case
              </h2>
              <button
                onClick={() => setEditingTestCase(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter test case name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter test case description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Steps
                </label>
                <div className="space-y-2">
                  {editForm.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder={`Step ${index + 1}`}
                      />
                      <button
                        onClick={() => removeStep(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addStep}
                  className="mt-2 inline-flex items-center px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload New File (optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setEditForm(prev => ({ ...prev, file: e.target.files[0] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {editingTestCase.uploadedFileName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Current file: {editingTestCase.uploadedFileName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setEditingTestCase(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTestCase}
                disabled={editLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition disabled:opacity-50 flex items-center gap-2"
              >
                {editLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Case Details Modal */}
      {viewingTestCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {viewingTestCase.name}
              </h2>
              <button
                onClick={() => setViewingTestCase(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {viewingTestCase.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Steps
                </label>
                <div className="space-y-2">
                  {viewingTestCase.steps?.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {viewingTestCase.uploadedFileName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uploaded File
                  </label>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <FileText className="w-4 h-4" />
                    <span>{viewingTestCase.uploadedFileName}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-medium">Created:</span> {new Date(viewingTestCase.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {new Date(viewingTestCase.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setViewingTestCase(null)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this test case? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTestCase(deleteConfirm)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCasesList;