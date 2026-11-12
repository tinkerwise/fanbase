import{A as e,E as t,c as n,i as r,s as i,w as a,y as o}from"./utils.DaJInyY3.js";import"./theme.CU5GnKc5.js";import{t as s}from"./feedSources.Bl2t2U43.js";import{i as c,n as l,t as u}from"./season.ChNOqx-y.js";var d={talks:{label:`Negotiating`,tone:`talks`},expired:{label:`CBA expired`,tone:`warn`},lockout:{label:`Lockout`,tone:`stop`},tentative:{label:`Tentative deal`,tone:`deal`},ratified:{label:`Deal ratified`,tone:`deal`}},f=/\b(CBA|collective[- ]bargaining|labor (talks|deal|negotiations?|dispute|war|fight|battle)|lockout|work stoppage|MLBPA|players'? (union|association)|salary cap|salary floor|competitive integrity tax|revenue sharing|Bruce Meyer|bargaining)\b/i,p=12,m=21,h=e=>document.getElementById(e);function g(e,{year:t=!0}={}){let[n,r,i]=e.split(`-`).map(Number);return new Date(n,r-1,i).toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,...t?{year:`numeric`}:{}})}function _(e=[]){return e.filter(e=>t(e.url)).map(e=>`<a href="${i(t(e.url))}" target="_blank" rel="noopener">${i(e.label)}</a>`).join(` · `)}function v(e){let t=e.status??{},n=d[t.code]??{label:`Status`,tone:`talks`},r=c(e);h(`hbStatus`).innerHTML=`
    <div class="hb-status-top">
      <span class="hb-badge hb-badge--${n.tone}">${i(n.label)}</span>
      ${r?`<span class="hb-countdown">${i(u(r))}</span>`:``}
    </div>
    <h2 class="hb-status-headline">${i(t.headline??``)}</h2>
    <p class="hb-status-summary">${i(t.summary??``)}</p>
    <p class="hb-status-meta">As of ${i(g(t.asOf??e.lastUpdated))}${t.sources?.length?` · ${_(t.sources)}`:``}</p>`}function y(e,t,n){return`<div class="hb-side hb-side--${e}">
    <div class="hb-side-name" title="${i(n?.full??``)}">${i(n?.name??e.toUpperCase())}</div>
    <p class="hb-side-position">${i(t?.position??`No position reported yet.`)}</p>
    ${t?.date?`<p class="hb-side-source">Reported ${i(g(t.date))}${t.sources?.length?` · ${_(t.sources)}`:``}</p>`:``}
  </div>`}function b(e){h(`hbIssues`).innerHTML=(e.issues??[]).map(t=>`
    <article class="hb-issue" id="issue-${i(t.id)}">
      <header class="hb-issue-head">
        <h3 class="hb-issue-title">${i(t.title)}</h3>
        ${t.status&&t.status!==`open`?`<span class="hb-issue-status">${i(t.status===`agreed`?`Agreed`:t.status)}</span>`:``}
      </header>
      <p class="hb-issue-summary">${i(t.summary??``)}</p>
      <div class="hb-sides">
        ${y(`mlb`,t.mlb,e.parties?.mlb)}
        ${y(`mlbpa`,t.mlbpa,e.parties?.mlbpa)}
      </div>
    </article>`).join(``)}function x(e){let n=new Date,r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}-${String(n.getDate()).padStart(2,`0`)}`,a=[...e.timeline??[]].sort((e,t)=>e.date.localeCompare(t.date));h(`hbTimeline`).innerHTML=a.map(e=>{let n=e.date>r,a=e.note?`<span class="hb-event-tag hb-event-tag--note">${i(e.note)}</span>`:n?`<span class="hb-event-tag">Upcoming</span>`:``;return`<li class="hb-event${n?` hb-event--upcoming`:``}${e.key?` hb-event--key`:``}${e.off?` hb-event--off`:``}">
      <time class="hb-event-date" datetime="${i(e.date)}">${i(g(e.date))}</time>
      <div class="hb-event-body">
        <span class="hb-event-title">${i(e.title)}${a?` ${a}`:``}</span>
        ${e.detail?`<span class="hb-event-detail">${i(e.detail)}</span>`:``}
        ${e.source&&t(e.source.url)?`<a class="hb-event-source" href="${i(t(e.source.url))}" target="_blank" rel="noopener">${i(e.source.label)}</a>`:``}
      </div>
    </li>`}).join(``)}function S(e){h(`hbExplainer`).innerHTML=(e.explainer??[]).map(e=>`
    <details class="hb-faq">
      <summary>${i(e.q)}</summary>
      <p>${i(e.a)}</p>
    </details>`).join(``)}function C(e){let t=(Date.now()-new Date(`${e.lastUpdated}T12:00:00`))/864e5,n=[`talks`,`expired`,`lockout`,`tentative`].includes(e.status?.code);h(`hbFootnote`).innerHTML=`Positions are summarized as each side stated or proposed them, with sources; Fanbase doesn't take a side. Last updated ${i(g(e.lastUpdated))}.`+(n&&t>m?` <strong>This summary may be out of date: check the news for the latest.</strong>`:``)}async function w(i){let c=h(`hbNews`);try{let l=[...(await fetch(`/fanbase/feeds.json`).then(e=>e.json())).filter(e=>e.teamId===0&&!e.teamFeed),...i.newsSources??[]],u=await Promise.allSettled(l.map(async e=>({source:e,data:await s(e)}))),d=new Set,m=[];for(let i of u)if(i.status===`fulfilled`)for(let a of i.value.data.items??[]){let{title:o,sourceName:s}=e(i.value.source,a.title),c=t(a.link);c&&!d.has(c)&&f.test(`${o} ${r(a.description??``)}`)&&(d.add(c),m.push({title:o,link:c,pubDate:a.pubDate,sourceName:s,thumbnail:n(a)}))}c.innerHTML=m.length?o(m,p).map(a).join(``):`<span class="sidebar-msg">No labor stories in the feeds right now.</span>`}catch{c.innerHTML=`<span class="sidebar-msg">News is unavailable right now.</span>`}}async function T(){let e;try{e=await l()}catch{h(`hbStatus`).innerHTML=`<span class="sidebar-msg">Hardball is unavailable right now.</span>`;return}v(e),b(e),x(e),S(e),C(e),w(e)}T();