
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
} from 'lucide-react';// Create Test Case Component
const CreateTestCase = ({ isDarkMode, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: ['']
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleStepChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('testcase', JSON.stringify({
        name: formData.name,
        description: formData.description,
        steps: formData.steps.filter(step => step.trim() !== '')
      }));
      
      if (file) {
        formDataToSend.append('file', file);
      }

      const response = await fetch('http://localhost:8075/api/testcases', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        alert('Test case created successfully!');
        onBack();
      } else {
        alert('Failed to create test case');
      }
    } catch (error) {
      console.error('Error creating test case:', error);
      alert('Error creating test case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <ChevronLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Create New Test Case
        </h1>
      </div>

      <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} rounded-2xl shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-8`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Case Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Test Case Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Enter test case name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Describe what this test case validates"
              required
            />
          </div>

          {/* Test Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Test Steps *
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className={`text-sm font-medium min-w-[2rem] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className={`flex-1 px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder={`Enter step ${index + 1}`}
                  />
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Attach File (Optional)
            </label>
            <div className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} rounded-xl p-8 text-center transition-all hover:border-blue-500`}>
              <Upload className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={48} />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Click to upload or drag and drop
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  PNG, JPG, PDF up to 10MB
                </p>
              </label>
              {file && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Selected: {file.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className={`px-6 py-3 rounded-xl border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-all`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Test Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateTestCase;
