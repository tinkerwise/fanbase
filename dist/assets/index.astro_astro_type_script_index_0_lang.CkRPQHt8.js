import{C as e,T as t,c as n,i as r,s as i}from"./utils.DnOkClm6.js";import"./theme.CGl16IXc.js";import{t as a}from"./feedSources.C2nXxMSG.js";import{n as o,r as s,t as c}from"./season.3oEQQEiT.js";var l={talks:{label:`Negotiating`,tone:`talks`},expired:{label:`CBA expired`,tone:`warn`},lockout:{label:`Lockout`,tone:`stop`},tentative:{label:`Tentative deal`,tone:`deal`},ratified:{label:`Deal ratified`,tone:`deal`}},u=/\b(CBA|collective[- ]bargaining|labor (talks|deal|negotiations?|dispute|war|fight|battle)|lockout|work stoppage|MLBPA|players'? (union|association)|salary cap|salary floor|competitive integrity tax|revenue sharing|Bruce Meyer|bargaining)\b/i,d=12,f=21,p=e=>document.getElementById(e);function m(e,{year:t=!0}={}){let[n,r,i]=e.split(`-`).map(Number);return new Date(n,r-1,i).toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,...t?{year:`numeric`}:{}})}function h(e=[]){return e.filter(e=>t(e.url)).map(e=>`<a href="${i(t(e.url))}" target="_blank" rel="noopener">${i(e.label)}</a>`).join(` · `)}function g(e){let t=e.status??{},n=l[t.code]??{label:`Status`,tone:`talks`},r=s(e);p(`hbStatus`).innerHTML=`
    <div class="hb-status-top">
      <span class="hb-badge hb-badge--${n.tone}">${i(n.label)}</span>
      ${r?`<span class="hb-countdown">${i(c(r))}</span>`:``}
    </div>
    <h2 class="hb-status-headline">${i(t.headline??``)}</h2>
    <p class="hb-status-summary">${i(t.summary??``)}</p>
    <p class="hb-status-meta">As of ${i(m(t.asOf??e.lastUpdated))}${t.sources?.length?` · ${h(t.sources)}`:``}</p>`}function _(e,t,n){return`<div class="hb-side hb-side--${e}">
    <div class="hb-side-name" title="${i(n?.full??``)}">${i(n?.name??e.toUpperCase())}</div>
    <p class="hb-side-position">${i(t?.position??`No position reported yet.`)}</p>
    ${t?.date?`<p class="hb-side-source">Reported ${i(m(t.date))}${t.sources?.length?` · ${h(t.sources)}`:``}</p>`:``}
  </div>`}function v(e){p(`hbIssues`).innerHTML=(e.issues??[]).map(t=>`
    <article class="hb-issue" id="issue-${i(t.id)}">
      <header class="hb-issue-head">
        <h3 class="hb-issue-title">${i(t.title)}</h3>
        ${t.status&&t.status!==`open`?`<span class="hb-issue-status">${i(t.status===`agreed`?`Agreed`:t.status)}</span>`:``}
      </header>
      <p class="hb-issue-summary">${i(t.summary??``)}</p>
      <div class="hb-sides">
        ${_(`mlb`,t.mlb,e.parties?.mlb)}
        ${_(`mlbpa`,t.mlbpa,e.parties?.mlbpa)}
      </div>
    </article>`).join(``)}function y(e){let n=new Date,r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}-${String(n.getDate()).padStart(2,`0`)}`,a=[...e.timeline??[]].sort((e,t)=>e.date.localeCompare(t.date));p(`hbTimeline`).innerHTML=a.map(e=>{let n=e.date>r;return`<li class="hb-event${n?` hb-event--upcoming`:``}${e.key?` hb-event--key`:``}">
      <time class="hb-event-date" datetime="${i(e.date)}">${i(m(e.date))}</time>
      <div class="hb-event-body">
        <span class="hb-event-title">${i(e.title)}${n?` <span class="hb-event-tag">Upcoming</span>`:``}</span>
        ${e.detail?`<span class="hb-event-detail">${i(e.detail)}</span>`:``}
        ${e.source&&t(e.source.url)?`<a class="hb-event-source" href="${i(t(e.source.url))}" target="_blank" rel="noopener">${i(e.source.label)}</a>`:``}
      </div>
    </li>`}).join(``)}function b(e){p(`hbExplainer`).innerHTML=(e.explainer??[]).map(e=>`
    <details class="hb-faq">
      <summary>${i(e.q)}</summary>
      <p>${i(e.a)}</p>
    </details>`).join(``)}function x(e){let t=(Date.now()-new Date(`${e.lastUpdated}T12:00:00`))/864e5,n=[`talks`,`expired`,`lockout`,`tentative`].includes(e.status?.code);p(`hbFootnote`).innerHTML=`Positions are summarized as each side stated or proposed them, with sources; Fanbase doesn't take a side. Last updated ${i(m(e.lastUpdated))}.`+(n&&t>f?` <strong>This summary may be out of date: check the news for the latest.</strong>`:``)}async function S(i){let o=p(`hbNews`);try{let s=[...(await fetch(`/fanbase/feeds.json`).then(e=>e.json())).filter(e=>e.teamId===0),...i.newsSources??[]],c=await Promise.allSettled(s.map(async e=>({source:e,data:await a(e)}))),l=new Set,f=[];for(let e of c)if(e.status===`fulfilled`)for(let i of e.value.data.items??[]){let a=r(i.title??``),o=e.value.source.name,s=e.value.source.titleHasSource&&a.match(/^(.*\S)\s+-\s+([^-]+)$/);s&&([,a,o]=s);let c=t(i.link);c&&!l.has(c)&&u.test(`${a} ${r(i.description??``)}`)&&(l.add(c),f.push({title:a,link:c,pubDate:i.pubDate,sourceName:o,thumbnail:n(i)}))}f.sort((e,t)=>new Date(t.pubDate)-new Date(e.pubDate)),o.innerHTML=f.length?f.slice(0,d).map(e).join(``):`<span class="sidebar-msg">No labor stories in the feeds right now.</span>`}catch{o.innerHTML=`<span class="sidebar-msg">News is unavailable right now.</span>`}}async function C(){let e;try{e=await o()}catch{p(`hbStatus`).innerHTML=`<span class="sidebar-msg">Hardball is unavailable right now.</span>`;return}g(e),v(e),y(e),b(e),x(e),S(e)}C();