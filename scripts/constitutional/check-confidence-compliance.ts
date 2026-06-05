/**
 * CareerOS Confidence Compliance Checker
 * 
 * Automated compliance enforcement for Confidence Authority consolidation.
 * 
 * Exit codes:
 * - 0: All checks passed
 * - 1: Violations found
 * - 2: Check error
 * 
 * @module scripts/constitutional
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// VIOLATION TYPES
// ============================================================================

interface Violation {
  type: 'enum' | 'calculator' | 'ownership' | 'duplicate';
  severity: 'error' | 'warning';
  file: string;
  line: number;
  message: string;
  code: string;
}

interface ComplianceReport {
  passed: boolean;
  violations: Violation[];
  stats: {
    filesChecked: number;
    enumsFound: number;
    calculatorsFound: number;
    ownershipViolations: number;
    duplicatesFound: number;
  };
}

// ============================================================================
// COMPLIANCE RULES
// ============================================================================

const BANNED_ENUMS = [
  'ConfidenceLevel',
  'ConfidenceEnum',
  'UNCERTAINTY',
  'RELIABILITY',
  'HIGH',
  'MEDIUM',
  'LOW',
  'VERY_HIGH',
  'VERY_LOW',
  'MODERATE',
  'STRONG',
  'WEAK',
  'UNCERTAIN',
];

const BANNED_CALCULATOR_PATTERNS = [
  /calculateConfidence\s*\(/g,
  /confidence\s*=\s*\d+\.?\d*/g,
  /confidence\s*:\s*\d+\.?\d*/g,
];

const OWNERSHIP_VIOLATION_PATTERNS = [
  /class.*Confidence.*Engine/g,
  /confidence\s*Engine/gi,
  /confidenceCalculator/gi,
  /calculateConfidenceScore/g,
];

const DUPLICATE_PATTERN = /confidence.*duplicate|duplicate.*confidence/gi;

// ============================================================================
// COMPLIANCE CHECKER
// ============================================================================

class ComplianceChecker {
  private violations: Violation[] = [];
  private filesChecked = 0;
  private enumsFound = 0;
  private calculatorsFound = 0;
  private ownershipViolations = 0;
  private duplicatesFound = 0;

  /**
   * Check a directory for compliance violations.
   */
  checkDirectory(dirPath: string): ComplianceReport {
    console.log(`\n🔍 Checking directory: ${dirPath}`);
    console.log('=' .repeat(60));

    this.scanDirectory(dirPath);

    const report: ComplianceReport = {
      passed: this.violations.filter(v => v.severity === 'error').length === 0,
      violations: this.violations,
      stats: {
        filesChecked: this.filesChecked,
        enumsFound: this.enumsFound,
        calculatorsFound: this.calculatorsFound,
        ownershipViolations: this.ownershipViolations,
        duplicatesFound: this.duplicatesFound,
      },
    };

    this.printReport(report);
    return report;
  }

  /**
   * Recursively scan directory.
   */
  private scanDirectory(dirPath: string): void {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }
        this.scanDirectory(fullPath);
      } else if (this.isCheckableFile(entry.name)) {
        this.checkFile(fullPath);
      }
    }
  }

  /**
   * Check if file should be checked.
   */
  private isCheckableFile(filename: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Check a single file for violations.
   */
  private checkFile(filePath: string): void {
    this.filesChecked++;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Skip the Confidence Authority itself
    if (filePath.includes('confidence/ConfidenceAuthority')) {
      return;
    }

    // Check for banned enums
    this.checkForEnums(filePath, lines);

    // Check for confidence calculators outside authority
    this.checkForCalculators(filePath, lines);

    // Check for ownership violations
    this.checkForOwnershipViolations(filePath, lines);

    // Check for duplicates
    this.checkForDuplicates(filePath, lines);
  }

  /**
   * Check for banned confidence enums.
   */
  private checkForEnums(filePath: string, lines: string[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const enumName of BANNED_ENUMS) {
        // Check for enum definitions
        if (line.includes(`enum ${enumName}`) || 
            line.includes(`${enumName} =`) ||
            line.includes(`type ${enumName}`)) {
          this.enumsFound++;
          this.violations.push({
            type: 'enum',
            severity: 'error',
            file: filePath,
            line: i + 1,
            message: `Banned confidence enum found: ${enumName}`,
            code: 'CONFIDENCE_ENUM_VIOLATION',
          });
        }
      }
    }
  }

  /**
   * Check for confidence calculators outside authority.
   */
  private checkForCalculators(filePath: string, lines: string[]): void {
    // Skip files that properly delegate to ConfidenceAuthority
    if (lines.some(line => 
      line.includes('ConfidenceAuthority') || 
      line.includes('getConfidenceAuthority')
    )) {
      return;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for calculation patterns
      for (const pattern of BANNED_CALCULATOR_PATTERNS) {
        if (pattern.test(line)) {
          this.calculatorsFound++;
          this.violations.push({
            type: 'calculator',
            severity: 'error',
            file: filePath,
            line: i + 1,
            message: 'Confidence calculation outside Confidence Authority',
            code: 'CONFIDENCE_CALCULATION_VIOLATION',
          });
        }
      }
    }
  }

  /**
   * Check for ownership violations (classes calculating their own confidence).
   */
  private checkForOwnershipViolations(filePath: string, lines: string[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of OWNERSHIP_VIOLATION_PATTERNS) {
        if (pattern.test(line)) {
          this.ownershipViolations++;
          this.violations.push({
            type: 'ownership',
            severity: 'error',
            file: filePath,
            line: i + 1,
            message: 'Confidence ownership violation: system calculates own confidence',
            code: 'CONFIDENCE_OWNERSHIP_VIOLATION',
          });
        }
      }
    }
  }

  /**
   * Check for duplicate confidence logic.
   */
  private checkForDuplicates(filePath: string, lines: string[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (DUPLICATE_PATTERN.test(line)) {
        this.duplicatesFound++;
        this.violations.push({
          type: 'duplicate',
          severity: 'warning',
          file: filePath,
          line: i + 1,
          message: 'Potential duplicate confidence logic',
          code: 'CONFIDENCE_DUPLICATE_WARNING',
        });
      }
    }
  }

  /**
   * Print compliance report.
   */
  private printReport(report: ComplianceReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPLIANCE REPORT');
    console.log('='.repeat(60));
    
    console.log(`\nFiles checked: ${report.stats.filesChecked}`);
    console.log(`Enums found: ${report.stats.enumsFound}`);
    console.log(`Calculators found: ${report.stats.calculatorsFound}`);
    console.log(`Ownership violations: ${report.stats.ownershipViolations}`);
    console.log(`Duplicates found: ${report.stats.duplicatesFound}`);
    
    console.log(`\nTotal violations: ${report.violations.length}`);
    console.log(`Errors: ${report.violations.filter(v => v.severity === 'error').length}`);
    console.log(`Warnings: ${report.violations.filter(v => v.severity === 'warning').length}`);

    if (report.violations.length > 0) {
      console.log('\n' + '-'.repeat(60));
      console.log('❌ VIOLATIONS');
      console.log('-'.repeat(60));

      // Group by file
      const byFile = new Map<string, Violation[]>();
      for (const v of report.violations) {
        const existing = byFile.get(v.file) ?? [];
        existing.push(v);
        byFile.set(v.file, existing);
      }

      for (const [file, violations] of byFile) {
        console.log(`\n📁 ${file}`);
        for (const v of violations) {
          const icon = v.severity === 'error' ? '❌' : '⚠️';
          console.log(`  ${icon} Line ${v.line}: [${v.code}] ${v.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    if (report.passed) {
      console.log('✅ ALL CHECKS PASSED');
    } else {
      console.log('❌ COMPLIANCE CHECK FAILED');
      console.log('Fix errors before committing.');
    }
    console.log('='.repeat(60) + '\n');
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const targetDir = args[0] ?? './src';
  
  // Check if --fix flag is present
  const shouldFix = args.includes('--fix');

  console.log('🏛️  CareerOS Constitutional Compliance Checker');
  console.log('Wave 1: Confidence Authority Consolidation\n');

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Directory not found: ${targetDir}`);
    process.exit(2);
  }

  const checker = new ComplianceChecker();
  const report = checker.checkDirectory(targetDir);

  // Exit with appropriate code
  if (report.passed) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ComplianceChecker, type ComplianceReport, type Violation };
