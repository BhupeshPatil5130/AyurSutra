#!/usr/bin/env node

/**
 * AyurSutra API Connection Test Script
 * Tests all API endpoints and database connections for all user roles
 */

import axios from 'axios';
import chalk from 'chalk';

const API_BASE_URL = 'http://localhost:8001/api';
const DEMO_CREDENTIALS = {
  admin: { email: 'admin@panchakarma.com', password: 'demo123' },
  practitioner: { email: 'practitioner@panchakarma.com', password: 'demo123' },
  patient: { email: 'patient@panchakarma.com', password: 'demo123' }
};

class APITester {
  constructor() {
    this.tokens = {};
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow
    };
    console.log(colors[type](`[${type.toUpperCase()}] ${message}`));
  }

  async test(description, testFn) {
    try {
      this.log(`Testing: ${description}`, 'info');
      await testFn();
      this.log(`✓ ${description}`, 'success');
      this.results.passed++;
      this.results.tests.push({ description, status: 'PASSED' });
    } catch (error) {
      this.log(`✗ ${description}: ${error.message}`, 'error');
      this.results.failed++;
      this.results.tests.push({ description, status: 'FAILED', error: error.message });
    }
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }

  async testServerHealth() {
    await this.test('Server Health Check', async () => {
      const response = await this.makeRequest('GET', '/health');
      if (!response.status || response.status !== 'ok') {
        throw new Error('Server health check failed');
      }
    });
  }

  async testDemoLogins() {
    for (const role of ['admin', 'practitioner', 'patient']) {
      await this.test(`Demo Login - ${role}`, async () => {
        const response = await this.makeRequest('POST', `/auth/demo-login/${role}`);
        if (!response.success || !response.token) {
          throw new Error(`Demo login failed for ${role}`);
        }
        this.tokens[role] = response.token;
      });
    }
  }

  async testRegularLogins() {
    for (const [role, credentials] of Object.entries(DEMO_CREDENTIALS)) {
      await this.test(`Regular Login - ${role}`, async () => {
        const response = await this.makeRequest('POST', '/auth/login', credentials);
        if (!response.success || !response.token) {
          throw new Error(`Regular login failed for ${role}`);
        }
        // Store backup token
        this.tokens[`${role}_regular`] = response.token;
      });
    }
  }

  async testAuthenticatedEndpoints() {
    // Test admin endpoints
    await this.test('Admin Dashboard', async () => {
      const response = await this.makeRequest('GET', '/admin/dashboard', null, this.tokens.admin);
      if (typeof response.totalPractitioners === 'undefined') {
        throw new Error('Admin dashboard data incomplete');
      }
    });

    await this.test('Admin Notification Settings', async () => {
      const response = await this.makeRequest('GET', '/admin/notification-settings', null, this.tokens.admin);
      if (!response.success || !response.preferences) {
        throw new Error('Admin notification settings failed');
      }
    });

    // Test practitioner endpoints
    await this.test('Practitioner Profile', async () => {
      const response = await this.makeRequest('GET', '/practitioner/profile', null, this.tokens.practitioner);
      if (!response.userId) {
        throw new Error('Practitioner profile data incomplete');
      }
    });

    await this.test('Practitioner Notification Settings', async () => {
      const response = await this.makeRequest('GET', '/practitioner/notification-settings', null, this.tokens.practitioner);
      if (!response.success || !response.preferences) {
        throw new Error('Practitioner notification settings failed');
      }
    });

    // Test patient endpoints
    await this.test('Patient Profile', async () => {
      const response = await this.makeRequest('GET', '/patient/profile', null, this.tokens.patient);
      if (!response.success || !response.patient) {
        throw new Error('Patient profile data incomplete');
      }
    });

    await this.test('Patient Notification Settings', async () => {
      const response = await this.makeRequest('GET', '/patient/notification-settings', null, this.tokens.patient);
      if (!response.success || !response.preferences) {
        throw new Error('Patient notification settings failed');
      }
    });
  }

  async testNotificationEndpoints() {
    for (const role of ['admin', 'practitioner', 'patient']) {
      await this.test(`${role} Notifications List`, async () => {
        const response = await this.makeRequest('GET', `/${role}/notifications`, null, this.tokens[role]);
        if (!response.success || !Array.isArray(response.notifications)) {
          throw new Error(`${role} notifications endpoint failed`);
        }
      });
    }
  }

  async testCrossRoleAccess() {
    // Test that patient can't access admin endpoints
    await this.test('Patient Cannot Access Admin Dashboard', async () => {
      try {
        await this.makeRequest('GET', '/admin/dashboard', null, this.tokens.patient);
        throw new Error('Patient should not have access to admin dashboard');
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // This is expected - access denied
          return;
        }
        throw error;
      }
    });

    // Test that practitioner can't access patient-specific endpoints
    await this.test('Practitioner Cannot Access Patient Profile', async () => {
      try {
        await this.makeRequest('GET', '/patient/profile', null, this.tokens.practitioner);
        throw new Error('Practitioner should not have access to patient profile');
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // This is expected - access denied
          return;
        }
        throw error;
      }
    });
  }

  async testDatabaseOperations() {
    // Test creating and updating notification preferences
    await this.test('Update Admin Notification Preferences', async () => {
      const updateData = {
        email: true,
        push: false,
        sms: true,
        types: {
          appointment: true,
          reminder: false,
          billing: true,
          system: true,
          marketing: false
        }
      };
      
      const response = await this.makeRequest('PUT', '/admin/notification-settings', updateData, this.tokens.admin);
      if (!response.success) {
        throw new Error('Failed to update admin notification preferences');
      }
    });

    // Verify the update worked
    await this.test('Verify Admin Notification Preferences Update', async () => {
      const response = await this.makeRequest('GET', '/admin/notification-settings', null, this.tokens.admin);
      if (!response.success || response.preferences.push !== false || response.preferences.sms !== true) {
        throw new Error('Admin notification preferences not updated correctly');
      }
    });
  }

  async runAllTests() {
    this.log('Starting AyurSutra API Connection Tests...', 'info');
    this.log('='.repeat(50), 'info');

    try {
      // Basic connectivity tests
      await this.testServerHealth();
      
      // Authentication tests
      await this.testDemoLogins();
      await this.testRegularLogins();
      
      // Role-specific endpoint tests
      await this.testAuthenticatedEndpoints();
      
      // Notification system tests
      await this.testNotificationEndpoints();
      
      // Security tests
      await this.testCrossRoleAccess();
      
      // Database operation tests
      await this.testDatabaseOperations();

    } catch (error) {
      this.log(`Critical error during testing: ${error.message}`, 'error');
    }

    // Print summary
    this.log('='.repeat(50), 'info');
    this.log('TEST SUMMARY', 'info');
    this.log('='.repeat(50), 'info');
    this.log(`Total Tests: ${this.results.passed + this.results.failed}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    
    if (this.results.failed > 0) {
      this.log('\nFailed Tests:', 'error');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`  ✗ ${test.description}: ${test.error}`, 'error');
        });
    }

    const successRate = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
    this.log(`\nSuccess Rate: ${successRate}%`, successRate >= 90 ? 'success' : 'warning');

    if (successRate >= 90) {
      this.log('\n🎉 All systems are working correctly!', 'success');
      this.log('Your AyurSutra application is ready for use.', 'success');
    } else {
      this.log('\n⚠️  Some issues detected. Please check the failed tests above.', 'warning');
    }

    return this.results;
  }
}

// Main execution
async function main() {
  const tester = new APITester();
  
  try {
    await tester.runAllTests();
    process.exit(tester.results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nTest interrupted by user'));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default APITester;
