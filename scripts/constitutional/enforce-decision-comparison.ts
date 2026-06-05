/**
 * @fileoverview Decision Comparison Constitutional Enforcement
 * @module @/scripts/constitutional/enforce-decision-comparison
 * 
 * Wave 2.2 - Decision Comparison Consolidation
 * 
 * This script enforces constitutional ownership of decision comparison logic.
 * It fails CI if any new comparison logic is introduced outside the Decision Authority.
 * 
 * Constitutional Rule:
 * ONLY DecisionAuthority may create, calculate, or own decision comparison logic.
 * 
 * Usage:
 *   npx ts-node scripts/constitutional/enforce-decision-comparison.ts
 * 
 * Exit Codes:
 *   0 - All checks passed
 *   1 - Constitutional violations detected
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONSTANTS
// ============================================================================

const DECISION_AUTHORITY_PATH = 'src/intelligence/decision';
const LEGACY_ENGINES_PATH = 'src/decision-intelligence';

// Banned patterns - these indicate comparison ownership violations
const BANNED_PATTERNS = [
  // Comparison methods outside authority
  { pattern: /compare\w*\(.*options.*analyses?\)/i, name: 'comparison-method-call' },
  { pattern: /generateHeadToHead\s*\(/i, name: 'head-to-head-generation' },
  { pattern: /generateRankings?\s*\(/i, name: 'ranking-generation' },
  { pattern: /compareDimensions?\s*\(/i, name: 'dimension-comparison' },
  { pattern: /comparePair\s*\(/i, name: 'pairwise-comparison' },
  
  // Comparison engine instantiation
  { pattern: /new\s+DecisionComparisonEngine/i, name: 'engine-instantiation' },
  { pattern: /createDecisionComparisonEngine\s*\(/i, name: 'engine-creation' },
  
  // Direct dimension scoring
  { pattern: /extractDimensionScore\s*\(/i, name: 'dimension-score-extraction' },
  { pattern: /calculateDimensionSignificance\s*\(/i, name: 'dimension-significance' },
  
  // Winner determination
  { pattern: /determineWinner\s*\(/i, name: 'winner-determination' },
  { pattern: /findBestOption\s*\(/i, name: 'best-option-finding' },
];

// Allowed patterns - these are OK outside authority
const ALLOWED_PATTERNS = [
  // Test files can use legacy engines for testing
  /\.test\.ts$/,
  /\.spec\.ts$/,
  
  // Migration wrapper functions
  /@deprecated.*Decision Authority/,
  
  // References to authority
  /DecisionAuthority/,
  /createDecisionAuthority/,
  /IDecisionAuthority/,
  
  // Import statements
  /from ['"]@\/intelligence\/decision['"]/,
];

// Files that are allowed to have comparison logic (legacy migration in progress)
const LEGACY_EXCEPTIONS = [
  'src/decision-intelligence/decision-comparison-engine.ts', // Being migrated
  'src/decision-intelligence/decision-coalition-engine.ts', // Next migration target
  'src/decision-intelligence/meta-decision-engine.ts', // Future migration target
];

// ============================================================================
// TYPES
// ============================================================================

interface Violation {
  file: string;
  line: number;
  content: string;
  pattern: string;
  severity: 'error' | 'warning';
}

interface EnforcementReport {
  timestamp: string;
  totalFilesScanned: number;
  violationsFound: number;
  errors: number;
  warnings: number;
  violations: Violation[];
  complianceScore: number;
  passed: boolean;
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('='.repeat(80));
  console.log('DECISION COMPARISON CONSTITUTIONAL ENFORCEMENT');
  console.log('Wave 2.2 - Decision Comparison Consolidation');
  console.log('='.repeat(80));
  console.log();

  const report = runEnforcement();
  
  printReport(report);
  
  process.exit(report.passed ? 0 : 1);
}

function runEnforcement(): EnforcementReport {
  const violations: Violation[] = [];
  let filesScanned = 0;

  // Find all TypeScript files recursively
  const files: string[] = [];
  
  function findTsFiles(dir: string, baseDir: string = ''): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(baseDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '__tests__', '__mocks__'].includes(entry.name)) {
          findTsFiles(fullPath, relativePath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(relativePath);
      }
    }
  }
  
  if (fs.existsSync('src')) {
    findTsFiles('src', 'src');
  }

  for (const file of files) {
    const fullPath = path.resolve(file);
    
    // Skip the Decision Authority itself (it SHOULD have these patterns)
    if (file.includes(DECISION_AUTHORITY_PATH)) {
      continue;
    }
    
    // Skip allowed legacy exceptions
    if (LEGACY_EXCEPTIONS.some(exc => file.includes(exc))) {
      continue;
    }
    
    // Skip test files
    if (file.includes('.test.') || file.includes('.spec.')) {
      continue;
    }
    
    filesScanned++;
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      
      // Check for banned patterns
      for (const { pattern, name } of BANNED_PATTERNS) {
        if (pattern.test(line)) {
          // Check if this line matches any allowed patterns
          const isAllowed = ALLOWED_PATTERNS.some(allowed => allowed.test(line));
          
          if (!isAllowed) {
            violations.push({
              file,
              line: lineNumber,
              content: line.trim(),
              pattern: name,
              severity: 'error',
            });
          }
        }
      }
    }
  }

  const errors = violations.filter(v => v.severity === 'error').length;
  const warnings = violations.filter(v => v.severity === 'warning').length;
  
  // Calculate compliance score
  const violationWeight = 0.5; // Each violation reduces score by 0.5%
  const complianceScore = Math.max(0, 100 - (violations.length * violationWeight));
  
  return {
    timestamp: new Date().toISOString(),
    totalFilesScanned: filesScanned,
    violationsFound: violations.length,
    errors,
    warnings,
    violations,
    complianceScore,
    passed: errors === 0 && complianceScore >= 95,
  };
}

function printReport(report: EnforcementReport): void {
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Files Scanned: ${report.totalFilesScanned}`);
  console.log(`Violations Found: ${report.violationsFound}`);
  console.log(`Errors: ${report.errors}`);
  console.log(`Warnings: ${report.warnings}`);
  console.log(`Compliance Score: ${report.complianceScore.toFixed(1)}%`);
  console.log();

  if (report.violations.length > 0) {
    console.log('VIOLATIONS:');
    console.log('-'.repeat(80));
    
    for (const violation of report.violations) {
      console.log();
      console.log(`File: ${violation.file}:${violation.line}`);
      console.log(`Pattern: ${violation.pattern}`);
      console.log(`Severity: ${violation.severity.toUpperCase()}`);
      console.log(`Content: ${violation.content.substring(0, 100)}`);
    }
    
    console.log();
    console.log('-'.repeat(80));
  }

  console.log();
  console.log('='.repeat(80));
  
  if (report.passed) {
    console.log('✅ CONSTITUTIONAL COMPLIANCE: PASSED');
    console.log('All decision comparison logic is properly owned by Decision Authority.');
  } else {
    console.log('❌ CONSTITUTIONAL VIOLATIONS DETECTED');
    console.log('Decision comparison logic found outside Decision Authority.');
    console.log();
    console.log('REMEDIATION:');
    console.log('1. Migrate comparison logic to Decision Authority');
    console.log('2. Use delegation pattern for legacy compatibility');
    console.log('3. See docs/decision-authority/Wave2_1_Architecture.md for migration guide');
  }
  
  console.log('='.repeat(80));
}

// Run if executed directly
main();

export { runEnforcement, printReport };
export type { Violation, EnforcementReport };
