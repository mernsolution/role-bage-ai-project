
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../utility/baseURL';
import { useDispatch } from 'react-redux';
import { saveSummary } from '../store/slices/summarySlice';
import { toast } from 'react-toastify';
const AddSummaryModal = ({
  newSummary,
  setNewSummary,
  onAdd,
  onCancel
}) => {
  const { user } = useSelector((state) => state.auth);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [prompt, setPrompt] = useState('Please summarize this text in a clear and concise manner.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalText, setOriginalText] = useState('');



  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'text/plain' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setSelectedFile(file);
      setInputText('');
    } else {
      toast.error('Please select a .txt or .docx file');
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim() && !selectedFile) {
      toast.error('Please enter text or upload a file');
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('text', inputText);
      }

      formData.append('prompt', prompt);
      formData.append('userId', user?.id);

      const { data } = await axiosInstance.post('/generate-summary', formData);

      setOriginalText(data.originalText);

      setNewSummary({
        ...newSummary,
        content: data.summary,
        fileName: data.fileName,
        fileType: data.fileType,
        originalText: data.originalText
      });

    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleRegenerate = () => {
    handleSubmit();
  };

  const clearInput = () => {
    setInputText('');
    setSelectedFile(null);
    setOriginalText('');
  };


  const dispatch = useDispatch();

  const handleSave = async () => {
    if (!newSummary.title || !newSummary.content) {
      toast.error('Please provide both title and content');
      return;
    }

    setIsSaving(true);

    try {
      const action = await dispatch(saveSummary({
        newSummary,
        originalText,
        inputText,
        prompt,
        userId: user?.id
      }));

      if (saveSummary.fulfilled.match(action)) {
        onAdd(action.payload);
        toast.success('Summary saved successfully!');
      } else {
        throw new Error(action.payload);
      }

    } catch (error) {
      console.error('Error saving summary:', error);
      toast.error(`Failed to save summary: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Summary</h3>

        <div className="space-y-4">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input Method</label>
            <div className="space-y-3">
              {/* Text Input */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Text Input</label>
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (e.target.value.trim()) setSelectedFile(null);
                  }}
                  placeholder="Enter your text here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Or Upload File (.txt/.docx)</label>
                <input
                  type="file"
                  accept=".txt,.docx"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {(inputText.trim() || selectedFile) && (
              <button
                onClick={clearInput}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear Input
              </button>
            )}
          </div>

          {/* Prompt Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt (Edit to customize summary style)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Generate Summary Button */}
          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              disabled={isGenerating || (!inputText.trim() && !selectedFile)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                'Generate Summary'
              )}
            </button>

            {newSummary.content && (
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
              >
                Re-generate
              </button>
            )}
          </div>

          {/* Title Input - Show after summary is generated */}
          {newSummary.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newSummary.title || ''}
                onChange={(e) => setNewSummary({ ...newSummary, title: e.target.value })}
                placeholder="Enter a title for your summary"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Generated Content */}
          {newSummary.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generated Summary</label>
              <textarea
                value={newSummary.content}
                onChange={(e) => setNewSummary({ ...newSummary, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Status */}
          {newSummary.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newSummary.status || 'draft'}
                onChange={(e) => setNewSummary({ ...newSummary, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!newSummary.content || !newSummary.title || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Add Summary'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSummaryModal;
