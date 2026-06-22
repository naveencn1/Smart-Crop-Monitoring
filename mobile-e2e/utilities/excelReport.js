import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import logger from './logger.js';

export class ExcelReport {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.excelDir = 'excel';
    
    // Ensure output folder exists
    if (!fs.existsSync(this.excelDir)) {
      fs.mkdirSync(this.excelDir, { recursive: true });
    }

    this.summarySheet = null;
    this.testCasesSheet = null;
    this.failedTestsSheet = null;
    this.executionLogsSheet = null;

    this.tests = [];
    this.logs = [];
    this.deviceDetails = { name: 'Android Device', version: '11.0' };
  }

  setDeviceDetails(name, version) {
    this.deviceDetails = { name, version };
  }

  addTest(test) {
    this.tests.push({
      id: test.id || `TC_${this.tests.length + 1}`,
      module: test.module || 'General',
      scenario: test.scenario || 'E2E Scenario',
      device: this.deviceDetails.name,
      version: this.deviceDetails.version,
      status: test.status || 'Passed',
      startTime: test.startTime || new Date(),
      endTime: test.endTime || new Date(),
      duration: test.duration || 0,
      failureReason: test.failureReason || '',
      screenshotPath: test.screenshotPath || '',
      activityName: test.activityName || '',
      stackTrace: test.stackTrace || ''
    });
  }

  addLog(timestamp, testName, step, result, remarks = '') {
    this.logs.push({
      timestamp: timestamp || new Date().toISOString(),
      testName: testName || 'Global Setup',
      step,
      result,
      remarks
    });
  }

  async generateReport() {
    logger.info('Compiling test results and generating ExcelJS Workbook...');

    // Initialize workbook worksheets
    this.summarySheet = this.workbook.addWorksheet('Summary');
    this.testCasesSheet = this.workbook.addWorksheet('Test Cases');
    this.failedTestsSheet = this.workbook.addWorksheet('Failed Tests');
    this.executionLogsSheet = this.workbook.addWorksheet('Execution Logs');

    // 1. Setup Styles
    const headerStyle = {
      font: { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }, // Steel blue
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        bottom: { style: 'medium', color: { argb: 'FF1F4E78' } }
      }
    };

    const borderStyle = {
      top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
    };

    // 2. Populate Sheet 1 - Summary
    this.summarySheet.columns = [
      { header: 'Execution Date', key: 'execDate', width: 22 },
      { header: 'Device Name', key: 'deviceName', width: 18 },
      { header: 'Android Version', key: 'androidVer', width: 18 },
      { header: 'Total Tests', key: 'totalTests', width: 12 },
      { header: 'Passed', key: 'passed', width: 10 },
      { header: 'Failed', key: 'failed', width: 10 },
      { header: 'Skipped', key: 'skipped', width: 10 },
      { header: 'Pass Percentage', key: 'passPercent', width: 16 },
      { header: 'Execution Duration', key: 'duration', width: 20 }
    ];

    const total = this.tests.length;
    const passed = this.tests.filter(t => t.status.toLowerCase() === 'passed').length;
    const failed = this.tests.filter(t => t.status.toLowerCase() === 'failed').length;
    const skipped = this.tests.filter(t => t.status.toLowerCase() === 'skipped').length;
    const passPercentage = total > 0 ? `${Math.round((passed / total) * 100)}%` : '0%';
    const totalDurationMs = this.tests.reduce((acc, t) => acc + t.duration, 0);
    const durationFormatted = `${(totalDurationMs / 1000).toFixed(2)}s`;

    this.summarySheet.addRow({
      execDate: new Date().toLocaleString(),
      deviceName: this.deviceDetails.name,
      androidVer: this.deviceDetails.version,
      totalTests: total,
      passed,
      failed,
      skipped,
      passPercent: passPercentage,
      duration: durationFormatted
    });

    // Style Summary Headers and Cells
    this.summarySheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
    this.summarySheet.getRow(1).height = 28;
    this.summarySheet.getRow(2).eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.border = borderStyle;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (cell.col === 8) { // Pass Percentage coloring
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: passed === total && total > 0 ? 'FF2E7D32' : 'FFC62828' } };
      }
    });
    this.summarySheet.getRow(2).height = 24;

    // 3. Populate Sheet 2 - Test Cases
    this.testCasesSheet.columns = [
      { header: 'Test ID', key: 'id', width: 12 },
      { header: 'Module', key: 'module', width: 16 },
      { header: 'Scenario', key: 'scenario', width: 32 },
      { header: 'Device', key: 'device', width: 16 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Start Time', key: 'startTime', width: 22 },
      { header: 'End Time', key: 'endTime', width: 22 },
      { header: 'Duration', key: 'duration', width: 14 }
    ];

    this.testCasesSheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
    this.testCasesSheet.getRow(1).height = 28;

    this.tests.forEach((t) => {
      const row = this.testCasesSheet.addRow({
        id: t.id,
        module: t.module,
        scenario: t.scenario,
        device: t.device,
        status: t.status,
        startTime: t.startTime.toLocaleString(),
        endTime: t.endTime.toLocaleString(),
        duration: `${(t.duration / 1000).toFixed(2)}s`
      });
      row.height = 22;
      row.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle' };
        if (cell.col === 1 || cell.col === 4 || cell.col === 5 || cell.col === 8) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Status formatting
        if (cell.col === 5) {
          if (t.status === 'Passed') {
            cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FF2E7D32' } }; // Green
          } else if (t.status === 'Failed') {
            cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFC62828' } }; // Red
          } else {
            cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFF9A825' } }; // Yellow/Orange
          }
        }
      });
    });

    // 4. Populate Sheet 3 - Failed Tests
    this.failedTestsSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Failure Reason', key: 'reason', width: 35 },
      { header: 'Screenshot Path', key: 'screenshot', width: 40 },
      { header: 'Device', key: 'device', width: 16 },
      { header: 'Android Version', key: 'version', width: 15 },
      { header: 'Activity Name', key: 'activity', width: 25 },
      { header: 'Execution Time', key: 'execTime', width: 22 },
      { header: 'Failure Details', key: 'details', width: 45 }
    ];

    this.failedTestsSheet.getRow(1).eachCell((cell) => {
      // Dark red header for failed tests
      Object.assign(cell, headerStyle);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };
    });
    this.failedTestsSheet.getRow(1).height = 28;

    const failedList = this.tests.filter(t => t.status === 'Failed');
    failedList.forEach((t) => {
      const row = this.failedTestsSheet.addRow({
        testName: t.scenario,
        reason: t.failureReason,
        screenshot: t.screenshotPath,
        device: t.device,
        version: t.version,
        activity: t.activityName,
        execTime: t.startTime.toLocaleString(),
        details: t.stackTrace
      });
      row.height = 26;
      row.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 9 };
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', wrapText: true };
        if (cell.col === 4 || cell.col === 5 || cell.col === 7) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
    });

    // 5. Populate Sheet 4 - Execution Logs
    this.executionLogsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 22 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Step', key: 'step', width: 45 },
      { header: 'Result', key: 'result', width: 14 },
      { header: 'Remarks', key: 'remarks', width: 35 }
    ];

    this.executionLogsSheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
    this.executionLogsSheet.getRow(1).height = 28;

    this.logs.forEach((l) => {
      const row = this.executionLogsSheet.addRow({
        timestamp: l.timestamp,
        testName: l.testName,
        step: l.step,
        result: l.result,
        remarks: l.remarks
      });
      row.height = 20;
      row.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 9 };
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle' };
        if (cell.col === 1 || cell.col === 4) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (cell.col === 4) {
          if (l.result.toLowerCase().includes('pass') || l.result.toLowerCase() === 'success') {
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF2E7D32' } };
          } else if (l.result.toLowerCase().includes('fail') || l.result.toLowerCase() === 'error') {
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFC62828' } };
          }
        }
      });
    });

    // Write file
    const filePath = path.join(this.excelDir, 'Mobile_E2E_Report.xlsx');
    await this.workbook.xlsx.writeFile(filePath);
    logger.info(`Excel report successfully generated at: ${filePath}`);
    return filePath;
  }
}

// Export singleton instance for easy imports across tests
export const excelReport = new ExcelReport();
export default excelReport;
