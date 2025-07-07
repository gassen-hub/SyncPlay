const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec, spawn } = require('child_process');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Store active debug sessions
const debugSessions = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Directories
const TESTS_DIR = path.join(__dirname, 'generated-tests');
const RESULTS_DIR = path.join(__dirname, 'test-results');

// Ensure directories exist
fs.ensureDirSync(TESTS_DIR);
fs.ensureDirSync(RESULTS_DIR);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
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

// DEBUG ENDPOINTS - NEW INTEGRATION
// Debug execution endpoint
app.post('/debug/execute', async (req, res) => {
    const { fileName, sessionId, testcaseId, mode } = req.body;
    
    try {
        console.log(`Starting debug execution for session: ${sessionId}, file: ${fileName}`);
        
        // Send initial status to Spring Boot
        await sendDebugMessage(sessionId, 'Test execution starting...', 'INFO', 'STATUS');
        
        const testFilePath = path.join(TESTS_DIR, fileName);
        
        // Check if file exists
        if (!await fs.pathExists(testFilePath)) {
            throw new Error(`Test file not found: ${fileName}`);
        }
        const playwrightProcess = spawn('npx.cmd', [
  'playwright', 'test',
  fileName,            // e.g. "lo.spec.js"
  '--headed',
  '--reporter=line',
  '--workers=1'
], {
  cwd: TESTS_DIR,      // run inside generated‑tests
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
            sessionId: sessionId
        });
        
    } catch (error) {
        console.error('Debug execution error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Stop debug session endpoint
app.post('/debug/stop', (req, res) => {
    const { sessionId } = req.body;
    
    const process = debugSessions.get(sessionId);
    if (process) {
        process.kill('SIGTERM');
        debugSessions.delete(sessionId);
        
        sendDebugMessage(sessionId, 'Debug session stopped by user', 'INFO', 'STATUS');
        
        res.json({
            success: true,
            message: 'Debug session stopped'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Debug session not found'
        });
    }
});

// Function to send debug messages back to Spring Boot
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
process.on('SIGTERM', () => {
    console.log('Cleaning up debug sessions...');
    for (const [sessionId, process] of debugSessions) {
        process.kill('SIGTERM');
        console.log(`Killed debug session: ${sessionId}`);
    }
    debugSessions.clear();
});

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
    console.log(`Playwright Execution Service running on port ${PORT}`);
    console.log(`Test files directory: ${TESTS_DIR}`);
    console.log(`Results directory: ${RESULTS_DIR}`);
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