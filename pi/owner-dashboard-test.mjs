import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('owner-dashboard.html','utf8');
const js=fs.readFileSync('owner-dashboard.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const history=JSON.parse(fs.readFileSync('pi/engineering-history.json','utf8'));

assert.ok(html.includes('Private owner monitor'),'public_owner_lock_notice_missing');
assert.ok(html.includes('disabled on the public PI website'),'public_owner_monitor_not_locked');
assert.equal(js.includes('api.github.com'),false,'public_owner_monitor_must_not_fetch_telemetry');
assert.equal(index.includes('id="ownerDashboard"'),false,'public_pi_must_not_link_owner_dashboard');

assert.equal(history.verifiedDay1.date,'2026-09-15','wrong_verified_day1');
assert.equal(history.verifiedDay1.commit,'20d9c93d34e2e58e569415e479144d6ab1374dfd','wrong_day1_commit');
assert.equal(history.scope,'public-engineering-evidence-only','history_scope_must_exclude_private_telemetry');
assert.equal(history.privacy.containsPrivateTelemetry,false,'private_telemetry_must_not_be_committed');
assert.ok(Array.isArray(history.daily) && history.daily.length >= 7,'day1_history_missing_daily_rows');
assert.equal(history.daily[0].date,'2026-09-15','history_must_start_at_day1');
assert.ok(history.totals.commits >= 683,'verified_commit_history_regressed');
assert.ok(history.totals.workflowRuns >= 5572,'verified_workflow_history_regressed');
assert.ok(history.privacy.excluded.includes('revenue'),'revenue_must_stay_out_of_public_history');
assert.ok(history.privacy.excluded.includes('secrets'),'secrets_must_stay_out_of_public_history');
assert.equal(history.backfill?.status,'complete-for-supported-public-evidence','day1_backfill_contract_incomplete');
assert.equal(history.backfill?.startsAt,'2026-09-15','day1_backfill_start_regressed');
assert.equal(history.backfill?.unavailableFields?.additions,null,'unknown_additions_must_not_be_faked');
assert.equal(history.backfill?.unavailableFields?.deletions,null,'unknown_deletions_must_not_be_faked');
assert.equal(history.backfill?.unavailableFields?.filesChanged,null,'unknown_files_changed_must_not_be_faked');
assert.ok(history.daily.every((row)=>Object.hasOwn(row,'additions') && Object.hasOwn(row,'deletions') && Object.hasOwn(row,'filesChanged')),'daily_code_volume_unknowns_must_be_explicit');
assert.equal(history.daily.at(-1).snapshotPartialDay,true,'current_snapshot_must_be_marked_partial');

console.log('PI owner privacy and Day 1 history contract tests passed.');
