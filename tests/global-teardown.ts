import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🏁 Completing Mahjong Trainer Testing Suite');
  
  // Generate test summary report
  const fs = require('fs');
  const path = require('path');
  
  try {
    const resultsPath = 'test-results/results.json';
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      console.log('\n📊 Test Results Summary:');
      console.log(`✅ Passed: ${results.stats?.passed || 0} tests`);
      console.log(`❌ Failed: ${results.stats?.failed || 0} tests`);
      console.log(`⏭️  Skipped: ${results.stats?.skipped || 0} tests`);
      console.log(`⏱️  Duration: ${Math.round((results.stats?.duration || 0) / 1000)}s`);
      
      // Check for visual regression failures
      if (results.suites) {
        const visualTests = results.suites.find((s: any) => s.title.includes('Visual'));
        if (visualTests && visualTests.specs) {
          const failedVisual = visualTests.specs.filter((spec: any) => 
            spec.tests.some((test: any) => test.status === 'failed')
          );
          
          if (failedVisual.length > 0) {
            console.log(`🎨 Visual regression failures detected: ${failedVisual.length}`);
            console.log('📸 Check visual comparison reports in test-results/html-report');
          }
        }
      }
      
      // Performance metrics summary
      const perfDir = 'test-results/performance-metrics';
      if (fs.existsSync(perfDir)) {
        const perfFiles = fs.readdirSync(perfDir);
        if (perfFiles.length > 0) {
          console.log(`📈 Performance metrics captured: ${perfFiles.length} files`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Could not generate test summary:', error);
  }
  
  console.log('\n🀄 Mahjong Trainer Premium Testing Complete!');
  console.log('🎯 Ready for production-level gaming experience');
}

export default globalTeardown;