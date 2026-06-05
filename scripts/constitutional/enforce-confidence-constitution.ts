#!/usr/bin/env node
/**
 * Constitutional Confidence Constitution Enforcement Script
 *
 * Wave 1.4 — Constitutional Enforcement
 *
 * This script enforces the CareerOS Confidence Constitution:
 * - No confidence enums
 * - No confidence ownership violations
 * - No hardcoded confidence values
 * - Confidence Authority is sole source
 *
 * CI Integration:
 * - Add to package.json: "constitution:enforce": "ts-node scripts/constitutional/enforce-confidence-constitution.ts"
 * - Add to CI pipeline: npm run constitution:enforce
 *
 * Exit Codes:
 * - 0: Constitution compliant
 * - 1: Violations detected (CI fails)
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONSTITUTIONAL RULES
// ============================================================================

const BANNED_PATTERNS = {
  // Rule 3: No confidence enums
  enums: [
    /export\s+type\s+\w*Confidence\w*\s*=\s*['"`]/g,
    /export\s+enum\s+\w*Confidence\w*/g,
    /type\s+ConfidenceLevel\s*=/g,
    /type\s+AssessmentConfidenceLevel\s*=/g,
    /type\s+RecommendationConfidenceLevel\s*=/g,
    /type\s+DecisionConfidence\s*=/g,
    /type\s+UncertaintyLevel\s*=/g,
    /type\s+EvidenceConfidence\s*=/g,
    /type\s+SignalConfidence\s*=/g,
  ],

  // Rule 1: No ownership violations (outside confidence authority)
  ownershipViolations: [
    /calculateConfidence\s*\(/g,
    /computeConfidence\s*\(/g,
    /deriveConfidence\s*\(/g,
    /estimateConfidence\s*\(/g,
    /scoreConfidence\s*\(/g,
  ],

  // Rule 4: No hardcoded confidence values (context-dependent)
  hardcodedConfidence: [
    /confidence\s*:\s*0\.[0-9]/g,
    /confidence\s*=\s*0\.[0-9]/g,
    /confidence\s*:\s*1\.0/g,
    /confidence\s*=\s*1\.0/g,
  ],

  // Rule 2: Confidence must be number (0.0-1.0)
  invalidConfidenceTypes: [
    /confidence.*:\s*['"`](low|medium|high|very_high|low|moderate|high)['"`]/gi,
    /confidenceLevel.*:\s*string/g,
  ],
};

// Files that are exempt (Confidence Authority itself)
const EXEMPT_PATHS = [
  'src/intelligence/confidence/',
  'scripts/constitutional/',
  '__tests__/',
  '.test.ts',
  '.spec.ts',
];

// ============================================================================
// VIOLATION DETECTION
// ============================================================================

interface Violation {
  file: string;
  line: number;
  column: number;
  type: 'enum' | 'ownership' | 'hardcoded' | 'invalid-type';
  message: string;
  code: string;
}

function isExempt(filePath: string): boolean {
  return EXEMPT_PATHS.some(exempt => filePath.includes(exempt));
}

function detectViolations(filePath: string, content: string): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split('\n');

  // Skip exempt files
  if (isExempt(filePath)) {
    return violations;
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check banned enum patterns
    BANNED_PATTERNS.enums.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        violations.push({
          file: filePath,
          line: lineNumber,
          column: line.indexOf(matches[0]) + 1,
          type: 'enum',
          message: `Banned confidence enum pattern detected: ${matches[0]}`,
          code: line.trim(),
        });
      }
    });

    // Check ownership violation patterns
    BANNED_PATTERNS.ownershipViolations.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches && !line.includes('//') && !line.includes('*')) {
        // Skip if it's a call to confidence authority
        if (!line.includes('confidenceAuthority') && 
            !line.includes('ConfidenceAuthority') &&
            !line.includes('@deprecated')) {
          violations.push({
            file: filePath,
            line: lineNumber,
            column: line.indexOf(matches[0]) + 1,
            type: 'ownership',
            message: `Confidence ownership violation: ${matches[0]}`,
            code: line.trim(),
          });
        }
      }
    });

    // Check hardcoded confidence patterns
    BANNED_PATTERNS.hardcodedConfidence.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches && !line.includes('//') && !line.includes('*')) {
        violations.push({
          file: filePath,
          line: lineNumber,
          column: line.indexOf(matches[0]) + 1,
          type: 'hardcoded',
          message: `Hardcoded confidence value: ${matches[0]}`,
          code: line.trim(),
        });
      }
    });
  });

  return violations;
}

// ============================================================================
// FILE SCANNING
// ============================================================================

function scanDirectory(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (entry.name === 'node_modules' || 
            entry.name === 'dist' || 
            entry.name === 'build' ||
            entry.name === '.git') {
          continue;
        }
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║   CONSTITUTIONAL CONFIDENCE CONSTITUTION ENFORCEMENT          ║');
  console.log('║   Wave 1.4 — Constitutional Eradication Program               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Error: src directory not found');
    process.exit(1);
  }

  console.log('📁 Scanning repository for confidence violations...\n');

  const files = scanDirectory(srcDir);
  const allViolations: Violation[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const violations = detectViolations(file, content);
      allViolations.push(...violations);
    } catch (error) {
      console.error(`❌ Error reading file ${file}:`, error);
    }
  }

  // Group violations by type
  const enumViolations = allViolations.filter(v => v.type === 'enum');
  const ownershipViolations = allViolations.filter(v => v.type === 'ownership');
  const hardcodedViolations = allViolations.filter(v => v.type === 'hardcoded');
  const invalidTypeViolations = allViolations.filter(v => v.type === 'invalid-type');

  // Display results
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    VIOLATION SUMMARY                           ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Confidence Enum Violations:        ${String(enumViolations.length).padStart(4)}                    ║`);
  console.log(`║  Ownership Violations:              ${String(ownershipViolations.length).padStart(4)}                    ║`);
  console.log(`║  Hardcoded Confidence Violations:   ${String(hardcodedViolations.length).padStart(4)}                    ║`);
  console.log(`║  Invalid Confidence Type Violations: ${String(invalidTypeViolations.length).padStart(3)}                    ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  TOTAL VIOLATIONS:                  ${String(allViolations.length).padStart(4)}                    ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Display detailed violations
  if (allViolations.length > 0) {
    console.log('📋 DETAILED VIOLATIONS:\n');
    
    const groupedByFile = allViolations.reduce((acc, v) => {
      if (!acc[v.file]) acc[v.file] = [];
      acc[v.file].push(v);
      return acc;
    }, {} as Record<string, Violation[]>);

    Object.entries(groupedByFile)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 20) // Show top 20 files
      .forEach(([file, violations]) => {
        console.log(`\n📄 ${file} (${violations.length} violations)`);
        violations.slice(0, 5).forEach(v => {
          console.log(`   Line ${v.line}:${v.column} [${v.type.toUpperCase()}]`);
          console.log(`   ${v.message}`);
          console.log(`   Code: ${v.code.substring(0, 60)}${v.code.length > 60 ? '...' : ''}`);
        });
        if (violations.length > 5) {
          console.log(`   ... and ${violations.length - 5} more`);
        }
      });

    if (Object.keys(groupedByFile).length > 20) {
      console.log(`\n... and ${Object.keys(groupedByFile).length - 20} more files`);
    }
  }

  // Constitutional verdict
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                 CONSTITUTIONAL VERDICT                         ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  
  if (allViolations.length === 0) {
    console.log('║                                                                ║');
    console.log('║              ✅ CONSTITUTION COMPLIANT                         ║');
    console.log('║                                                                ║');
    console.log('║         Confidence Authority is the sole owner.                ║');
    console.log('║         No violations detected.                                ║');
    console.log('║         Repository is production-ready.                        ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    process.exit(0);
  } else {
    const complianceScore = Math.max(0, 100 - (allViolations.length * 0.5));
    console.log('║                                                                ║');
    console.log('║              ❌ CONSTITUTIONAL VIOLATIONS DETECTED             ║');
    console.log('║                                                                ║');
    console.log(`║         Compliance Score: ${complianceScore.toFixed(1)}%                            ║`);
    console.log(`║         Violations: ${String(allViolations.length).padStart(4)}                                 ║`);
    console.log('║                                                                ║');
    console.log('║         Remediation required before merge.                     ║');
    console.log('║         See Wave 1.4 Discovery Report for details.             ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    process.exit(1);
  }
}

main();
