#!/usr/bin/env node

import { verifyProductionLock } from '../core/production-lock.js';

const report = await verifyProductionLock();
for (const check of report.checks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.path}${check.passed ? '' : ` (${check.reason})`}`);
}

if (!report.manifestComplete) console.error('FAIL Lock-Manifest ist unvollständig.');
if (!report.passed) {
  console.error('Produktionsbaseline verändert. Hashes nicht automatisch aktualisieren.');
  process.exitCode = 1;
} else {
  console.log(`Produktionsbaseline geschützt: ${report.checks.length} Dateien unverändert.`);
}
