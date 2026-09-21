import assert from 'node:assert/strict';
import { createExecutionPolicy, normalizeToolRisk } from './policy.mjs';

const policy = createExecutionPolicy({ allowedTools:['read','write','charge'] });

const read = policy.checkAction({
  tool:'read',
  risk:{ readOnly:true, retrySafe:true, idempotent:true }
});
assert.equal(read.ok,true);
assert.equal(read.risk.ownerRequired,false);
assert.equal(policy.recoveryPolicy({tool:'read',risk:{readOnly:true}}).retryAllowed,true);

const write = policy.checkAction({
  tool:'write',
  risk:{ externalSideEffect:true, idempotent:true, verificationRequired:true }
});
assert.equal(write.ok,true);
assert.equal(policy.recoveryPolicy({tool:'write',risk:{externalSideEffect:true,idempotent:true}}).retryAllowed,true);

const charge = policy.checkAction({
  tool:'charge',
  risk:{ spendsMoney:true, externalSideEffect:true }
});
assert.equal(charge.ok,false);
assert.equal(charge.reason,'human_approval_required');
assert.equal(charge.risk.ownerRequired,true);
assert.equal(policy.recoveryPolicy({tool:'charge',risk:{spendsMoney:true}}).retryAllowed,false);

const destructive = normalizeToolRisk({tool:'write',risk:{destructive:true,irreversible:true}});
assert.equal(destructive.ownerRequired,true);

assert.equal(policy.checkAction({
  tool:'charge',
  risk:{spendsMoney:true},
  approved:true
}).ok,true);

console.log('PI tool-risk policy tests passed.');
