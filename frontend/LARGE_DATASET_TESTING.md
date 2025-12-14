# Large Dataset Testing

## Overview
This document provides instructions for testing the application's performance with large datasets to ensure optimal performance under heavy loads.

## Test Data Generation
The `generate-test-data.js` script creates realistic test data for performance testing:

- Generates 1000 sample tasks with varied properties
- Includes different statuses, descriptions, and dates
- Creates realistic data patterns for testing

## How to Run Large Dataset Tests

### 1. Generate Test Data
```bash
node generate-test-data.js
```

This creates `test-data/large-dataset.json` with 1000 sample tasks.

### 2. Load Test Data into Your Application
You can use this test data to populate your database or API for testing purposes.

### 3. Performance Testing Steps
1. Start the application: `npm run dev`
2. Load the tasks page with the large dataset
3. Test the following scenarios:
   - Initial page load time
   - Filtering tasks (all/active/completed)
   - Searching tasks
   - Sorting tasks
   - Adding/removing tasks
   - Toggling task completion
4. Monitor browser performance tools for:
   - Memory usage
   - Rendering performance
   - JavaScript execution time
   - Component re-rendering efficiency

### 4. Expected Performance Metrics
With the optimizations implemented:
- Page should load in < 2 seconds with 1000+ tasks
- Filtering should be < 200ms
- Searching should be < 300ms
- Adding/removing tasks should be < 100ms
- Memory usage should remain stable
- No excessive re-renders of unchanged components

### 5. Optimization Features Tested
The large dataset testing verifies these performance optimizations:
- React.memo for component memoization
- Efficient API caching and deduplication
- Dynamic imports for code splitting
- Proper suspense boundaries
- Optimized rendering algorithms

## Performance Monitoring
Use browser developer tools to monitor:
- Performance tab: CPU usage, rendering times
- Memory tab: Memory leaks, usage patterns
- Network tab: API call efficiency
- React DevTools Profiler: Component rendering efficiency