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
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 18 },
      { header: 'Percentage', key: 'percentage', width: 18 }
    ];

    const total = this.tests.length;
    const passed = this.tests.filter(t => t.status.toLowerCase() === 'passed').length;
    const failed = this.tests.filter(t => t.status.toLowerCase() === 'failed').length;
    const skipped = this.tests.filter(t => t.status.toLowerCase() === 'skipped').length;
    const passedPercentDetailed = total > 0 ? `${((passed / total) * 100).toFixed(2)}%` : '0.00%';
    const failedPercentDetailed = total > 0 ? `${((failed / total) * 100).toFixed(2)}%` : '0.00%';
    const skippedPercentDetailed = total > 0 ? `${((skipped / total) * 100).toFixed(2)}%` : '0.00%';
    const totalDurationMs = this.tests.reduce((acc, t) => acc + t.duration, 0);
    const avgDurationMs = total > 0 ? (totalDurationMs / total).toFixed(2) : '0.00';

    this.summarySheet.addRow({ metric: 'Total Tests', value: total, percentage: '100%' });
    this.summarySheet.addRow({ metric: 'Passed', value: passed, percentage: passedPercentDetailed });
    this.summarySheet.addRow({ metric: 'Failed', value: failed, percentage: failedPercentDetailed });
    this.summarySheet.addRow({ metric: 'Skipped', value: skipped, percentage: skippedPercentDetailed });
    this.summarySheet.addRow({ metric: 'Success Rate', value: passedPercentDetailed, percentage: '' });
    this.summarySheet.addRow({ metric: 'Total Duration (ms)', value: totalDurationMs, percentage: '' });
    this.summarySheet.addRow({ metric: 'Average Test Duration', value: parseFloat(avgDurationMs), percentage: '' });

    // Style Summary Headers and Cells
    this.summarySheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
    this.summarySheet.getRow(1).height = 28;

    // Row 2: Total Tests (Green)
    this.summarySheet.getRow(2).eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF2E7D32' } };
      cell.border = borderStyle;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (cell.col === 1) cell.alignment = { horizontal: 'left', vertical: 'middle' };
    });
    this.summarySheet.getRow(2).height = 22;

    // Row 3: Passed (Red)
    this.summarySheet.getRow(3).eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFC62828' } };
      cell.border = borderStyle;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (cell.col === 1) cell.alignment = { horizontal: 'left', vertical: 'middle' };
    });
    this.summarySheet.getRow(3).height = 22;

    // Row 4: Failed (Yellow)
    this.summarySheet.getRow(4).eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFF9A825' } };
      cell.border = borderStyle;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (cell.col === 1) cell.alignment = { horizontal: 'left', vertical: 'middle' };
    });
    this.summarySheet.getRow(4).height = 22;

    // Rows 5-8: normal styling
    for (let r = 5; r <= 8; r++) {
      this.summarySheet.getRow(r).eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (cell.col === 1) cell.alignment = { horizontal: 'left', vertical: 'middle' };
      });
      this.summarySheet.getRow(r).height = 22;
    }

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
        // Status formatting (col 5 now)
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
