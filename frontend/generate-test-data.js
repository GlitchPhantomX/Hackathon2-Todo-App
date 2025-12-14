// Script to generate and test with large datasets
// This script can be run to populate the database with test data for performance testing

const fs = require('fs');
const path = require('path');

// Function to generate mock tasks for testing
function generateTestTasks(count = 1000) {
  const tasks = [];
  const statuses = ['todo', 'in-progress', 'completed'];
  const titles = [
    'Implement feature', 'Fix bug', 'Refactor code', 'Write documentation',
    'Review code', 'Update dependencies', 'Add tests', 'Optimize performance',
    'Fix security issue', 'Update UI', 'Add new API endpoint', 'Deploy to production'
  ];

  const descriptions = [
    'This task requires careful implementation following the specification',
    'Fix the bug that was reported by users in production',
    'Refactor the legacy code to improve maintainability',
    'Write comprehensive documentation for the new feature',
    'Review the pull request and provide feedback',
    'Update dependencies to address security vulnerabilities',
    'Add unit and integration tests for the new functionality',
    'Optimize the performance of the critical path operations',
    'Address the security vulnerability identified in the audit',
    'Update the user interface to match the new design',
    'Add a new API endpoint to support mobile app requirements',
    'Deploy the latest changes to the production environment'
  ];

  for (let i = 0; i < count; i++) {
    tasks.push({
      id: `task-${i}`,
      title: `${titles[i % titles.length]} ${i}`,
      description: descriptions[i % descriptions.length],
      completed: Math.random() > 0.7,
      dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'test-user'
    });
  }

  return tasks;
}

// Generate test data
const largeDataset = generateTestTasks(1000); // Generate 1000 tasks

// Write to a JSON file for testing
const testDataPath = path.join(__dirname, 'test-data', 'large-dataset.json');
const testDir = path.dirname(testDataPath);

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

fs.writeFileSync(testDataPath, JSON.stringify(largeDataset, null, 2));

console.log(`Generated ${largeDataset.length} test tasks for performance testing.`);
console.log(`Data saved to: ${testDataPath}`);

// Instructions for testing
console.log(`
To test with large datasets:

1. Run the development server: npm run dev
2. Use the generated test data to populate your API/database
3. Load the tasks page and observe performance
4. Monitor browser performance tools for any bottlenecks
5. Test filtering, searching, and sorting with large datasets
6. Verify that memoization and other optimizations are working
`);