"""
Test Runner Script for SmartCrop Selenium Tests.
Interactive script to run tests with various options.
"""

import subprocess
import sys
import os
import argparse
from pathlib import Path


class TestRunner:
    """Run Selenium tests with various configurations."""
    
    def __init__(self):
        self.test_dir = Path(__file__).parent
        self.options = []
    
    def run_all_tests(self, parallel=False, workers=4, verbose=False):
        """Run all tests."""
        cmd = ["pytest"]
        
        if parallel:
            cmd.extend(["-n", str(workers)])
        
        if verbose:
            cmd.append("-v")
        
        cmd.append(str(self.test_dir))
        
        print(f"\n🚀 Running all tests{'  (parallel: ' + str(workers) + ' workers)' if parallel else ''}...")
        self._run_command(cmd)
    
    def run_smoke_tests(self, verbose=False):
        """Run only smoke tests."""
        cmd = ["pytest", "-m", "smoke"]
        
        if verbose:
            cmd.append("-v")
        
        cmd.append(str(self.test_dir))
        
        print("\n🔥 Running smoke tests...")
        self._run_command(cmd)
    
    def run_critical_tests(self, verbose=False):
        """Run only critical tests."""
        cmd = ["pytest", "-m", "critical"]
        
        if verbose:
            cmd.append("-v")
        
        cmd.append(str(self.test_dir))
        
        print("\n⚠️  Running critical tests...")
        self._run_command(cmd)
    
    def run_regression_tests(self, parallel=False, workers=4, verbose=False):
        """Run regression tests."""
        cmd = ["pytest", "-m", "regression"]
        
        if parallel:
            cmd.extend(["-n", str(workers)])
        
        if verbose:
            cmd.append("-v")
        
        cmd.append(str(self.test_dir))
        
        print("\n📊 Running regression tests...")
        self._run_command(cmd)
    
    def run_specific_test(self, test_file, verbose=False):
        """Run specific test file."""
        test_path = self.test_dir / test_file
        
        if not test_path.exists():
            print(f"❌ Test file not found: {test_file}")
            return
        
        cmd = ["pytest", str(test_path)]
        
        if verbose:
            cmd.append("-v")
        
        print(f"\n🧪 Running {test_file}...")
        self._run_command(cmd)
    
    def run_tests_with_report(self, report_type="html"):
        """Run tests with report generation."""
        cmd = ["pytest", str(self.test_dir)]
        
        if report_type == "html":
            cmd.extend(["--html=reports/report.html", "--self-contained-html"])
        elif report_type == "coverage":
            cmd.extend(["--cov=tests", "--cov-report=html", "--cov-report=term"])
        
        print(f"\n📈 Running tests with {report_type} report...")
        self._run_command(cmd)
    
    def run_tests_with_browser(self, browser="chrome", headless=True):
        """Run tests with specific browser."""
        cmd = ["pytest", f"--browser={browser}"]
        
        if not headless:
            cmd.append("--headless=false")
        
        cmd.append(str(self.test_dir))
        
        print(f"\n🌐 Running tests with {browser} (headless={headless})...")
        self._run_command(cmd)
    
    def run_by_marker(self, marker, verbose=False):
        """Run tests by marker."""
        cmd = ["pytest", "-m", marker]
        
        if verbose:
            cmd.append("-v")
        
        cmd.append(str(self.test_dir))
        
        print(f"\n🏷️  Running tests marked as '{marker}'...")
        self._run_command(cmd)
    
    def _run_command(self, cmd):
        """Execute command."""
        try:
            result = subprocess.run(cmd, cwd=str(self.test_dir))
            return result.returncode
        except FileNotFoundError:
            print("❌ pytest not found. Install with: pip install -r requirements.txt")
            sys.exit(1)
    
    def show_menu(self):
        """Show interactive menu."""
        while True:
            print("\n" + "="*50)
            print("🌾 SmartCrop Selenium Test Runner")
            print("="*50)
            print("1. Run all tests")
            print("2. Run all tests (parallel)")
            print("3. Run smoke tests")
            print("4. Run critical tests")
            print("5. Run regression tests")
            print("6. Run specific test file")
            print("7. Run tests by marker")
            print("8. Run with HTML report")
            print("9. Run with coverage report")
            print("10. Run with different browser")
            print("11. List available test files")
            print("0. Exit")
            print("="*50)
            
            choice = input("Select option (0-11): ").strip()
            
            if choice == "0":
                print("👋 Goodbye!")
                break
            elif choice == "1":
                self.run_all_tests(verbose=True)
            elif choice == "2":
                workers = input("Number of parallel workers (default 4): ").strip() or "4"
                self.run_all_tests(parallel=True, workers=int(workers), verbose=True)
            elif choice == "3":
                self.run_smoke_tests(verbose=True)
            elif choice == "4":
                self.run_critical_tests(verbose=True)
            elif choice == "5":
                self.run_regression_tests(verbose=True)
            elif choice == "6":
                test_file = input("Enter test file name (e.g., test_dashboard.py): ").strip()
                self.run_specific_test(test_file, verbose=True)
            elif choice == "7":
                marker = input("Enter marker name (e.g., smoke, critical, ui): ").strip()
                self.run_by_marker(marker, verbose=True)
            elif choice == "8":
                self.run_tests_with_report("html")
            elif choice == "9":
                self.run_tests_with_report("coverage")
            elif choice == "10":
                browser = input("Enter browser (chrome/edge, default chrome): ").strip() or "chrome"
                headless = input("Headless mode? (y/n, default y): ").strip().lower() != "n"
                self.run_tests_with_browser(browser, headless)
            elif choice == "11":
                self.list_test_files()
            else:
                print("❌ Invalid option. Try again.")
    
    def list_test_files(self):
        """List available test files."""
        test_files = sorted(self.test_dir.glob("test_*.py"))
        
        if not test_files:
            print("❌ No test files found.")
            return
        
        print("\n📋 Available test files:")
        for i, test_file in enumerate(test_files, 1):
            print(f"  {i}. {test_file.name}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="SmartCrop Selenium Test Runner"
    )
    parser.add_argument(
        "--mode",
        choices=["interactive", "all", "smoke", "critical", "regression"],
        default="interactive",
        help="Test mode"
    )
    parser.add_argument(
        "--parallel",
        action="store_true",
        help="Run tests in parallel"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Number of parallel workers"
    )
    parser.add_argument(
        "--browser",
        choices=["chrome", "edge"],
        default="chrome",
        help="Browser to use"
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        default=True,
        help="Run in headless mode"
    )
    parser.add_argument(
        "--report",
        choices=["html", "coverage", "none"],
        default="none",
        help="Generate report"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Verbose output"
    )
    
    args = parser.parse_args()
    runner = TestRunner()
    
    if args.mode == "interactive":
        runner.show_menu()
    elif args.mode == "all":
        runner.run_all_tests(
            parallel=args.parallel,
            workers=args.workers,
            verbose=args.verbose
        )
    elif args.mode == "smoke":
        runner.run_smoke_tests(verbose=args.verbose)
    elif args.mode == "critical":
        runner.run_critical_tests(verbose=args.verbose)
    elif args.mode == "regression":
        runner.run_regression_tests(
            parallel=args.parallel,
            workers=args.workers,
            verbose=args.verbose
        )
    
    if args.report != "none":
        runner.run_tests_with_report(args.report)


if __name__ == "__main__":
    # If no arguments, show interactive menu
    if len(sys.argv) == 1:
        TestRunner().show_menu()
    else:
        main()
