const REPO='pisolutions9/Pisolutions9';
const API='https://api.github.com/repos/'+REPO;
const $=id=>document.getElementById(id);
let refreshTimer=null;

async function gh(path){
  const r=await fetch(API+path,{headers:{accept:'application/vnd.github+json'}});
  if(!r.ok)throw new Error('github_'+r.status);
  return r.json();
}
function dayKey(value){return new Date(value).toISOString().slice(0,10);}
function stateForRun(run){
  if(!run)return '';
  if(['queued','pending','in_progress','waiting'].includes(run.status))return 'working';
  if(run.conclusion==='success')return 'good';
  if(run.conclusion==='failure')return 'bad';
  if(run.conclusion==='cancelled')return 'warn';
  return '';
}
function item(parent,title,detail,state=''){
  const row=document.createElement('div');row.className='feed-item '+state;
  const left=document.createElement('div');
  const h=document.createElement('strong');h.textContent=title;
  const p=document.createElement('span');p.textContent=detail;
  left.append(h,p);
  row.append(left);parent.append(row);
}
function clearAnd(parentId){const el=$(parentId);el.replaceChildren();return el;}
function humanTime(value){
  const d=new Date(value);if(Number.isNaN(d.getTime()))return '';
  return d.toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}
function latestByName(runs){
  const map=new Map();
  for(const run of runs)if(!map.has(run.name))map.set(run.name,run);
  return map;
}
async function load(){
  $('refresh').disabled=true;
  $('modeNotice').textContent='Refreshing verified PI activity…';
  try{
    const [commits,issues,runData]=await Promise.all([
      gh('/commits?per_page=60'),
      gh('/issues?state=all&per_page=100'),
      gh('/actions/runs?per_page=100')
    ]);
    const runs=runData.workflow_runs||[];
    const realIssues=issues.filter(i=>!i.pull_request);
    const today=dayKey(new Date());
    $('todayDate').textContent=today;

    const todayCommits=commits.filter(c=>dayKey(c.commit.author?.date||c.commit.committer?.date)===today);
    const todayFixed=realIssues.filter(i=>i.closed_at&&dayKey(i.closed_at)===today);
    const todayRuns=runs.filter(r=>dayKey(r.created_at)===today&&r.status==='completed');
    const todayPassed=todayRuns.filter(r=>r.conclusion==='success');
    const todayFailed=todayRuns.filter(r=>r.conclusion==='failure');
    $('commitsToday').textContent=todayCommits.length;
    $('issuesFixedToday').textContent=todayFixed.length;
    $('ciPassedToday').textContent=todayPassed.length;
    $('ciFailedToday').textContent=todayFailed.length;

    const active=runs.filter(r=>['queued','pending','in_progress','waiting'].includes(r.status));
    const latest=latestByName(runs);
    const activation=latest.get('PI V1.02 Activation Gate');
    const quality=latest.get('PI Answer Quality');
    const v102=latest.get('PI V1.02 Gate');
    const pages=latest.get('PI Pages');
    const verify=latest.get('PI Verify');

    if(active.length){
      $('krishnaStatus').textContent='WORKING';
      $('krishnaDetail').textContent=active.length+' GitHub workflow'+(active.length===1?' is':'s are')+' currently active.';
    }else if(todayFailed.length){
      $('krishnaStatus').textContent='FIXING / VERIFYING';
      $('krishnaDetail').textContent='No workflow is running this second, but failed checks remain for Krishna to fix.';
    }else{
      $('krishnaStatus').textContent='IDLE BETWEEN CYCLES';
      $('krishnaDetail').textContent='No workflow is running right now. Latest verified activity is shown below.';
    }

    const ownerBlocked=activation?.conclusion==='failure';
    if(ownerBlocked){
      $('ownerNeed').textContent='NOT NOW';
      $('ownerReason').textContent='Activation has an owner-only blocker, but Krishna can continue engineering work without you.';
    }else{
      $('ownerNeed').textContent='NO ACTION';
      $('ownerReason').textContent='No verified owner-only action is blocking current engineering work.';
    }

    const liveBox=clearAnd('liveWork');
    if(active.length){
      active.slice(0,10).forEach(r=>item(liveBox,r.name,(r.status||'active')+' · '+humanTime(r.updated_at||r.created_at),'working'));
    }else{
      item(liveBox,'No workflow running this second','PI can be between scheduled or triggered cycles. Check latest changes and release checks below.');
    }

    const blockerBox=clearAnd('blockers');
    let blockerCount=0;
    if(activation?.conclusion==='failure'){item(blockerBox,'Activation gate','Latest activation gate failed. This includes owner-auth / activation work that can remain deferred.','warn');blockerCount++;}
    if(quality?.conclusion==='failure'){item(blockerBox,'Answer quality','Latest PI Answer Quality run failed. This is engineering work for Krishna.','bad');blockerCount++;}
    if(v102?.conclusion==='failure'){item(blockerBox,'V1.02 gate','Latest V1.02 gate failed. This is not release-ready proof yet.','bad');blockerCount++;}
    if(!blockerCount)item(blockerBox,'No verified blocker in sampled gates','Latest sampled release gates do not show a failure.','good');

    const changes=clearAnd('changes');
    commits.slice(0,12).forEach(c=>item(changes,c.commit.message.split('\n')[0],humanTime(c.commit.author?.date||c.commit.committer?.date)));

    const checks=clearAnd('releaseChecks');
    const names=['PI Verify','PI Pages','PI V1.02 Gate','PI V1 Launch Gate','PI V1 Live Model Gate','PI Answer Quality','PI V1.02 Activation Gate','PI Chat Worker'];
    for(const name of names){
      const r=latest.get(name);
      if(!r)continue;
      item(checks,name,(r.conclusion||r.status)+' · '+humanTime(r.updated_at||r.created_at),stateForRun(r));
    }

    const summary=clearAnd('todaySummary');
    const summaryItems=[
      ['Commits',todayCommits.length],
      ['Issues fixed',todayFixed.length],
      ['CI passed',todayPassed.length],
      ['CI failed',todayFailed.length],
      ['Open issues',realIssues.filter(i=>i.state==='open').length],
      ['Active workflows',active.length]
    ];
    for(const [label,value] of summaryItems){
      const box=document.createElement('div');const s=document.createElement('span');s.textContent=label;const strong=document.createElement('strong');strong.textContent=value;box.append(s,strong);summary.append(box);
    }

    $('liveUpdated').textContent='Updated '+new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
    $('modeNotice').textContent='Temporary owner monitor · verified GitHub data · auto-refresh every 60 seconds.';
  }catch(e){
    $('modeNotice').textContent='Monitor data temporarily unavailable: '+e.message;
    $('krishnaStatus').textContent='UNKNOWN';
    $('krishnaDetail').textContent='Could not verify current GitHub activity.';
  }finally{
    $('refresh').disabled=false;
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(load,60000);
  }
}
$('refresh').addEventListener('click',load);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
load();