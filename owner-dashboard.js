const REPO='pisolutions9/Pisolutions9';
const API='https://api.github.com/repos/'+REPO;
const OWNER_KEY='pi-v1-owner-session';
const WORKER='https://pi-chat.premchandyadlapati.workers.dev';

const $=id=>document.getElementById(id);
function ownerToken(){try{return sessionStorage.getItem(OWNER_KEY)||'';}catch{return '';}}
async function ownerOk(){
  const token=ownerToken();
  if(!/^[A-Za-z0-9_-]{43}$/.test(token))return false;
  try{
    const r=await fetch(WORKER+'/api/owner/status',{headers:{authorization:'Bearer '+token}});
    return r.ok;
  }catch{return false;}
}
async function gh(path){
  const r=await fetch(API+path,{headers:{accept:'application/vnd.github+json'}});
  if(!r.ok)throw new Error('github_'+r.status);
  return r.json();
}
function dayKey(value){return new Date(value).toISOString().slice(0,10);}
function inRange(date,days){
  if(days==='all')return true;
  return Date.now()-new Date(date).getTime()<=Number(days)*86400000;
}
function pct(n,d){return d?Math.round(n/d*100):0;}
function clamp(v){return Math.max(0,Math.min(100,Math.round(v)));}
function item(parent,title,detail,state=''){
  const row=document.createElement('div');row.className='feed-item '+state;
  const h=document.createElement('strong');h.textContent=title;
  const p=document.createElement('span');p.textContent=detail;
  row.append(h,p);parent.append(row);
}
function capability(parent,name,state,detail){
  const row=document.createElement('div');row.className='cap-row';
  const left=document.createElement('div');const h=document.createElement('strong');h.textContent=name;const p=document.createElement('small');p.textContent=detail;left.append(h,p);
  const badge=document.createElement('span');badge.className='cap-badge '+state.toLowerCase().replaceAll(' ','-');badge.textContent=state;
  row.append(left,badge);parent.append(row);
}
function drawTrend(points){
  const canvas=$('trend'),ctx=canvas.getContext('2d');const dpr=window.devicePixelRatio||1;
  const width=canvas.clientWidth||1200,height=canvas.clientHeight||360;
  canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,width,height);
  const pad={l:42,r:18,t:20,b:34},w=width-pad.l-pad.r,h=height-pad.t-pad.b;
  ctx.strokeStyle='rgba(130,160,200,.18)';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){const y=pad.t+h*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();}
  if(!points.length)return;
  ctx.strokeStyle='#69a9ff';ctx.lineWidth=3;ctx.beginPath();
  points.forEach((p,i)=>{const x=pad.l+(points.length===1?w/2:i*w/(points.length-1));const y=pad.t+h-(p.score/100*h);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
  ctx.stroke();
  ctx.fillStyle='#9fb0c7';ctx.font='11px system-ui';ctx.fillText('100',6,pad.t+4);ctx.fillText('0',22,pad.t+h+4);
  const first=points[0],last=points.at(-1);ctx.fillText(first.day,pad.l,pad.t+h+24);const tw=ctx.measureText(last.day).width;ctx.fillText(last.day,width-pad.r-tw,pad.t+h+24);
}
function scoreSeries(commits,issues,runs){
  const days=[...new Set([...commits.map(c=>dayKey(c.commit.author?.date||c.commit.committer?.date)),...issues.map(i=>dayKey(i.created_at)),...runs.map(r=>dayKey(r.created_at))])].sort();
  let totalCommits=0,resolved=0,totalIssues=0,completed=0,success=0,releaseEvidence=0;
  return days.map(day=>{
    totalCommits+=commits.filter(c=>dayKey(c.commit.author?.date||c.commit.committer?.date)===day).length;
    totalIssues+=issues.filter(i=>dayKey(i.created_at)===day).length;
    resolved+=issues.filter(i=>i.closed_at&&dayKey(i.closed_at)===day).length;
    const dayRuns=runs.filter(r=>dayKey(r.created_at)===day&&r.status==='completed');completed+=dayRuns.length;success+=dayRuns.filter(r=>r.conclusion==='success').length;
    releaseEvidence+=dayRuns.filter(r=>r.conclusion==='success'&&/V1\.02 Gate|V1 Launch Gate|PI Verify|Answer Quality|Chat Worker/.test(r.name)).length;
    const ci=completed?pct(success,completed):0;
    const issueResolution=totalIssues?Math.min(100,pct(resolved,totalIssues)):50;
    const delivery=Math.min(100,totalCommits*4);
    const release=Math.min(100,releaseEvidence*8);
    return{day,score:clamp(ci*.35+issueResolution*.25+delivery*.20+release*.20)};
  });
}
async function load(){
  $('authState').textContent='Checking owner session…';
  if(!(await ownerOk())){
    $('authState').innerHTML='Owner session required. <a href="./">Sign in on PI first</a>, then open the dashboard again.';
    return;
  }
  $('authState').classList.add('hidden');$('dashboard').classList.remove('hidden');
  $('refresh').disabled=true;
  try{
    const [commits,issues,runs]=await Promise.all([
      gh('/commits?per_page=100'),
      gh('/issues?state=all&per_page=100'),
      gh('/actions/runs?per_page=100').then(x=>x.workflow_runs||[])
    ]);
    const days=$('range').value;
    const filteredCommits=commits.filter(c=>inRange(c.commit.author?.date||c.commit.committer?.date,days));
    const realIssues=issues.filter(i=>!i.pull_request);
    const filteredIssues=realIssues.filter(i=>inRange(i.created_at,days)||i.closed_at&&inRange(i.closed_at,days));
    const filteredRuns=runs.filter(r=>inRange(r.created_at,days));
    const closed=filteredIssues.filter(i=>i.state==='closed');
    const open=realIssues.filter(i=>i.state==='open');
    const completed=filteredRuns.filter(r=>r.status==='completed');
    const success=completed.filter(r=>r.conclusion==='success');
    $('commits').textContent=filteredCommits.length;
    $('issuesFixed').textContent=closed.length;
    $('issuesOpen').textContent=open.length;
    $('passRate').textContent=completed.length?pct(success.length,completed.length)+'%':'Unknown';

    const series=scoreSeries(commits,realIssues,runs);
    const shown=days==='all'?series:series.filter(p=>inRange(p.day,days));
    drawTrend(shown);
    $('scoreNow').textContent=shown.length?shown.at(-1).score+'/100':'Unknown';

    const today=dayKey(new Date());
    $('todayDate').textContent=today;
    const todayBox=$('today');todayBox.replaceChildren();
    const tc=commits.filter(c=>dayKey(c.commit.author?.date||c.commit.committer?.date)===today);
    const ti=realIssues.filter(i=>i.closed_at&&dayKey(i.closed_at)===today);
    const tr=runs.filter(r=>dayKey(r.created_at)===today&&r.status==='completed');
    item(todayBox,'Commits',tc.length+' verified today');
    item(todayBox,'Issues closed',ti.length+' verified today');
    item(todayBox,'CI runs',tr.length+' completed · '+tr.filter(r=>r.conclusion==='success').length+' passed');

    const blockerBox=$('blockers');blockerBox.replaceChildren();
    const ownerAuthRun=runs.find(r=>r.name==='PI V1.02 Activation Gate');
    if(ownerAuthRun?.conclusion==='failure')item(blockerBox,'Activation gate','Latest activation gate is failing; owner-auth/production activation evidence may still be incomplete.','warn');
    const qualityRun=runs.find(r=>r.name==='PI Answer Quality');
    if(qualityRun?.conclusion==='failure')item(blockerBox,'Answer quality','Latest answer-quality gate is failing and requires engineering correction.','bad');
    if(!blockerBox.children.length)item(blockerBox,'No verified blocker detected','Latest sampled gates do not show a blocker.','good');

    const wf=$('workflows');wf.replaceChildren();
    const latestByName=new Map();
    for(const run of runs){if(!latestByName.has(run.name))latestByName.set(run.name,run);}
    [...latestByName.values()].slice(0,12).forEach(r=>item(wf,r.name,(r.conclusion||r.status)+' · '+dayKey(r.updated_at||r.created_at),r.conclusion==='success'?'good':r.conclusion==='failure'?'bad':''));
    $('workflowSummary').textContent=completed.length+' completed in range';

    const caps=$('capabilities');caps.replaceChildren();
    capability(caps,'Conversational AI','Implemented','Customer chat and provider fallback exist.');
    capability(caps,'Independent hard-answer verification','Implemented','Verifier/reviewer path exists; live quality gate still determines production reliability.');
    capability(caps,'Cross-device session continuity','Implemented','Private sync and owner workspace are implemented.');
    capability(caps,'Text → PDF','Missing','Required capability; not production-verified yet.');
    capability(caps,'Owner dashboard','Implemented','This live evidence dashboard is the first usable version; deeper telemetry remains partial.');
    capability(caps,'Revenue / profit telemetry','Blocked','Waiting for verified live billing data; no values are invented.');
    capability(caps,'Cost ledger','Missing','No independently verified operating-cost source connected yet.');

    const ms=$('milestones');ms.replaceChildren();
    filteredCommits.slice(0,20).forEach(c=>item(ms,c.commit.message.split('\n')[0],dayKey(c.commit.author?.date||c.commit.committer?.date)));
    $('lastUpdated').textContent='Updated '+new Date().toLocaleString();
  }catch(e){
    $('authState').classList.remove('hidden');$('authState').textContent='Dashboard data temporarily unavailable: '+e.message;
  }finally{$('refresh').disabled=false;}
}
$('refresh').addEventListener('click',load);$('range').addEventListener('change',load);window.addEventListener('resize',()=>{clearTimeout(window.__piDashResize);window.__piDashResize=setTimeout(load,120);});
load();