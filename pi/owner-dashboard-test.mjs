import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('owner-dashboard.html','utf8');
const js=fs.readFileSync('owner-dashboard.js','utf8');
const index=fs.readFileSync('index.html','utf8');

for(const required of ['PI Owner Monitor','What is happening in PI?','KRISHNA STATUS','Live work','Blockers','Latest fixes / changes','Release checks','Today summary']){
  assert.ok(html.includes(required), 'missing_owner_monitor_surface:'+required);
}
assert.ok(js.includes("setTimeout(load,60000)"),'owner_monitor_auto_refresh_missing');
assert.ok(js.includes("PI V1.02 Activation Gate"),'activation_gate_monitor_missing');
assert.ok(js.includes("PI Answer Quality"),'answer_quality_monitor_missing');
assert.ok(js.includes("PI V1.02 Gate"),'v102_gate_monitor_missing');
assert.ok(js.includes("NOT NOW"),'owner_deferred_state_missing');
assert.ok(js.includes("NO ACTION"),'owner_no_action_state_missing');
assert.ok(index.includes('id="ownerDashboard"'),'owner_dashboard_link_missing');
assert.ok(index.includes('owner-dashboard.html'),'owner_dashboard_href_missing');
assert.equal(js.includes('$0'),false,'owner_monitor_must_not_invent_money');
console.log('PI temporary owner monitor contract tests passed.');
