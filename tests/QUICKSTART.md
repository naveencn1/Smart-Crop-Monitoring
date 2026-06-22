"""
Quick Start Guide for SmartCrop Selenium Tests
Run this script to set up and run tests quickly.
"""

import subprocess
import sys
import platform
import os


def print_header(title):
    """Print formatted header."""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)


def run_command(cmd, description):
    """Run command and report result."""
    print(f"\n▶️  {description}...")
    result = subprocess.run(cmd, shell=True if platform.system() == "Windows" else False)
    return result.returncode == 0


def main():
    """Main quick start flow."""
    print_header("🌾 SmartCrop Monitoring - Selenium Test Suite Setup")
    
    # Check Python
    print(f"\n✓ Python version: {sys.version.split()[0]}")
    
    # Install dependencies
    print_header("Step 1: Installing Dependencies")
    if not run_command(
        f"{sys.executable} -m pip install -r requirements.txt",
        "Installing required packages"
    ):
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Verify installation
    print_header("Step 2: Verifying Installation")
    try:
        import pytest
        import selenium
        print("✓ pytest installed")
        print("✓ selenium installed")
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        sys.exit(1)
    
    # Display test statistics
    print_header("Step 3: Test Statistics")
    
    test_stats = {
        "Navigation Tests": 40,
        "Dashboard Tests": 50,
        "Detection Tests": 60,
        "Profile Tests": 80,
        "Chatbot Tests": 50,
        "Localization Tests": 40,
        "E2E Workflow Tests": 100,
    }
    
    total = 0
    for test_type, count in test_stats.items():
        print(f"  • {test_type}: {count} cases")
        total += count
    
    print(f"\n  📊 TOTAL: {total}+ comprehensive test cases")
    
    # Display quick commands
    print_header("Step 4: Quick Commands")
    
    commands = {
        "Run all tests": "pytest",
        "Run smoke tests": "pytest -m smoke",
        "Run critical tests": "pytest -m critical",
        "Run with parallel execution": "pytest -n 4",
        "Run with HTML report": "pytest --html=reports/report.html --self-contained-html",
        "Run interactive menu": f"{sys.executable} run_tests.py",
        "Run specific test file": "pytest test_dashboard.py",
    }
    
    for desc, cmd in commands.items():
        print(f"  • {desc}:")
        print(f"    → {cmd}")
    
    # Display server requirements
    print_header("Step 5: Start Backend & Frontend Servers")
    
    print("\n  Terminal 1 - Backend Server:")
    print("    cd ../backend")
    print("    pip install -r requirements.txt")
    print("    python app.py")
    print("    (Runs on http://localhost:5000)")
    
    print("\n  Terminal 2 - Frontend Server:")
    print("    cd ../frontend")
    print("    python -m http.server 8000")
    print("    (Runs on http://localhost:8000)")
    
    # Display next steps
    print_header("Step 6: Run Tests")
    
    print("\n  Option A - Interactive Mode (Recommended for first time):")
    print(f"    {sys.executable} run_tests.py")
    
    print("\n  Option B - Run All Tests:")
    print("    pytest -v")
    
    print("\n  Option C - Run Parallel (Faster):")
    print("    pytest -n auto -v")
    
    # Display file structure
    print_header("Test Framework Structure")
    
    structure = """
    tests/
    ├── conftest.py                 # Pytest configuration & fixtures
    ├── page_objects.py            # Page Object Model
    ├── test_utils.py              # Helper utilities
    ├── test_data.json             # Parameterized test data
    ├── pytest.ini                 # Pytest configuration
    ├── requirements.txt           # Python dependencies
    ├── run_tests.py               # Interactive test runner
    │
    ├── test_navigation.py         # 40+ navigation tests
    ├── test_dashboard.py          # 50+ dashboard tests
    ├── test_detection.py          # 60+ detection tests
    ├── test_profile.py            # 80+ profile tests
    ├── test_chatbot.py            # 50+ chatbot tests
    ├── test_localization.py       # 40+ localization tests
    ├── test_e2e_workflows.py      # 100+ end-to-end tests
    │
    ├── TESTING_README.md          # Detailed documentation
    └── QUICKSTART.md              # This file
    """
    
    print(structure)
    
    # Display key features
    print_header("🎯 Key Features")
    
    features = [
        "✓ 420+ comprehensive test cases",
        "✓ Page Object Model pattern",
        "✓ Parameterized data-driven tests",
        "✓ Parallel execution support (4+ workers)",
        "✓ Multiple browser support (Chrome, Edge)",
        "✓ Smoke, regression, and critical test categories",
        "✓ Detailed logging and reporting",
        "✓ Interactive test runner",
        "✓ HTML and coverage reports",
        "✓ Complete end-to-end workflows",
    ]
    
    for feature in features:
        print(f"  {feature}")
    
    # Final instructions
    print_header("⚡ Let's Get Started!")
    
    print("\n  1. Make sure backend (port 5000) and frontend (port 8000) are running")
    print("  2. Navigate to the tests directory: cd tests")
    print("  3. Run the interactive menu: python run_tests.py")
    print("  4. Select your test option")
    print("\n  Happy Testing! 🎉\n")


if __name__ == "__main__":
    main()
