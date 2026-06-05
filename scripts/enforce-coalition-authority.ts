#!/usr/bin/env tsx
/**
 * @fileoverview Wave 2.5 - Coalition Authority CI Enforcement Script
 * @module scripts/enforce-coalition-authority
 * 
 * This script enforces constitutional ownership by blocking:
 * - Local sorting in coalition-related files
 * - Local comparison in coalition-related files
 * - Local selection in coalition-related files
 * - Local arbitration in coalition-related files
 * - Local explanation generation in coalition-related files
 * - Local consensus determination in coalition-related files
 * 
 * Usage:
 *   npm run enforce:coalition
 *   npx tsx scripts/enforce-coalition-authority.ts
 * 
 * Exit Codes:
 *   0 - No violations detected
 *   1 - Violations detected, build should fail
 * 
 * @version 2.5.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.5 - Constitutional Certification
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Directories to scan
  scanDirectories: [
    'src/intelligence/decision-coalition',
    'src/intelligence/decision-coalition-v3',
    'src/intelligence/decision/coalition',
  ],
  
  // File patterns to check
  filePatterns: ['**/*.ts'],
  
  // Patterns that indicate ownership violations
  violationPatterns: {
    // Local sorting (should use DecisionAuthority.rank() or RankingAuthority)
    localSorting: [
      /\.sort\s*\([^)]*=>[^)]*score/i,
      /\.sort\s*\([^)]*=>[^)]*rank/i,
      /\.sort\s*\([^)]*=>[^)]*stability/i,
      /\.sort\s*\([^)]*=>[^)]*support/i,
      /rankByScore\s*\(/i,
      /orderBy\s*\([^)]*score/i,
    ],
    
    // Local comparison (should use DecisionAuthority.compare() or ComparisonAuthority)
    localComparison: [
      /compare\s*\([^)]*\)\s*{/i,
      /comparePairwise\s*\(/i,
      /compareTournament\s*\(/i,
      /isBetterThan\s*\(/i,
      /beats\s*\(/i,
    ],
    
    // Local selection (should use DecisionAuthority.select() or SelectionAuthority)
    localSelection: [
      /select\s*\([^)]*\)\s*{/i,
      /selectTop\s*\(/i,
      /selectWinner\s*\(/i,
      /pickBest\s*\(/i,
      /chooseWinner\s*\(/i,
      /rankedPaths\[0\]/i, // Direct array access for winner
      /ranked\[0\]/i,
    ],
    
    // Local arbitration (should use DecisionAuthority.arbitrate() or ArbitrationAuthority)
    localArbitration: [
      /arbitrate\s*\([^)]*\)\s*{/i,
      /resolveConflict\s*\(/i,
      /detectConflicts\s*\(/i,
      /resolveDispute\s*\(/i,
      /mediate\s*\(/i,
    ],
    
    // Local explanation generation (should use DecisionAuthority.explain() or ExplanationAuthority)
    localExplanation: [
      /explain\s*\([^)]*\)\s*{/i,
      /generateExplanation\s*\(/i,
      /createExplanation\s*\(/i,
      /buildRationale\s*\(/i,
      /generateReasoning\s*\(/i,
    ],
    
    // Local consensus determination (should use ArbitrationAuthority.arbitrateByConsensus())
    localConsensus: [
      /consensusLevel\s*=/i,
      /determineConsensus\s*\(/i,
      /calculateConsensus\s*\(/i,
      /unanimous|strong|moderate|weak|fractured.*consensus/i,
      /supportRatio.*>=.*0\.[0-9]+/i,
    ],
  },
  
  // Allowed patterns (false positives to ignore)
  allowedPatterns: [
    // Comments explaining the delegation
    /\/\/.*delegat/i,
    /\/\*.*delegat/i,
    // Import statements
    /import.*from.*authority/i,
    // Type definitions
    /type.*=.*Decision/i,
    // Interface definitions
    /interface.*Decision/i,
    // Test files (they test the authority)
    /\.test\.ts$/,
    /\.spec\.ts$/,
  ],
  
  // Files to exclude
  excludedFiles: [
    '**/*.d.ts',
    '**/index.ts',
    '**/__tests__/**',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface Violation {
  file: string;
  line: number;
  column: number;
  type: keyof typeof CONFIG.violationPatterns;
  pattern: RegExp;
  code: string;
  severity: 'error' | 'warning';
}

interface EnforcementReport {
  timestamp: string;
  filesScanned: number;
  violationsFound: number;
  errors: number;
  warnings: number;
  violations: Violation[];
  passed: boolean;
}

// ============================================================================
// ENFORCEMENT LOGIC
// ============================================================================

class CoalitionAuthorityEnforcer {
  private violations: Violation[] = [];
  private filesScanned = 0;

  /**
   * Main entry point for enforcement
   */
  async enforce(): Promise<EnforcementReport> {
    console.log('\n🔍 Wave 2.5 - Coalition Authority Enforcement');
    console.log('=============================================\n');

    for (const directory of CONFIG.scanDirectories) {
      await this.scanDirectory(directory);
    }

    const report = this.generateReport();
    this.printReport(report);

    return report;
  }

  /**
   * Scan a directory for violations
   */
  private async scanDirectory(directory: string): Promise<void> {
    const fullPath = path.resolve(process.cwd(), directory);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Directory not found: ${directory}`);
      return;
    }

    for (const pattern of CONFIG.filePatterns) {
      const files = await glob(path.join(directory, pattern), {
        cwd: process.cwd(),
        absolute: true,
        ignore: CONFIG.excludedFiles,
      });

      for (const file of files) {
        await this.scanFile(file);
      }
    }
  }

  /**
   * Scan a single file for violations
   */
  private async scanFile(filePath: string): Promise<void> {
    this.filesScanned++;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Skip allowed patterns
      if (this.isAllowed(line, filePath)) {
        continue;
      }

      // Check for violations
      this.checkViolations(filePath, lineNumber, line);
    }
  }

  /**
   * Check if a line matches any allowed patterns
   */
  private isAllowed(line: string, filePath: string): boolean {
    // Check if file is excluded
    for (const pattern of CONFIG.excludedFiles) {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      if (regex.test(filePath)) {
        return true;
      }
    }

    // Check allowed patterns
    for (const pattern of CONFIG.allowedPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check a line for all violation patterns
   */
  private checkViolations(filePath: string, lineNumber: number, line: string): void {
    for (const [violationType, patterns] of Object.entries(CONFIG.violationPatterns)) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          // Check if this is in a comment
          if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
            continue;
          }

          // Determine severity
          const severity = this.determineSeverity(violationType as keyof typeof CONFIG.violationPatterns, line);

          this.violations.push({
            file: path.relative(process.cwd(), filePath),
            line: lineNumber,
            column: match.index ? match.index + 1 : 1,
            type: violationType as keyof typeof CONFIG.violationPatterns,
            pattern,
            code: line.trim(),
            severity,
          });
        }
      }
    }
  }

  /**
   * Determine severity of a violation
   */
  private determineSeverity(type: keyof typeof CONFIG.violationPatterns, line: string): 'error' | 'warning' {
    // Direct method calls are errors
    if (line.includes('rankByScore') || 
        line.includes('comparePairwise') ||
        line.includes('selectTop') ||
        line.includes('rankedPaths[0]') ||
        line.includes('ranked[0]')) {
      return 'error';
    }

    // Sort operations on coalition data are errors
    if (type === 'localSorting' && 
        (line.includes('stability') || line.includes('support') || line.includes('coalition'))) {
      return 'error';
    }

    return 'warning';
  }

  /**
   * Generate enforcement report
   */
  private generateReport(): EnforcementReport {
    const errors = this.violations.filter(v => v.severity === 'error').length;
    const warnings = this.violations.filter(v => v.severity === 'warning').length;

    return {
      timestamp: new Date().toISOString(),
      filesScanned: this.filesScanned,
      violationsFound: this.violations.length,
      errors,
      warnings,
      violations: this.violations,
      passed: errors === 0,
    };
  }

  /**
   * Print enforcement report
   */
  private printReport(report: EnforcementReport): void {
    console.log(`📁 Files Scanned: ${report.filesScanned}`);
    console.log(`🚨 Violations Found: ${report.violationsFound}`);
    console.log(`❌ Errors: ${report.errors}`);
    console.log(`⚠️  Warnings: ${report.warnings}`);
    console.log('');

    if (report.violations.length > 0) {
      console.log('Violation Details:');
      console.log('------------------');

      // Group by type
      const byType = this.groupByType(report.violations);
      
      for (const [type, violations] of Object.entries(byType)) {
        console.log(`\n${type.toUpperCase()} (${violations.length}):`);
        
        // Group by file
        const byFile = this.groupByFile(violations);
        
        for (const [file, fileViolations] of Object.entries(byFile)) {
          console.log(`  📄 ${file}`);
          
          for (const v of fileViolations) {
            const icon = v.severity === 'error' ? '❌' : '⚠️';
            console.log(`    ${icon} Line ${v.line}:${v.column}: ${v.code.substring(0, 60)}${v.code.length > 60 ? '...' : ''}`);
          }
        }
      }
    }

    console.log('');
    console.log('=============================================');
    
    if (report.passed) {
      console.log('✅ BUILD PASSED - No ownership violations detected');
    } else {
      console.log('❌ BUILD FAILED - Ownership violations must be resolved');
      console.log('');
      console.log('REMEDIATION:');
      console.log('  1. Delegate sorting to DecisionAuthority.rank()');
      console.log('  2. Delegate comparison to DecisionAuthority.compare()');
      console.log('  3. Delegate selection to DecisionAuthority.select()');
      console.log('  4. Delegate arbitration to DecisionAuthority.arbitrate()');
      console.log('  5. Delegate explanation to DecisionAuthority.explain()');
      console.log('  6. Delegate consensus to ArbitrationAuthority.arbitrateByConsensus()');
    }
    
    console.log('=============================================\n');
  }

  /**
   * Group violations by type
   */
  private groupByType(violations: Violation[]): Record<string, Violation[]> {
    const grouped: Record<string, Violation[]> = {};
    
    for (const v of violations) {
      if (!grouped[v.type]) {
        grouped[v.type] = [];
      }
      grouped[v.type].push(v);
    }
    
    return grouped;
  }

  /**
   * Group violations by file
   */
  private groupByFile(violations: Violation[]): Record<string, Violation[]> {
    const grouped: Record<string, Violation[]> = {};
    
    for (const v of violations) {
      if (!grouped[v.file]) {
        grouped[v.file] = [];
      }
      grouped[v.file].push(v);
    }
    
    return grouped;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
  const enforcer = new CoalitionAuthorityEnforcer();
  const report = await enforcer.enforce();

  // Exit with appropriate code
  process.exit(report.passed ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Enforcement script failed:', error);
    process.exit(1);
  });
}

// Export for testing
export { CoalitionAuthorityEnforcer, type Violation, type EnforcementReport };
