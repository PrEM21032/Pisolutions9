import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('owner-dashboard.html','utf8');
const js=fs.readFileSync('owner-dashboard.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const history=JSON.parse(fs.readFileSync('pi/owner-history.json','utf8'));

assert.ok(html.includes('Private owner monitor'),'public_owner_lock_notice_missing');
assert.ok(html.includes('disabled on the public PI website'),'public_owner_lock_missing');
assert.equal(js.trim(),'// Owner monitor intentionally disabled on public GitHub Pages.','public_owner_js_must_remain_disabled');
assert.equal(index.includes('id="ownerDashboard"'),false,'public_owner_dashboard_link_must_not_exist');

assert.equal(history.verifiedDay1.date,'2026-09-15');
assert.equal(history.verifiedDay1.commit,'20d9c93d34e2e58e569415e479144d6ab1374dfd');
assert.equal(history.verifiedDay1.message,'Build PI owner console foundation');
assert.ok(Array.isArray(history.daily) && history.daily.length >= 7,'owner_history_daily_backfill_missing');
assert.equal(history.daily[0].date,'2026-09-15');
assert.equal(history.daily[0].commits,172);
assert.ok(history.daily.some(day=>day.date==='2026-09-20' && day.workflowRuns===1568),'owner_history_workflow_backfill_missing');
assert.ok(history.limitations.some(x=>x.includes('Revenue')),'owner_history_unknown_private_metrics_not_documented');

console.log('PI private owner history and public lock contract tests passed.');
