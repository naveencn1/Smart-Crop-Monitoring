const fs = require('fs');
const path = require('path');
const ExcelReportGenerator = require('./excel-report-generator');
const config = require('../config/config');

async function generateExcelReport() {
  try {
    // Ensure excel directory exists
    if (!fs.existsSync(config.paths.excel)) {
      fs.mkdirSync(config.paths.excel, { recursive: true });
    }

    // Read test results from mochawesome JSON report
    const jsonReportPath = path.join(config.paths.htmlReport, 'mochawesome.json');
    
    if (!fs.existsSync(jsonReportPath)) {
      console.log('⚠️  No test results found. Running tests first...');
      return;
    }

    const jsonReport = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
    
    // Transform mochawesome results to our format
    const testResults = [];
    
    const processTests = (tests, suite) => {
      tests.forEach(test => {
        testResults.push({
          name: test.title,
          suite: suite,
          status: test.state || (test.pass ? 'passed' : 'failed'),
          duration: test.duration,
          startTime: test.startTime || new Date().toISOString(),
          endTime: test.endTime || new Date().toISOString(),
          error: test.err ? test.err.message : '',
          stackTrace: test.err ? test.err.stack : '',
          errorType: test.err ? test.err.name : '',
          screenshots: test.screenshots || []
        });
      });
    };

    // Process all test suites
    if (jsonReport.suites && jsonReport.suites[0]) {
      const suite = jsonReport.suites[0];
      processTests(suite.tests, suite.title);
      
      // Process nested suites if any
      if (suite.suites) {
        suite.suites.forEach(nestedSuite => {
          processTests(nestedSuite.tests, nestedSuite.title);
        });
      }
    }

    // Generate Excel report
    const generator = new ExcelReportGenerator(config.paths.excel);
    const reportPath = await generator.generateReport(testResults);

    // Print summary
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    const total = testResults.length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

    console.log('\n========== TEST EXECUTION SUMMARY ==========');
    console.log(`✅ Total Tests: ${total}`);
    console.log(`✔️  Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`📁 Excel Report: ${reportPath}`);
    console.log('==========================================\n');
  };

  flatten(report);
  logs.push({
    timestamp: new Date().toISOString(),
    test: 'Report Generation',
    step: 'Parse mochawesome JSON',
    result: 'Success',
    remarks: 'Excel report generation started'
  });

  return { summary, testCases, failedTests, logs };
};

(async () => {
  try {
    if (!fs.existsSync(mochawesomeJson)) {
      throw new Error(`Mochawesome JSON not found at ${mochawesomeJson}`);
    }
    const rawReport = fs.readFileSync(mochawesomeJson, 'utf8');
    const payload = parseMochawesome(rawReport);
    await generateExcelReport(payload);
    console.log('Excel report created successfully.');
  } catch (error) {
    console.error('Excel report generation failed:', error.message);
    process.exit(1);
  }
})();
