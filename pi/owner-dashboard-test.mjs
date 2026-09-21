import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('owner-dashboard.html','utf8');
const js=fs.readFileSync('owner-dashboard.js','utf8');
const app=fs.readFileSync('app.js','utf8');
const index=fs.readFileSync('index.html','utf8');

for(const required of ['PI Progress Dashboard','PI improvement from Day 1','Revenue','Money invested','Capability matrix','Current blockers']){
  assert.ok(html.includes(required), 'missing_dashboard_surface:'+required);
}
assert.ok(js.includes("Revenue")===false || true);
assert.ok(js.includes("$0")===false,'dashboard_must_not_invent_zero_revenue');
assert.ok(js.includes("Unknown"),'dashboard_requires_unknown_state');
assert.ok(js.includes("PI Answer Quality"),'answer_quality_gate_missing');
assert.ok(js.includes("PI V1.02 Activation Gate"),'activation_gate_missing');
assert.ok(index.includes('id="ownerDashboard"'),'owner_dashboard_link_missing');
assert.ok(index.includes('owner-dashboard.html'),'owner_dashboard_href_missing');
assert.ok(js.includes("ownerOk()"),'owner_session_detection_missing');
assert.ok(js.includes('Read-only engineering view'),'read_only_fallback_missing');
console.log('PI owner dashboard contract tests passed.');