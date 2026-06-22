const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

class ExcelReportGenerator {
  constructor(reportDir) {
    this.reportDir = reportDir;
    this.timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    this.reportPath = path.join(reportDir, `test-report-${this.timestamp}.xlsx`);
  }

  async generateReport(testResults) {
    const workbook = new ExcelJS.Workbook();
    
    // Create worksheets
    await this.createSummarySheet(workbook, testResults);
    await this.createDetailedSheet(workbook, testResults);
    await this.createStatisticsSheet(workbook, testResults);
    await this.createTimelineSheet(workbook, testResults);
    await this.createFailuresSheet(workbook, testResults);
    
    // Save workbook
    await workbook.xlsx.writeFile(this.reportPath);
    console.log(`📊 Excel report generated: ${this.reportPath}`);
    return this.reportPath;
  }

  async createSummarySheet(workbook, testResults) {
    const worksheet = workbook.addWorksheet('Summary');
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 }
    ];

    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.status === 'passed').length;
    const failedTests = testResults.filter(t => t.status === 'failed').length;
    const skippedTests = testResults.filter(t => t.status === 'skipped').length;
    const totalDuration = testResults.reduce((sum, t) => sum + (t.duration || 0), 0);

    const summaryData = [
      { metric: 'Total Tests', value: totalTests, percentage: '100%' },
      { metric: 'Passed', value: passedTests, percentage: `${((passedTests / totalTests) * 100).toFixed(2)}%` },
      { metric: 'Failed', value: failedTests, percentage: `${((failedTests / totalTests) * 100).toFixed(2)}%` },
      { metric: 'Skipped', value: skippedTests, percentage: `${((skippedTests / totalTests) * 100).toFixed(2)}%` },
      { metric: 'Success Rate', value: `${((passedTests / totalTests) * 100).toFixed(2)}%`, percentage: '' },
      { metric: 'Total Duration (ms)', value: totalDuration, percentage: '' },
      { metric: 'Average Test Duration (ms)', value: (totalDuration / totalTests).toFixed(2), percentage: '' },
    ];

    summaryData.forEach(data => worksheet.addRow(data));

    // Style the sheet
    this.styleHeaderRow(worksheet);
    worksheet.getRow(2).font = { color: { argb: 'FF00B050' }, bold: true }; // Green for passed
    worksheet.getRow(3).font = { color: { argb: 'FFFF0000' }, bold: true }; // Red for failed
    worksheet.getRow(4).font = { color: { argb: 'FFFFFF00' }, bold: true }; // Yellow for skipped
  }

  async createDetailedSheet(workbook, testResults) {
    const worksheet = workbook.addWorksheet('Test Results');
    worksheet.columns = [
      { header: 'Test Name', key: 'name', width: 40 },
      { header: 'Suite', key: 'suite', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Duration (ms)', key: 'duration', width: 15 },
      { header: 'Start Time', key: 'startTime', width: 20 },
      { header: 'End Time', key: 'endTime', width: 20 },
      { header: 'Error Message', key: 'error', width: 50 },
      { header: 'Stack Trace', key: 'stackTrace', width: 50 }
    ];

    testResults.forEach(test => {
      worksheet.addRow({
        name: test.name,
        suite: test.suite,
        status: test.status,
        duration: test.duration,
        startTime: test.startTime,
        endTime: test.endTime,
        error: test.error,
        stackTrace: test.stackTrace
      });
    });

    // Style the sheet
    this.styleHeaderRow(worksheet);
    
    // Color code rows by status
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const status = row.getCell('status').value;
        if (status === 'passed') {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } };
        } else if (status === 'failed') {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9999' } };
        } else if (status === 'skipped') {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
        }
      }
    });
  }

  async createStatisticsSheet(workbook, testResults) {
    const worksheet = workbook.addWorksheet('Statistics');
    
    // Group by suite
    const suites = {};
    testResults.forEach(test => {
      if (!suites[test.suite]) {
        suites[test.suite] = { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 };
      }
      suites[test.suite][test.status]++;
      suites[test.suite].total++;
      suites[test.suite].duration += test.duration || 0;
    });

    worksheet.columns = [
      { header: 'Test Suite', key: 'suite', width: 30 },
      { header: 'Total Tests', key: 'total', width: 15 },
      { header: 'Passed', key: 'passed', width: 12 },
      { header: 'Failed', key: 'failed', width: 12 },
      { header: 'Skipped', key: 'skipped', width: 12 },
      { header: 'Success Rate %', key: 'successRate', width: 15 },
      { header: 'Total Duration (ms)', key: 'duration', width: 18 },
      { header: 'Avg Duration (ms)', key: 'avgDuration', width: 18 }
    ];

    Object.entries(suites).forEach(([suite, stats]) => {
      const successRate = ((stats.passed / stats.total) * 100).toFixed(2);
      worksheet.addRow({
        suite,
        total: stats.total,
        passed: stats.passed,
        failed: stats.failed,
        skipped: stats.skipped,
        successRate: `${successRate}%`,
        duration: stats.duration,
        avgDuration: (stats.duration / stats.total).toFixed(2)
      });
    });

    this.styleHeaderRow(worksheet);
  }

  async createTimelineSheet(workbook, testResults) {
    const worksheet = workbook.addWorksheet('Timeline');
    worksheet.columns = [
      { header: 'Time', key: 'time', width: 20 },
      { header: 'Event', key: 'event', width: 40 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Details', key: 'details', width: 50 }
    ];

    const sortedResults = testResults.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    sortedResults.forEach(test => {
      worksheet.addRow({
        time: test.startTime,
        event: test.name,
        status: test.status,
        details: test.error || ''
      });
    });

    this.styleHeaderRow(worksheet);
  }

  async createFailuresSheet(workbook, testResults) {
    const worksheet = workbook.addWorksheet('Failures');
    worksheet.columns = [
      { header: 'Test Name', key: 'name', width: 40 },
      { header: 'Suite', key: 'suite', width: 30 },
      { header: 'Error Type', key: 'errorType', width: 20 },
      { header: 'Error Message', key: 'error', width: 50 },
      { header: 'Stack Trace', key: 'stackTrace', width: 50 },
      { header: 'Screenshots', key: 'screenshots', width: 30 }
    ];

    const failures = testResults.filter(t => t.status === 'failed');
    
    failures.forEach(test => {
      worksheet.addRow({
        name: test.name,
        suite: test.suite,
        errorType: test.errorType,
        error: test.error,
        stackTrace: test.stackTrace,
        screenshots: test.screenshots ? test.screenshots.join(', ') : ''
      });
    });

    this.styleHeaderRow(worksheet);
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9999' } };
      }
    });
  }

  styleHeaderRow(worksheet) {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
  }
}

module.exports = ExcelReportGenerator;
