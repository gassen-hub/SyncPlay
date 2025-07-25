import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, Plus, Edit2, Trash2, Mail, History, AlertCircle, CheckCircle, XCircle, Filter, Search, X } from 'lucide-react';

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scheduleHistory, setScheduleHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scriptSearchTerm, setScriptSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(new Date());

  const API_BASE = 'http://localhost:8075/api';

  // Form state
  const [formData, setFormData] = useState({
    scriptId: '',
    name: '',
    description: '',
    frequency: 'DAILY',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    dayOfWeek: 'MONDAY',
    dayOfMonth: 1,
    notificationEmail: ''
  });

  useEffect(() => {
    fetchSchedules();
    fetchScripts();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE}/schedules`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedules. Please try again.');
    }
  };

  const fetchScripts = async () => {
    try {
      // Fetch all test cases
      const testcaseResponse = await fetch(`${API_BASE}/testcases`);
      if (!testcaseResponse.ok) throw new Error('Failed to fetch test cases');
      const testcases = await testcaseResponse.json();

      // Fetch scripts for each test case
      const scriptPromises = testcases.map(async (testcase) => {
        try {
          const scriptResponse = await fetch(`${API_BASE}/testcases/${testcase.id}/script`);
          if (scriptResponse.ok) {
            const script = await scriptResponse.json();
            return {
              id: script.id,
              fileName: script.fileName,
              testcaseName: testcase.name,
              description: testcase.description
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching script for testcase ${testcase.id}:`, error);
          return null;
        }
      });

      const scripts = (await Promise.all(scriptPromises)).filter(script => script !== null);
      setScripts(scripts);
      setError(null);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      setError('Failed to load scripts. Please try again.');
      setScripts([]);
    }
  };

  const fetchScheduleHistory = async (scheduleId) => {
    try {
      const response = await fetch(`${API_BASE}/schedules/${scheduleId}/history`);
      if (!response.ok) throw new Error('Failed to fetch schedule history');
      const data = await response.json();
      setScheduleHistory(data);
    } catch (error) {
      console.error('Error fetching schedule history:', error);
      setError('Failed to load schedule history.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = selectedSchedule 
        ? `${API_BASE}/schedules/${selectedSchedule.id}`
        : `${API_BASE}/schedules`;
      
      const method = selectedSchedule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchSchedules();
        resetForm();
        setShowCreateModal(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error saving schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const response = await fetch(`${API_BASE}/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSchedules();
      } else {
        alert('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Error deleting schedule');
    }
  };

  const handleStatusToggle = async (schedule) => {
    try {
      const action = schedule.status === 'ACTIVE' ? 'deactivate' : 'activate';
      const response = await fetch(`${API_BASE}/schedules/${schedule.id}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchSchedules();
      } else {
        alert(`Failed to ${action} schedule`);
      }
    } catch (error) {
      console.error(`Error toggling schedule status:`, error);
      alert('Error updating schedule status');
    }
  };

  const resetForm = () => {
    setFormData({
      scriptId: '',
      name: '',
      description: '',
      frequency: 'DAILY',
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      dayOfWeek: 'MONDAY',
      dayOfMonth: 1,
      notificationEmail: ''
    });
    setSelectedSchedule(null);
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      scriptId: schedule.scriptId,
      name: schedule.name,
      description: schedule.description || '',
      frequency: schedule.frequency,
      status: schedule.status,
      startDate: schedule.startDate,
      startTime: schedule.startTime,
      dayOfWeek: schedule.dayOfWeek || 'MONDAY',
      dayOfMonth: schedule.dayOfMonth || 1,
      notificationEmail: schedule.notificationEmail || ''
    });
    setShowCreateModal(true);
  };

  const openHistoryModal = (schedule) => {
    setSelectedSchedule(schedule);
    fetchScheduleHistory(schedule.id);
    setShowHistoryModal(true);
  };

  const handleScriptSelect = (script) => {
    setFormData({
      ...formData,
      scriptId: script.id,
      name: formData.name || `${script.testcaseName} Schedule`
    });
    setShowScriptModal(false);
    setScriptSearchTerm('');
  };

  const getSelectedScript = () => {
    return scripts.find(script => script.id === formData.scriptId);
  };

  const filteredScripts = scripts.filter(script => {
    const searchLower = scriptSearchTerm.toLowerCase();
    return script.fileName.toLowerCase().includes(searchLower) ||
           script.testcaseName.toLowerCase().includes(searchLower) ||
           (script.description && script.description.toLowerCase().includes(searchLower));
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'INACTIVE': return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTestStatusIcon = (status) => {
    switch (status) {
      case 'PASSED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'SKIPPED': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatExecutionTime = (time) => {
    if (!time) return 'N/A';
    if (time < 1000) return `${time}ms`;
    if (time < 60000) return `${(time / 1000).toFixed(1)}s`;
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.scriptFileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.testcaseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || days.length < 42) {
      const daySchedules = schedules.filter(schedule => {
        if (schedule.status !== 'ACTIVE') return false;
        
        const nextExecution = new Date(schedule.nextExecution);
        return nextExecution.toDateString() === current.toDateString();
      });
      
      days.push({
        date: new Date(current),
        schedules: daySchedules,
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString()
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarData();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
    

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search schedules..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Schedule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar View */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Schedule Calendar</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ←
                  </button>
                  <span className="text-lg font-medium min-w-[150px] text-center">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[80px] p-2 border rounded-lg ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-medium ${
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    {day.schedules.map((schedule, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mt-1 truncate"
                        title={schedule.name}
                      >
                        {schedule.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Active Schedules</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredSchedules.map((schedule) => (
                  <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(schedule.status)}
                          <h3 className="font-medium text-gray-900">{schedule.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {schedule.frequency}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Script: {schedule.scriptFileName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Next: {formatDateTime(schedule.nextExecution)}</span>
                          </div>
                          {schedule.notificationEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{schedule.notificationEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openHistoryModal(schedule)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(schedule)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Schedule"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(schedule)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title={schedule.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          {schedule.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredSchedules.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No schedules found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Script Selection Modal */}
        {showScriptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Select Test Script</h3>
                  <button
                    onClick={() => {
                      setShowScriptModal(false);
                      setScriptSearchTerm('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search scripts by name, test case, or description..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={scriptSearchTerm}
                      onChange={(e) => setScriptSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {scripts.length === 0 && !scriptSearchTerm && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No scripts available. Create a test case first.</p>
                  </div>
                )}
                {filteredScripts.length === 0 && scriptSearchTerm && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No scripts found matching your search</p>
                  </div>
                )}
                {filteredScripts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                    {filteredScripts.map((script) => (
                      <div
                        key={script.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleScriptSelect(script)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{script.fileName}</h4>
                            <p className="text-sm text-blue-600 mb-2">{script.testcaseName}</p>
                            {script.description && (
                              <p className="text-xs text-gray-500">{script.description}</p>
                            )}
                          </div>
                          <div className="ml-4 text-gray-400">
                            →
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Schedule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedSchedule ? 'Edit Schedule' : 'Create New Schedule'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Script *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        value={getSelectedScript()?.fileName || 'No script selected'}
                        placeholder="Click to select script"
                      />
                      <button
                        type="button"
                        onClick={() => setShowScriptModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Select
                      </button>
                    </div>
                    {getSelectedScript() && (
                      <p className="text-xs text-gray-500 mt-1">{getSelectedScript().testcaseName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    />
                  </div>
                </div>

                {formData.frequency === 'WEEKLY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Week *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                    >
                      <option value="MONDAY">Monday</option>
                      <option value="TUESDAY">Tuesday</option>
                      <option value="WEDNESDAY">Wednesday</option>
                      <option value="THURSDAY">Thursday</option>
                      <option value="FRIDAY">Friday</option>
                      <option value="SATURDAY">Saturday</option>
                      <option value="SUNDAY">Sunday</option>
                    </select>
                  </div>
                )}

                {formData.frequency === 'MONTHLY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Month *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData({...formData, dayOfMonth: parseInt(e.target.value)})}
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.notificationEmail}
                    onChange={(e) => setFormData({...formData, notificationEmail: e.target.value})}
                    placeholder="Enter email for notifications"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.scriptId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : selectedSchedule ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  History: {selectedSchedule.name}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {scheduleHistory.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {entry.type === 'EXECUTION' ? (
                              <>
                                {getTestStatusIcon(entry.testStatus)}
                                <span className="font-medium">
                                  Test Execution - {entry.testStatus}
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">
                                  Status Change: {entry.oldStatus} → {entry.newStatus}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Time: {formatDateTime(entry.createdAt)}</div>
                            {entry.type === 'EXECUTION' && (
                              <div>Duration: {formatExecutionTime(entry.executionTime)}</div>
                            )}
                            {entry.changeReason && (
                              <div>Reason: {entry.changeReason}</div>
                            )}
                          </div>
                          
                          {entry.testOutput && (
                            <div className="mt-2">
                              <details className="cursor-pointer">
                                <summary className="text-sm font-medium text-gray-700">
                                  View Output
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                                  {entry.testOutput}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {scheduleHistory.length === 0 && (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No history available</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;