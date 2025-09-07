import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
    const [file, setFile] = useState(null);
    const [docId, setDocId] = useState('');
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hello! I\'m your legal document assistant. Upload a document to get started, then ask me questions about its contents.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const chatContainerRef = useRef(null);
    const queryInputRef = useRef(null);

    useEffect(() => {
        document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleFileSelection = (selectedFile) => {
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            showNotification('success', 'File selected successfully. Click Upload to proceed.');
        } else {
            showNotification('error', 'Please select a valid PDF file.');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            showNotification('error', 'Please select a file first.');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_MCP_URL}/analyze/upload`,
                formData
            );
            setDocId(response.data.doc_id);
            setMessages([...messages, { sender: 'ai', text: 'Your document has been uploaded successfully. You can now ask questions about it.' }]);
            showNotification('success', `Document uploaded successfully! Doc ID: ${response.data.doc_id}`);
        } catch (error) {
            showNotification('error', `Upload failed: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuery = async () => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        if (!docId) {
            showNotification('error', 'Please upload a document first.');
            return;
        }

        setMessages([...messages, { sender: 'user', text: trimmedQuery }]);
        setQuery('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_MCP_URL}/analyze/query`,
                { doc_id: docId, query: trimmedQuery },
                { headers: { 'Content-Type': 'application/json' } }
            );
            setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${error.response?.data?.detail || error.message}` }]);
            showNotification('error', 'Query failed. Please try again.');
        } finally {
            setIsLoading(false);
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
            if (queryInputRef.current) {
                queryInputRef.current.focus();
            }
        }
    };

    const addMessage = (sender, text) => {
        setMessages(prev => [...prev, { sender, text }]);
    };

    const showNotification = (type, message) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} notification-icon"></i>
            <div>
                <p class="mb-0 fw-medium">${type === 'success' ? 'Success!' : 'Error'}</p>
                <p class="mb-0 small">${message}</p>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSuggestion = (suggestion) => {
        setQuery(suggestion);
        handleQuery();
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="nav-header">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <i className="fas fa-scale-balanced fa-2x text-white me-3"></i>
                            <h1 className="h4 mb-0 text-white">LegalMind AI</h1>
                        </div>
                        <button className="btn btn-outline-light rounded-pill" onClick={toggleTheme}>
                            <i className="fas fa-moon me-2"></i> {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    <div className="row">
                        {/* Left Column - Upload Section */}
                        <div className="col-lg-5 mb-4">
                            <div className="card-theme p-4 h-100">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="feature-icon">
                                        <i className="fas fa-file-upload"></i>
                                    </div>
                                    <div className="ms-3">
                                        <h2 className="h5 mb-0">Upload Legal Document</h2>
                                        <p className="text-muted small mb-0">PDF files only</p>
                                    </div>
                                </div>
                                
                                <div
                                    className="upload-area mb-4"
                                    onDragEnter={(e) => { e.preventDefault(); e.target.style.borderColor = 'var(--primary)'; e.target.style.backgroundColor = 'rgba(79, 70, 229, 0.1)'; }}
                                    onDragOver={(e) => { e.preventDefault(); e.target.style.borderColor = 'var(--primary)'; e.target.style.backgroundColor = 'rgba(79, 70, 229, 0.1)'; }}
                                    onDragLeave={(e) => { e.preventDefault(); e.target.style.borderColor = ''; e.target.style.backgroundColor = ''; }}
                                    onDrop={(e) => { e.preventDefault(); handleFileSelection(e.dataTransfer.files[0]); e.target.style.borderColor = ''; e.target.style.backgroundColor = ''; }}
                                >
                                    <input
                                        type="file"
                                        id="fileInput"
                                        accept=".pdf"
                                        className="d-none"
                                        onChange={(e) => handleFileSelection(e.target.files[0])}
                                    />
                                    <div className="py-4">
                                        <i className="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                                        <p className="mb-1 fw-medium">Drag & drop your PDF here</p>
                                        <p className="text-muted small mb-3">or</p>
                                        <button className="btn btn-primary rounded-pill px-4" onClick={() => document.getElementById('fileInput').click()}>
                                            <i className="fas fa-folder-open me-2"></i>Browse Files
                                        </button>
                                    </div>
                                </div>
                                
                                {file && (
                                    <div className="selected-file mb-4" id="fileInfo">
                                        <div className="d-flex align-items-center p-3 bg-light rounded-3">
                                            <i className="fas fa-file-pdf text-danger fa-2x me-3"></i>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 fw-medium">{file.name}</p>
                                                <small className="text-muted">{formatFileSize(file.size)}</small>
                                            </div>
                                            <button className="btn btn-sm btn-outline-secondary rounded-circle" onClick={() => { setFile(null); setDocId(''); setMessages([{ sender: 'ai', text: 'File removed. Please upload a new document.' }]); }}>
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    className="btn btn-primary w-100 py-3 fw-medium"
                                    onClick={handleUpload}
                                    disabled={!file || isLoading}
                                >
                                    {isLoading ? <span className="spinner"></span> : 'Upload Document'}
                                </button>
                                
                                {docId && (
                                    <div className="mt-4" id="docIdContainer">
                                        <p className="small text-muted mb-2">Document ID:</p>
                                        <div className="doc-id-badge">
                                            <i className="fas fa-hashtag"></i>
                                            <span>{docId}</span>
                                        </div>
                                        <p className="small text-muted mt-2">Use this ID to reference your document in future sessions.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Right Column - Chat Section */}
                        <div className="col-lg-7">
                            <div className="card-theme p-4 h-100">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="feature-icon">
                                        <i className="fas fa-comments"></i>
                                    </div>
                                    <div className="ms-3">
                                        <h2 className="h5 mb-0">Document Analysis</h2>
                                        <p className="text-muted small mb-0">Ask questions about your legal document</p>
                                    </div>
                                </div>
                                
                                <div className="chat-container mb-4" ref={chatContainerRef} id="chatContainer">
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                                            <p className="mb-0">{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ask a question about your document..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                                        ref={queryInputRef}
                                        disabled={!docId || isLoading}
                                    />
                                    <button
                                        className="btn btn-primary rounded-end"
                                        type="button"
                                        onClick={handleQuery}
                                        disabled={!docId || isLoading}
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                                
                                <div className="suggestions">
                                    <p className="small text-muted mb-2">Try asking:</p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {['What is this document about?', 'Summarize the key points', 'Explain clause 5'].map((suggestion, index) => (
                                            <button
                                                key={index}
                                                className="btn btn-sm btn-outline-primary suggestion-btn"
                                                onClick={() => handleSuggestion(suggestion)}
                                                disabled={!docId || isLoading}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;