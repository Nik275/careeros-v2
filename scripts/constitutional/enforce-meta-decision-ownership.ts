/**
 * Constitutional Meta-Decision Ownership Enforcement
 * 
 * This script enforces the constitutional rule that only the Decision Authority
 * may perform meta-decision analysis.
 * 
 * Usage: npx ts-node scripts/constitutional/enforce-meta-decision-ownership.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BANNED_PATTERNS = [
  // Direct meta-decision logic patterns
  /new\s+DecisionReadinessEngine\s*\(/,
  /new\s+DecisionQualityEngine\s*\(/,
  /new\s+DecisionTimingEngine\s*\(/,
  /new\s+CommitmentReadinessEngine\s*\(/,
  /new\s+DecisionFragilityEngine\s*\(/,
  /new\s+DecisionRobustnessEngine\s*\(/,
  
  // Orchestration patterns
  /readinessEngine\.analyze\s*\(/,
  /qualityEngine\.analyze\s*\(/,
  /timingEngine\.analyze\s*\(/,
  
  // State determination
  /determineDecisionState\s*\(/,
  /determineRecommendedAction\s*\(/,
  /calculateReadinessScore\s*\(/,
  /calculateOverallQuality\s*\(/,
  
  // Legacy imports (outside meta-decision-engine)
  /from\s+['"]\.\.\/meta-decision-engine/,
  /from\s+['"]@\/intelligence\/meta-decision-engine/,
];

const ALLOWED_PATHS = [
  'src/intelligence/decision/',  // Constitutional Decision Authority (sole owner)
  'src/intelligence/meta-decision-engine/',  // Legacy transition code (temporary)
  '__tests__/',
  '.test.ts',
  '.migration.test.ts',
];

const REQUIRED_AUTHORITY_USAGE = [
  /DecisionAuthority\.analyzeMetaDecision\s*\(/,
  /authority\.analyzeMetaDecision\s*\(/,
  /analyzeMetaDecision\s*\(/,
];

// ============================================================================
// TYPES
// ============================================================================

interface Violation {
  file: string;
  line: number;
  pattern: string;
  context: string;
  severity: 'error' | 'warning';
}

interface EnforcementResult {
  passed: boolean;
  violations: Violation[];
  stats: {
    filesScanned: number;
    violationsFound: number;
    errors: number;
    warnings: number;
  };
}

// ============================================================================
// ENFORCEMENT LOGIC
// ============================================================================

class MetaDecisionOwnershipEnforcer {
  private violations: Violation[] = [];
  private filesScanned = 0;

  /**
   * Run enforcement check.
   */
  enforce(): EnforcementResult {
    console.log('🔍 Constitutional Meta-Decision Ownership Enforcement\n');
    console.log('Checking for ownership violations...\n');

    // Find all TypeScript files
    const files = this.findTypeScriptFiles();
    
    for (const file of files) {
      this.checkFile(file);
    }

    return {
      passed: this.violations.filter(v => v.severity === 'error').length === 0,
      violations: this.violations,
      stats: {
        filesScanned: this.filesScanned,
        violationsFound: this.violations.length,
        errors: this.violations.filter(v => v.severity === 'error').length,
        warnings: this.violations.filter(v => v.severity === 'warning').length,
      },
    };
  }

  /**
   * Find all TypeScript files to check.
   */
  private findTypeScriptFiles(): string[] {
    try {
      const result = execSync(
        'git ls-files "*.ts" | grep -E "^src/" | grep -v node_modules',
        { encoding: 'utf-8', cwd: process.cwd() }
      );
      return result.trim().split('\n').filter(f => f.length > 0);
    } catch {
      // Fallback if git command fails
      return this.walkDir('src');
    }
  }

  /**
   * Recursively walk directory.
   */
  private walkDir(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && entry.name !== 'node_modules') {
          files.push(...this.walkDir(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * Check a single file for violations.
   */
  private checkFile(file: string): void {
    // Skip allowed paths
    if (this.isAllowedPath(file)) {
      return;
    }

    this.filesScanned++;

    try {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      // Check for banned patterns
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        for (const pattern of BANNED_PATTERNS) {
          if (pattern.test(line)) {
            this.violations.push({
              file,
              line: lineNumber,
              pattern: pattern.source.substring(0, 50) + '...',
              context: line.trim().substring(0, 80),
              severity: 'error',
            });
          }
        }
      }

      // Check for direct sub-engine instantiation
      this.checkForSubEngineInstantiation(file, content);
      
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}:`, error);
    }
  }

  /**
   * Check if path is allowed (exempt from enforcement).
   */
  private isAllowedPath(file: string): boolean {
    // Normalize path for Windows compatibility
    const normalizedFile = file.replace(/\\/g, '/');
    return ALLOWED_PATHS.some(allowed => normalizedFile.includes(allowed));
  }

  /**
   * Check for sub-engine instantiation outside allowed paths.
   */
  private checkForSubEngineInstantiation(file: string, content: string): void {
    const subEnginePatterns = [
      { name: 'DecisionReadinessEngine', pattern: /new\s+DecisionReadinessEngine/ },
      { name: 'DecisionQualityEngine', pattern: /new\s+DecisionQualityEngine/ },
      { name: 'DecisionTimingEngine', pattern: /new\s+DecisionTimingEngine/ },
      { name: 'CommitmentReadinessEngine', pattern: /new\s+CommitmentReadinessEngine/ },
      { name: 'DecisionFragilityEngine', pattern: /new\s+DecisionFragilityEngine/ },
      { name: 'DecisionRobustnessEngine', pattern: /new\s+DecisionRobustnessEngine/ },
    ];

    for (const { name, pattern } of subEnginePatterns) {
      if (pattern.test(content)) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i])) {
            this.violations.push({
              file,
              line: i + 1,
              pattern: `Direct ${name} instantiation`,
              context: lines[i].trim().substring(0, 80),
              severity: 'error',
            });
          }
        }
      }
    }
  }
}

// ============================================================================
// REPORTING
// ============================================================================

function printReport(result: EnforcementResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('ENFORCEMENT REPORT');
  console.log('='.repeat(80));

  console.log(`\n📊 Statistics:`);
  console.log(`  Files Scanned: ${result.stats.filesScanned}`);
  console.log(`  Violations Found: ${result.stats.violationsFound}`);
  console.log(`  Errors: ${result.stats.errors}`);
  console.log(`  Warnings: ${result.stats.warnings}`);

  if (result.violations.length > 0) {
    console.log(`\n❌ Violations (${result.violations.length}):\n`);
    
    const errors = result.violations.filter(v => v.severity === 'error');
    const warnings = result.violations.filter(v => v.severity === 'warning');

    if (errors.length > 0) {
      console.log('Errors:');
      for (const violation of errors) {
        console.log(`  ❌ ${violation.file}:${violation.line}`);
        console.log(`     Pattern: ${violation.pattern}`);
        console.log(`     Context: ${violation.context}`);
        console.log();
      }
    }

    if (warnings.length > 0) {
      console.log('Warnings:');
      for (const violation of warnings) {
        console.log(`  ⚠️  ${violation.file}:${violation.line}`);
        console.log(`     Pattern: ${violation.pattern}`);
        console.log(`     Context: ${violation.context}`);
        console.log();
      }
    }
  }

  console.log('='.repeat(80));
  
  if (result.passed) {
    console.log('\n✅ CONSTITUTIONAL COMPLIANCE: PASSED');
    console.log('No meta-decision ownership violations found.');
    console.log('Decision Authority remains the sole owner of meta-decision behavior.\n');
    process.exit(0);
  } else {
    console.log('\n❌ CONSTITUTIONAL COMPLIANCE: FAILED');
    console.log(`${result.stats.errors} ownership violations detected.`);
    console.log('All meta-decision logic must flow through Decision Authority.\n');
    console.log('Remediation:');
    console.log('  1. Replace direct MetaDecisionEngine usage with DecisionAuthority.analyzeMetaDecision()');
    console.log('  2. Remove direct sub-engine instantiation');
    console.log('  3. Delegate all meta-decision logic to the authority\n');
    process.exit(1);
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  const enforcer = new MetaDecisionOwnershipEnforcer();
  const result = enforcer.enforce();
  printReport(result);
}

main();
