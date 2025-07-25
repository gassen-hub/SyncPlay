const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec, spawn } = require('child_process');
const axios = require('axios');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const SPRING_BOOT_URL = 'http://localhost:8075';

// Store active debug sessions
const debugSessions = new Map();
const activeSessions = new Map(); // Enhanced debug sessions

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Directories
const TESTS_DIR = path.join(__dirname, 'generated-tests');
const RESULTS_DIR = path.join(__dirname, 'test-results');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');

// Ensure directories exist
fs.ensureDirSync(TESTS_DIR);
fs.ensureDirSync(RESULTS_DIR);
fs.ensureDirSync(SCRIPTS_DIR);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        activeSessions: activeSessions.size,
        debugSessions: debugSessions.size,
        timestamp: new Date().toISOString() 
    });
});

// NEW ENDPOINT: Execute existing test file
app.post('/execute-existing-test', async (req, res) => {
  const { fileName, testName, testId } = req.body;
  const testFilePath = path.join(TESTS_DIR, fileName);

  try {
    if (!await fs.pathExists(testFilePath)) {
      return res.status(404).json({ success: false, message: `Test file not found: ${fileName}` });
    }

    const result = await executePlaywrightTest(testFilePath, testName);

    // Attach metadata
    result.executionId = uuidv4();
    result.testId      = testId;
    result.fileName    = fileName;
    result.timestamp   = new Date().toISOString();

    console.log('Test execution result:', result);
    return res.json(result);

  } catch (err) {
    console.error('Execution error:', err);
    return res.status(500).json({
      success: false,
      message: `Test execution failed: ${err.message}`,
      output: err.stack
    });
  }
});

// ORIGINAL ENDPOINT: Execute test with provided code (keep for backward compatibility)
app.post('/execute-test', async (req, res) => {
    const { testCode, testName, testId } = req.body;

    console.log('Received test execution request:', { testName, testId });
    console.log('Test code length:', testCode ? testCode.length : 0);

    if (!testCode || !testName) {
        return res.status(400).json({
            success: false,
            message: 'testCode and testName are required'
        });
    }

    const executionId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.spec.js`;
    const testFilePath = path.join(TESTS_DIR, fileName);

    try {
        // Create the test file with proper Playwright structure
        const fullTestCode = createPlaywrightTestFile(testCode, testName);
        
        console.log(`Creating test file: ${testFilePath}`);
        console.log('Generated test code:', fullTestCode);
        
        // Write test file
        await fs.writeFile(testFilePath, fullTestCode);
        
        // Execute the test
        const result = await executePlaywrightTest(testFilePath, testName);
        
        // Add metadata to result
        result.executionId = executionId;
        result.testId = testId;
        result.fileName = fileName;
        result.timestamp = new Date().toISOString();

        console.log('Test execution completed:', { success: result.success, testName });

        res.json(result);

    } catch (error) {
        console.error('Test execution error:', error);
        res.status(500).json({
            success: false,
            message: `Test execution failed: ${error.message}`,
            output: error.stack,
            exitCode: -1,
            executionId,
            testId,
            timestamp: new Date().toISOString()
        });
    }
});

// ENHANCED DEBUG ENDPOINTS - INTEGRATED FROM paste.txt
// Enhanced debug execution endpoint with browser visibility
app.post('/debug/execute', async (req, res) => {
    const { fileName, sessionId, testcaseId, mode } = req.body;
    
    try {
        console.log(`Starting enhanced debug execution for session: ${sessionId}`);
        
        // Store session info
        activeSessions.set(sessionId, {
            testcaseId,
            fileName,
            startTime: new Date(),
            status: 'RUNNING'
        });
        
        // Send initial message
        await sendMessageToSpringBoot(sessionId, testcaseId, 'Starting browser in debug mode...', 'INFO', 'STATUS');
        
        // Check if we should use the enhanced debug mode (with visible browser)
        if (mode === 'enhanced' || mode === 'visual') {
            // Execute test in enhanced debug mode with visible browser
            const result = await executeTestInDebugMode(fileName, sessionId, testcaseId);
            
            res.json({
                success: true,
                message: 'Enhanced debug execution completed',
                sessionId: sessionId,
                mode: 'enhanced'
            });
        } else {
            // Fallback to original debug mode
            await sendDebugMessage(sessionId, 'Test execution starting...', 'INFO', 'STATUS');
            
            const testFilePath = path.join(TESTS_DIR, fileName);
            
            // Check if file exists
            if (!await fs.pathExists(testFilePath)) {
                throw new Error(`Test file not found: ${fileName}`);
            }

            const playwrightProcess = spawn('npx.cmd', [
                'playwright', 'test',
                fileName,
                '--headed',
                '--reporter=line',
                '--workers=1'
            ], {
                cwd: TESTS_DIR,
                stdio: 'pipe',
                env: { ...process.env, FORCE_COLOR: '1' }
            });
         
            // Store the process for potential cleanup
            debugSessions.set(sessionId, playwrightProcess);
            
            // Handle stdout (console logs, test output)
            playwrightProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`Debug output [${sessionId}]:`, output);
                
                // Parse and send different types of messages
                if (output.includes('Running')) {
                    sendDebugMessage(sessionId, `Running: ${output.trim()}`, 'INFO', 'BROWSER_ACTION');
                } else if (output.includes('✓') || output.includes('✗')) {
                    sendDebugMessage(sessionId, output.trim(), 'INFO', 'TEST_RESULT');
                } else if (output.includes('console.')) {
                    sendDebugMessage(sessionId, output.trim(), 'INFO', 'CONSOLE_LOG');
                } else if (output.trim()) {
                    sendDebugMessage(sessionId, output.trim(), 'INFO', 'OUTPUT');
                }
            });
            
            // Handle stderr (errors)
            playwrightProcess.stderr.on('data', (data) => {
                const error = data.toString();
                console.error(`Debug error [${sessionId}]:`, error);
                sendDebugMessage(sessionId, error.trim(), 'ERROR', 'ERROR');
            });
            
            // Handle process completion
            playwrightProcess.on('close', (code) => {
                console.log(`Debug process [${sessionId}] exited with code ${code}`);
                
                if (code === 0) {
                    sendDebugMessage(sessionId, 'Test execution completed successfully', 'INFO', 'STATUS');
                } else {
                    sendDebugMessage(sessionId, `Test execution failed with code ${code}`, 'ERROR', 'STATUS');
                }
                
                // Clean up
                debugSessions.delete(sessionId);
            });
            
            // Handle process errors
            playwrightProcess.on('error', (error) => {
                console.error(`Debug process error [${sessionId}]:`, error);
                sendDebugMessage(sessionId, `Process error: ${error.message}`, 'ERROR', 'ERROR');
                debugSessions.delete(sessionId);
            });
            
            res.json({
                success: true,
                message: 'Debug execution started',
                sessionId: sessionId,
                mode: 'standard'
            });
        }
        
    } catch (error) {
        console.error('Debug execution error:', error);
        await sendMessageToSpringBoot(sessionId, testcaseId, `Debug execution failed: ${error.message}`, 'ERROR', 'STATUS');
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Enhanced stop debug session endpoint
app.post('/debug/stop', async (req, res) => {
    const { sessionId } = req.body;
    
    try {
        // Handle enhanced debug session
        const enhancedSession = activeSessions.get(sessionId);
        if (enhancedSession && enhancedSession.browser) {
            await enhancedSession.browser.close();
            await sendMessageToSpringBoot(sessionId, enhancedSession.testcaseId, 'Browser closed by user', 'INFO', 'STATUS');
        }
        
        // Handle standard debug session
        const standardProcess = debugSessions.get(sessionId);
        if (standardProcess) {
            standardProcess.kill('SIGTERM');
            sendDebugMessage(sessionId, 'Debug session stopped by user', 'INFO', 'STATUS');
        }
        
        // Clean up both session types
        activeSessions.delete(sessionId);
        debugSessions.delete(sessionId);
        
        res.json({
            success: true,
            message: 'Debug session stopped'
        });
        
    } catch (error) {
        console.error('Error stopping debug session:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ENHANCED DEBUG FUNCTIONS - INTEGRATED FROM paste.txt
async function executeTestInDebugMode(fileName, sessionId, testcaseId) {
    let browser = null;
    let page = null;
    
    try {
        // Launch browser in headed mode (visible)
        await sendMessageToSpringBoot(sessionId, testcaseId, 'Launching browser in headed mode...', 'INFO', 'STATUS');
        
        browser = await chromium.launch({
            headless: false, // Important: Run in headed mode for debugging
            slowMo: 500, // Slow down operations for better visibility
            devtools: true, // Open dev tools
            args: [
                '--start-maximized',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        // Store browser reference for cleanup
        const session = activeSessions.get(sessionId);
        if (session) {
            session.browser = browser;
        }
        
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        
        page = await context.newPage();
        
        // Setup console log capture
        setupConsoleCapture(page, sessionId, testcaseId);
        
        // Setup network monitoring
        setupNetworkMonitoring(page, sessionId, testcaseId);
        
        // Setup error handling
        setupErrorHandling(page, sessionId, testcaseId);
        
        // Read and execute the test script
        const scriptPath = path.join(SCRIPTS_DIR, fileName);
        let scriptContent;
        
        // Try to read from scripts directory first, then from tests directory
        try {
            scriptContent = await fs.readFile(scriptPath, 'utf8');
        } catch (error) {
            // Fallback to tests directory
            const testPath = path.join(TESTS_DIR, fileName);
            scriptContent = await fs.readFile(testPath, 'utf8');
        }
        
        await sendMessageToSpringBoot(sessionId, testcaseId, `Executing test script: ${fileName}`, 'INFO', 'STATUS');
        
        // Execute the script with enhanced logging
        await executeScriptWithLogging(page, scriptContent, sessionId, testcaseId);
        
        await sendMessageToSpringBoot(sessionId, testcaseId, 'Test execution completed successfully', 'INFO', 'STATUS');
        
        // Keep browser open for debugging (don't close automatically)
        await sendMessageToSpringBoot(sessionId, testcaseId, 'Browser kept open for debugging. Close manually when done.', 'INFO', 'STATUS');
        
        return { success: true };
        
    } catch (error) {
        console.error('Script execution error:', error);
        await sendMessageToSpringBoot(sessionId, testcaseId, `Script execution failed: ${error.message}`, 'ERROR', 'STATUS');
        
        if (browser) {
            await browser.close();
        }
        
        throw error;
    }
}

function setupConsoleCapture(page, sessionId, testcaseId) {
    page.on('console', async (msg) => {
        const type = msg.type();
        const text = msg.text();
        const location = msg.location();
        
        // Map console types to our log levels
        const levelMap = {
            'log': 'INFO',
            'info': 'INFO',
            'warn': 'WARN',
            'error': 'ERROR',
            'debug': 'DEBUG'
        };
        
        const level = levelMap[type] || 'INFO';
        
        // Format message with location info
        const formattedMessage = location.url && location.lineNumber 
            ? `${text} (${location.url}:${location.lineNumber})`
            : text;
        
        console.log(`[${sessionId}] Console ${type}:`, formattedMessage);
        
        await sendMessageToSpringBoot(
            sessionId, 
            testcaseId, 
            formattedMessage, 
            level, 
            'CONSOLE_LOG',
            { 
                consoleType: type,
                location: location,
                args: msg.args().length 
            }
        );
    });
}

function setupNetworkMonitoring(page, sessionId, testcaseId) {
    page.on('request', async (request) => {
        const message = `→ ${request.method()} ${request.url()}`;
        console.log(`[${sessionId}] Network Request:`, message);
        
        await sendMessageToSpringBoot(
            sessionId, 
            testcaseId, 
            message, 
            'INFO', 
            'NETWORK_REQUEST',
            {
                method: request.method(),
                url: request.url(),
                headers: request.headers()
            }
        );
    });
    
    page.on('response', async (response) => {
        const message = `← ${response.status()} ${response.url()}`;
        console.log(`[${sessionId}] Network Response:`, message);
        
        await sendMessageToSpringBoot(
            sessionId, 
            testcaseId, 
            message, 
            response.status() >= 400 ? 'ERROR' : 'INFO', 
            'NETWORK_RESPONSE',
            {
                status: response.status(),
                statusText: response.statusText(),
                url: response.url(),
                headers: response.headers()
            }
        );
    });
}

function setupErrorHandling(page, sessionId, testcaseId) {
    page.on('pageerror', async (error) => {
        const message = `Page Error: ${error.message}`;
        console.error(`[${sessionId}] Page Error:`, error);
        
        await sendMessageToSpringBoot(
            sessionId, 
            testcaseId, 
            message, 
            'ERROR', 
            'PAGE_ERROR',
            {
                stack: error.stack,
                name: error.name
            }
        );
    });
    
    page.on('crash', async () => {
        const message = 'Page crashed';
        console.error(`[${sessionId}] Page Crash`);
        
        await sendMessageToSpringBoot(
            sessionId, 
            testcaseId, 
            message, 
            'ERROR', 
            'PAGE_CRASH'
        );
    });
}

async function executeScriptWithLogging(page, scriptContent, sessionId, testcaseId) {
    // Parse the script to extract individual steps
    const lines = scriptContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line && !line.startsWith('//') && !line.startsWith('const') && !line.startsWith('import')) {
            try {
                await sendMessageToSpringBoot(
                    sessionId, 
                    testcaseId, 
                    `Executing: ${line}`, 
                    'INFO', 
                    'BROWSER_ACTION'
                );
                
                // Add delay for better visibility
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Execute the line
                await eval(`(async () => { ${line} })()`);
                
                await sendMessageToSpringBoot(
                    sessionId, 
                    testcaseId, 
                    `✓ Completed: ${line}`, 
                    'INFO', 
                    'BROWSER_ACTION'
                );
                
            } catch (error) {
                const errorMsg = `✗ Failed: ${line} - ${error.message}`;
                console.error(`[${sessionId}] Script Error:`, errorMsg);
                
                await sendMessageToSpringBoot(
                    sessionId, 
                    testcaseId, 
                    errorMsg, 
                    'ERROR', 
                    'BROWSER_ACTION',
                    { 
                        line: line,
                        lineNumber: i + 1,
                        error: error.message,
                        stack: error.stack
                    }
                );
                
                throw error;
            }
        }
    }
}

// Enhanced message sending with both methods
async function sendMessageToSpringBoot(sessionId, testcaseId, message, level, type, data = null) {
    try {
        const debugMessage = {
            type: type,
            sessionId: sessionId,
            testcaseId: testcaseId,
            message: message,
            level: level,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        await axios.post(`${SPRING_BOOT_URL}/api/debug/message`, debugMessage, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
    } catch (error) {
        console.error('Failed to send message to Spring Boot:', error.message);
    }
}

// Function to send debug messages back to Spring Boot (backward compatibility)
async function sendDebugMessage(sessionId, message, level, type) {
    try {
        const debugMessage = {
            type: type,
            sessionId: sessionId,
            message: message,
            level: level,
            timestamp: new Date().toISOString()
        };
        
        // Send to Spring Boot debug message endpoint
        await axios.post('http://localhost:8075/api/debug/message', debugMessage, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Failed to send debug message:', error.message);
    }
}

// Get test files endpoint
app.get('/test-files', async (req, res) => {
    try {
        const files = await fs.readdir(TESTS_DIR);
        const testFiles = files.filter(file => file.endsWith('.spec.js') || file.endsWith('.spec.ts'));
        res.json({ files: testFiles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete test file endpoint
app.delete('/test-files/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(TESTS_DIR, filename);
        await fs.remove(filePath);
        res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function createPlaywrightTestFile(testCode, testName) {
    // Clean the test code - remove any existing imports and test structure
    let cleanedTestCode = testCode;
    
    // Remove TypeScript imports
    cleanedTestCode = cleanedTestCode.replace(/import.*from.*['"][^'"]*['"];?\s*/g, '');
    // Remove CommonJS requires
    cleanedTestCode = cleanedTestCode.replace(/const.*require\(['"][^'"]*['"]\);?\s*/g, '');
    
    // Remove existing test structure wrappers
    cleanedTestCode = cleanedTestCode.replace(/test\.describe\(['"].*['"],\s*\(\)\s*=>\s*\{/g, '');
    cleanedTestCode = cleanedTestCode.replace(/test\(['"].*['"],\s*async\s*\(\s*\{\s*page\s*\}\s*\)\s*=>\s*\{/g, '');
    cleanedTestCode = cleanedTestCode.replace(/test\.beforeEach\(async\s*\(\s*\{\s*page\s*\}\s*\)\s*=>\s*\{[^}]*\}\);?/g, '');
    
    // Remove trailing braces and closing statements but be careful not to remove content
    cleanedTestCode = cleanedTestCode.trim();
    
    // Remove wrapping braces if they exist
    if (cleanedTestCode.startsWith('{') && cleanedTestCode.endsWith('});')) {
        cleanedTestCode = cleanedTestCode.slice(1, -3).trim();
    } else if (cleanedTestCode.endsWith('});')) {
        cleanedTestCode = cleanedTestCode.slice(0, -3).trim();
    } else if (cleanedTestCode.endsWith('}')) {
        cleanedTestCode = cleanedTestCode.slice(0, -1).trim();
    }
    
    // Add await to common Playwright methods if missing
    cleanedTestCode = cleanedTestCode.replace(/([^a-zA-Z])page\.(goto|click|fill|press|waitFor|locator)/g, '$1await page.$2');
    cleanedTestCode = cleanedTestCode.replace(/([^a-zA-Z])expect\(/g, '$1await expect(');
    
    // Handle cases where expect is already awaited
    cleanedTestCode = cleanedTestCode.replace(/await await expect\(/g, 'await expect(');
    
    // Create the complete test file with proper Playwright structure
    return `const { test, expect } = require('@playwright/test');

test.describe('${testName}', () => {
    test('${testName} - Automated Test', async ({ page }) => {
        // Set default timeout
        page.setDefaultTimeout(30000);
        
        try {
            ${cleanedTestCode}
        } catch (error) {
            console.error('Test execution failed:', error.message);
            throw error;
        }
    });
});`;
}

async function executePlaywrightTest(testFilePath, testName) {
  const absoluteTestPath = path.resolve(testFilePath);
  const testsDir   = path.dirname(absoluteTestPath);
  const baseName   = path.basename(absoluteTestPath, '.spec.js');
  const folderPath = path.join(testsDir, baseName);
  let runPath = path.relative(process.cwd(), folderPath).replace(/\\/g, '/');
  if (!runPath.startsWith('./') && !runPath.startsWith('../')) {
    runPath = `./${runPath}`;
  }

  const command = `npx playwright test "${runPath}"`;
  console.log(`Executing: ${command}`);

  return new Promise((resolve) => {
    const start = Date.now();
    exec(command, { cwd: process.cwd(), timeout: 120000, env: { ...process.env, NODE_ENV: 'test' } },
      (err, stdout, stderr) => {
        const duration = Date.now() - start;
        const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        
        console.log('Raw test output:', output);
        console.log('Exit code:', err?.code);
        
        // Primary success check: exit code 0 means success
        let success = !err || err.code === 0;
        
        // Secondary check: parse output for test results
        let passed = 0, failed = 0;
        
        // Try to extract test results from output using regex patterns
        const passedMatch = output.match(/(\d+)\s+passed/i);
        const failedMatch = output.match(/(\d+)\s+failed/i);
        
        if (passedMatch) {
          passed = parseInt(passedMatch[1], 10);
        }
        if (failedMatch) {
          failed = parseInt(failedMatch[1], 10);
        }
        
        // Look for checkmark pattern (✓) to count passed tests if regex above fails
        if (passed === 0) {
          const checkmarks = (output.match(/✓/g) || []).length;
          if (checkmarks > 0) {
            passed = checkmarks;
          }
        }
        
        // Look for cross/x pattern to count failed tests
        const crosses = (output.match(/✗|×/g) || []).length;
        if (crosses > 0) {
          failed = crosses;
        }
        
        // Final success determination
        if (passed > 0 && failed === 0) {
          success = true;
        } else if (failed > 0) {
          success = false;
        }
        // If we can't determine from output, rely on exit code
        
        console.log(`Test results: ${passed} passed, ${failed} failed, success: ${success}`);
        
        // Try to extract JSON report for detailed results
        let details = null;
        try {
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            details = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.warn('JSON parse failed:', e.message);
        }
        
        const message = `Test completed: ${passed} passed, ${failed} failed`;
        
        resolve({
          success,
          message,
          output,
          exitCode: err?.code ?? 0,
          executionTime: duration,
          detailedResults: details,
          testStats: {
            passed,
            failed,
            total: passed + failed
          }
        });
      }
    );
  });
}

// Clean up function for graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Cleaning up debug sessions...');
    
    // Clean up standard debug sessions
    for (const [sessionId, process] of debugSessions) {
        process.kill('SIGTERM');
        console.log(`Killed debug session: ${sessionId}`);
    }
    debugSessions.clear();
    
    // Clean up enhanced debug sessions
    for (const [sessionId, session] of activeSessions.entries()) {
        if (session.browser) {
            try {
                await session.browser.close();
                console.log(`Closed browser for session: ${sessionId}`);
            } catch (error) {
                console.error(`Error closing browser for session ${sessionId}:`, error);
            }
        }
    }
    activeSessions.clear();
});

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Enhanced shutdown handler
process.on('SIGINT', async () => {
    console.log('Shutting down enhanced debug service...');
    
    // Close all active browsers
    for (const [sessionId, session] of activeSessions.entries()) {
        if (session.browser) {
            try {
                await session.browser.close();
                console.log(`Closed browser for session: ${sessionId}`);
            } catch (error) {
                console.error(`Error closing browser for session ${sessionId}:`, error);
            }
        }
    }
    
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Enhanced Playwright Execution Service running on port ${PORT}`);
    console.log(`Spring Boot URL: ${SPRING_BOOT_URL}`);
    console.log(`Test files directory: ${TESTS_DIR}`);
    console.log(`Results directory: ${RESULTS_DIR}`);
    console.log(`Scripts directory: ${SCRIPTS_DIR}`);
    console.log(`Node.js version: ${process.version}`);
    console.log(`Current working directory: ${process.cwd()}`);
    
    // Check if Playwright is installed
    exec('npx playwright --version', (error, stdout, stderr) => {
        if (error) {
            console.warn('Playwright might not be installed. Run: npm install @playwright/test');
        } else {
            console.log(`Playwright version: ${stdout.trim()}`);
        }
    });
});