class AuthzTester {
    constructor() {
        this.baseUrl = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkSystemStatus();
        this.populateResultsPanel();
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('checkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkAuthorization();
        });

        document.getElementById('ownerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createOwnership();
        });

        document.getElementById('shareForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.shareDocument();
        });

        // Quick actions
        document.getElementById('setupExampleData').addEventListener('click', () => {
            this.setupExampleData();
        });

        document.getElementById('clearResults').addEventListener('click', () => {
            this.clearResults();
        });

        // Quick tests
        document.querySelectorAll('.test-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.runQuickTest(btn.dataset.test);
            });
        });
    }

    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(this.baseUrl + url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();
            
            this.logResult({
                method: options.method || 'GET',
                url,
                status: response.status,
                data
            });

            return { success: response.ok, data, status: response.status };
        } catch (error) {
            this.logResult({
                method: options.method || 'GET',
                url,
                status: 'ERROR',
                data: { error: error.message }
            });
            return { success: false, error: error.message };
        }
    }

    async checkAuthorization() {
        const user = document.getElementById('checkUser').value;
        const relation = document.getElementById('checkRelation').value;
        const object = document.getElementById('checkObject').value;

        this.showLoading('checkResult');

        const result = await this.makeRequest('/api/check', {
            method: 'POST',
            body: JSON.stringify({ user, relation, object })
        });

        this.displayResult('checkResult', result, 
            `Authorization Check: ${user} ${relation} ${object}`);
    }

    async createOwnership() {
        const userId = document.getElementById('ownerUserId').value;
        const documentId = document.getElementById('ownerDocId').value;

        this.showLoading('documentResult');

        const result = await this.makeRequest(`/api/documents/${documentId}/owner`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });

        this.displayResult('documentResult', result, 
            `Create Ownership: ${userId} -> ${documentId}`);
    }

    async shareDocument() {
        const userId = document.getElementById('shareUserId').value;
        const documentId = document.getElementById('shareDocId').value;
        const permission = document.getElementById('sharePermission').value;

        this.showLoading('documentResult');

        const result = await this.makeRequest(`/api/documents/${documentId}/share`, {
            method: 'POST',
            body: JSON.stringify({ userId, permission })
        });

        this.displayResult('documentResult', result, 
            `Share Document: ${userId} as ${permission} of ${documentId}`);
    }

    async setupExampleData() {
        this.showLoading('quickResult');

        const result = await this.makeRequest('/api/setup-example-data', {
            method: 'POST'
        });

        this.displayResult('quickResult', result, 'Setup Example Data');
    }

    async runQuickTest(testType) {
        this.showLoading('quickResult');

        const tests = {
            'alice-read-doc1': () => this.makeRequest('/api/documents/doc1/can-read/alice'),
            'bob-write-doc1': () => this.makeRequest('/api/documents/doc1/can-write/bob'),
            'charlie-write-doc1': () => this.makeRequest('/api/documents/doc1/can-write/charlie'),
            'alice-read-doc2': () => this.makeRequest('/api/documents/doc2/can-read/alice')
        };

        const result = await tests[testType]();
        this.displayResult('quickResult', result, `Quick Test: ${testType}`);
    }

    async checkSystemStatus() {
        // Check API Server
        try {
            const apiResponse = await fetch('/health');
            document.getElementById('apiStatus').textContent = 'Online';
            document.getElementById('apiStatus').className = 'status-indicator status-online';
        } catch {
            document.getElementById('apiStatus').textContent = 'Offline';
            document.getElementById('apiStatus').className = 'status-indicator status-offline';
        }

        // Check OpenFGA Server
        try {
            const fgaResponse = await fetch('http://localhost:8080/healthz');
            document.getElementById('fgaStatus').textContent = 'Online';
            document.getElementById('fgaStatus').className = 'status-indicator status-online';
        } catch {
            document.getElementById('fgaStatus').textContent = 'Offline';
            document.getElementById('fgaStatus').className = 'status-indicator status-offline';
        }

        // Simulate DB check (since we don't have direct access)
        setTimeout(() => {
            document.getElementById('dbStatus').textContent = 'Online';
            document.getElementById('dbStatus').className = 'status-indicator status-online';
        }, 1000);
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        element.className = 'result info';
        element.innerHTML = '<div class="loading"></div> Loading...';
    }

    displayResult(elementId, result, title) {
        const element = document.getElementById(elementId);
        
        if (result.success) {
            element.className = 'result success';
            element.innerHTML = `
                <strong>${title}</strong><br>
                <pre>${JSON.stringify(result.data, null, 2)}</pre>
            `;
        } else {
            element.className = 'result error';
            element.innerHTML = `
                <strong>Error: ${title}</strong><br>
                <pre>${result.error || JSON.stringify(result.data, null, 2)}</pre>
            `;
        }
    }

    logResult(logData) {
        const timestamp = new Date().toLocaleTimeString();
        const allResults = document.getElementById('allResults');
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const statusClass = logData.status >= 200 && logData.status < 300 ? 'status-success' : 'status-error';
        
        resultItem.innerHTML = `
            <div class="timestamp">${timestamp}</div>
            <div>
                <span class="method">${logData.method}</span> 
                ${logData.url} - 
                <span class="${statusClass}">${logData.status}</span>
            </div>
            <div><pre>${JSON.stringify(logData.data, null, 2)}</pre></div>
        `;
        
        allResults.insertBefore(resultItem, allResults.firstChild);
        
        // Keep only last 20 results
        if (allResults.children.length > 20) {
            allResults.removeChild(allResults.lastChild);
        }
    }

    clearResults() {
        document.getElementById('allResults').innerHTML = '';
        
        // Clear individual result areas
        ['checkResult', 'documentResult', 'quickResult'].forEach(id => {
            const element = document.getElementById(id);
            element.className = 'result';
            element.innerHTML = 'Results will appear here...';
        });
    }

    populateResultsPanel() {
        const allResults = document.getElementById('allResults');
        allResults.innerHTML = '<div class="result-item">No results yet. Start testing!</div>';
    }
}

// Utility functions for form enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    window.authzTester = new AuthzTester();
    
    // Add helpful placeholders and validation
    const userInputs = document.querySelectorAll('input[id*="User"]');
    userInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value && !this.value.startsWith('user:') && !this.value.includes(':')) {
                this.setAttribute('title', 'Will be prefixed with "user:" automatically');
            }
        });
    });

    const docInputs = document.querySelectorAll('input[id*="Doc"]');
    docInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value && !this.value.startsWith('document:') && !this.value.includes(':')) {
                this.setAttribute('title', 'Will be prefixed with "document:" automatically');
            }
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            const activeForm = document.activeElement.closest('form');
            if (activeForm) {
                activeForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Auto-focus first input
    const firstInput = document.querySelector('input[type="text"]');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
    
    // Add tooltips
    const tooltips = {
        'checkUser': 'Enter user identifier (e.g., alice or user:alice)',
        'checkObject': 'Enter object identifier (e.g., doc1 or document:doc1)',
        'checkRelation': 'Select the relationship to check',
        'ownerUserId': 'User who will own the document',
        'ownerDocId': 'Document to create ownership for',
        'shareUserId': 'User to share the document with',
        'shareDocId': 'Document to share',
        'sharePermission': 'Level of access to grant'
    };

    Object.entries(tooltips).forEach(([id, tooltip]) => {
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute('title', tooltip);
        }
    });
});

// Error handling for network issues
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
}); 