const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

const ensurePath = (target) => {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
};

const buildSummarySheet = (workbook, summary) => {
  const sheet = workbook.addWorksheet('Summary');
  sheet.columns = [
    { header: 'Execution Date', key: 'date', width: 25 },
    { header: 'Device Name', key: 'device', width: 25 },
    { header: 'Android Version', key: 'android', width: 20 },
    { header: 'Total Tests', key: 'total', width: 15 },
    { header: 'Passed', key: 'passed', width: 12 },
    { header: 'Failed', key: 'failed', width: 12 },
    { header: 'Skipped', key: 'skipped', width: 12 },
    { header: 'Pass Percentage', key: 'passRate', width: 18 },
    { header: 'Execution Duration', key: 'duration', width: 18 }
  ];
  sheet.addRow(summary);
};

const buildTestCasesSheet = (workbook, cases) => {
  const sheet = workbook.addWorksheet('Test Cases');
  sheet.columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 20 },
    { header: 'Scenario', key: 'scenario', width: 40 },
    { header: 'Device', key: 'device', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Start Time', key: 'start', width: 22 },
    { header: 'End Time', key: 'end', width: 22 },
    { header: 'Duration', key: 'duration', width: 18 }
  ];
  cases.forEach((testCase) => sheet.addRow(testCase));
};

const buildFailedTestsSheet = (workbook, failedTests) => {
  const sheet = workbook.addWorksheet('Failed Tests');
  sheet.columns = [
    { header: 'Test Name', key: 'name', width: 40 },
    { header: 'Failure Reason', key: 'reason', width: 50 },
    { header: 'Screenshot Path', key: 'screenshot', width: 50 },
    { header: 'Device', key: 'device', width: 18 },
    { header: 'Android Version', key: 'android', width: 18 },
    { header: 'Activity Name', key: 'activity', width: 30 }
  ];
  failedTests.forEach((row) => sheet.addRow(row));
};

const buildExecutionLogsSheet = (workbook, logs) => {
  const sheet = workbook.addWorksheet('Execution Logs');
  sheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Test Name', key: 'test', width: 35 },
    { header: 'Step', key: 'step', width: 35 },
    { header: 'Result', key: 'result', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 40 }
  ];
  logs.forEach((row) => sheet.addRow(row));
};

const generateExcelReport = async ({ summary, testCases, failedTests, logs }) => {
  ensurePath(config.paths.excel);
  const workbook = new ExcelJS.Workbook();
  buildSummarySheet(workbook, summary);
  buildTestCasesSheet(workbook, testCases);
  buildFailedTestsSheet(workbook, failedTests);
  buildExecutionLogsSheet(workbook, logs);

  const filePath = path.join(config.paths.excel, 'Mobile_E2E_Report.xlsx');
  await workbook.xlsx.writeFile(filePath);
  logger.info(`Excel report generated at ${filePath}`);
  return filePath;
};

module.exports = {
  generateExcelReport
};
