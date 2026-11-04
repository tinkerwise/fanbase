import{C as e,F as t,G as n,H as r,J as i,K as a,N as o,S as s,T as c,W as l,b as u,c as d,d as f,i as p,j as m,k as h,s as g,t as _,u as v,v as y,w as b}from"./utils.CZAgHqi-.js";import"./theme.ybeBtjQo.js";import{n as x,t as S}from"./feedSources.Bhc-UxJ1.js";import{t as C}from"./teamPicker.DdkYWubS.js";var w=null,T=null,E=1,D=`upcoming`;function O(e){return`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${e}/headshot/67/current`}var k=[`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20 15 9"/><path d="M13 7a2.5 2.5 0 1 1 3.5 3.5L15 12l-3.5-3.5Z"/><circle cx="19" cy="5" r="2"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L12 3Z"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11v2a2 2 0 0 0 2 2h1l4 4v-4h1l7 4V5l-7 4h-1L6 9H5a2 2 0 0 0-2 2Z"/></svg>`];async function A(e){try{return(await fetch(`https://statsapi.mlb.com/api/v1/draft/${e}`).then(e=>e.json())).drafts?.rounds??null}catch{return null}}function j(e){if(!e)return null;let t=[],n=[],r={};for(let i of e){if(!/^\d+$/.test(i.round))continue;let e=Number(i.round);if(!(e>5)){r[i.round]=i.picks.map(e=>({pick:e.pickNumber,teamId:e.team?.id,note:e.isDrafted&&e.person?`${e.person.fullName} · ${e.person.primaryPosition?.abbreviation??``}`:void 0,personId:e.isDrafted?e.person?.id:void 0}));for(let r of i.picks)r.team?.id===a&&(t.push({round:e,pick:r.pickNumber}),r.isDrafted&&r.person&&n.push({round:e,pick:r.pickNumber,name:r.person.fullName,position:r.person.primaryPosition?.abbreviation??``,personId:r.person.id}))}}return t.length?(t.sort((e,t)=>e.pick-t.pick),{teamPickOrder:t,picks:n,roundOrders:r}):null}function M(e){return Object.entries(e.roundOrders??{}).flatMap(([e,t])=>t.filter(e=>e.teamId===a).map(t=>({round:Number(e),pick:t.pick})))}function N(e){return m(e??``).toLowerCase().trim()}function P(e){let t=new Map;if(!e)return t;for(let n of e)for(let e of n.picks)e.isDrafted&&e.person&&t.set(N(e.person.fullName),{personId:e.person.id,pickNumber:e.pickNumber,teamId:e.team?.id});return t}function F(e){let t=(e||``).split(`/`)[0].toUpperCase();return t===`C`?`c`:[`SS`,`2B`,`3B`,`1B`,`MIF`].includes(t)?`if`:[`OF`,`CF`,`RF`,`LF`].includes(t)?`of`:t===`RHP`?`rhp`:t===`LHP`?`lhp`:`other`}function I(e,t,r){let i=_(`draftProspectBoard`);if(!i)return;let a=e.bigBoard??[];if(!a.length){i.innerHTML=`<span class="sidebar-msg">Unavailable</span>`;return}let o=a.filter(e=>!t.has(N(e.name))),l=o.slice(0,10),d=a.filter(e=>t.has(N(e.name))).map(e=>({...e,info:t.get(N(e.name))})).sort((e,t)=>t.info.pickNumber-e.info.pickNumber)[0],f=d?`<div class="prospect-board-status">Last off the board: <a href="${u(d.info.personId)}" target="_blank" rel="noopener">${g(d.name)}</a> — Pick #${d.info.pickNumber}${n[d.info.teamId]?` (${g(n[d.info.teamId])})`:``}</div>`:``,p=l.map(e=>`
    <div class="prospect-row">
      <span class="prospect-rank">${e.rank}</span>
      <div class="prospect-info">
        ${s(e.name,r,`prospect-name`)}
        <span class="prospect-meta">${g(e.school)}</span>
      </div>
      <span class="prospect-pos-badge prospect-pos-badge--${F(e.position)}">${g(e.position)}</span>
    </div>
  `).join(``);i.innerHTML=`
    <div class="prospect-board-head">
      <span class="prospect-board-count">${o.length} remaining on our board</span>
    </div>
    <div class="prospect-board-list">${p||`<span class="sidebar-msg">Board fully drafted</span>`}</div>
    ${f}
  `,c(i)}function L(e){let t=e.startTime?new Date(e.startTime):null,n=e.endTime?new Date(e.endTime):null,r=Date.now();if(t&&r<t.getTime())return`upcoming`;let i=(e.teamPickOrder??[]).length,a=(e.picks??[]).length;return i&&a>=i||n&&r>n.getTime()?`complete`:`live`}function R(e,t){return s(e,t)}function z(e,t,n){let r=`R${e.round} · #${e.pick} — `;if(!t)return`<span class="draft-ticker-item">${g(r)}on the clock</span>`;let i=t.personId?`<a class="draft-ticker-name" href="${u(t.personId)}" target="_blank" rel="noopener">${g(t.name)}</a>`:s(t.name,n,`draft-ticker-name`),a=t.position?g(` (${t.position})`):``;return`<span class="draft-ticker-item">${g(r)}${i}${a}</span>`}function B(e){let t=(e.teamPickOrder??[]).map(e=>`R${e.round} #${e.pick}`).join(`, `),n=[`2026 MLB Draft begins ${g(e.dates??``)} at the ${g(e.location??``)}`];return t&&n.push(`${g(i)} pick order: ${g(t)}`),n.push(`Round 1 airs on NBC & Peacock starting 1:00 PM ET Saturday`),n.map(e=>`<span class="draft-ticker-item">${e}</span>`)}function V(e,t){let n=_(`draftTickerTrack`),r=_(`draftTickerLabel`);if(!n)return;if(r&&(r.innerHTML=D===`live`?`<span class="live-dot" aria-hidden="true"></span> Live Picks`:D===`complete`?`Final Picks`:`${g(l)} Picks`),D===`upcoming`){let t=B(e);n.innerHTML=t.join(``)+t.join(``);return}let a=e.teamPickOrder??[],o=e.picks??[];if(!a.length){n.innerHTML=`<span class="draft-ticker-item">${g(i)} pick order unavailable</span>`;return}let s=a.map(e=>z(e,o.find(t=>t.round===e.round&&t.pick===e.pick),t));n.innerHTML=s.join(``)+s.join(``),c(n)}function H(e){let t=_(`draftRoundTabs`);t&&(t.innerHTML=(e.teamPickOrder??[]).map(e=>e.round).map(e=>`<button class="pill${e===E?` active`:``}" data-round="${e}">Round ${e}</button>`).join(``),t.querySelectorAll(`button[data-round]`).forEach(e=>{e.addEventListener(`click`,()=>{E=Number(e.dataset.round),t.querySelectorAll(`button`).forEach(t=>t.classList.toggle(`active`,t===e)),U(w,T)})}))}function U(e,t){let r=_(`draftOrder`);if(!r)return;let s=e.roundOrders?.[String(E)],l=(e.teamPickOrder??[]).find(e=>e.round===E);if(s?.length)r.innerHTML=s.map(e=>{let t=e.teamId===a,r=n[e.teamId]??``,i=e.note?e.personId?`<a class="draft-order-note draft-order-note--pick" href="${u(e.personId)}" target="_blank" rel="noopener">${g(e.note)}</a>`:`<span class="draft-order-note">${g(e.note)}</span>`:``;return`<div class="draft-order-row${t?` draft-order-row--my-team`:``}">
      <span class="draft-order-pick">${e.pick}</span>
      <img class="draft-order-logo" src="${o(e.teamId,18)}" alt="" width="18" height="18" loading="lazy">
      <span class="draft-order-team">${g(r)}</span>
      ${i}
    </div>`}).join(``);else{let n=(e.picks??[]).find(e=>e.round===E);r.innerHTML=`<div class="draft-order-empty">
      <p>Full Round ${E} order isn't published yet.</p>
      ${l?`<div class="roster-item">
        <span class="roster-pos">R${l.round}</span>
        ${n?R(n.name,t):`<span class="roster-name roster-name--pending">${g(i)} on the clock</span>`}
        <span class="roster-badge roster-badge--info">Pick #${l.pick}</span>
      </div>`:``}
      <a class="widget-link" href="https://www.mlb.com/draft/${w?.season??``}/order" target="_blank" rel="noopener">Check MLB.com for the latest order ↗</a>
    </div>`,c(r)}}async function W(){try{let[t,n,i]=await Promise.all([fetch(`/fanbase/draft-picks.json`).then(e=>e.json()),f(),A(r)]),o=j(i),s=t.teams?.[a]??{};w={...t,...s,teamPickOrder:M(t),picks:[],...o},T=n,D=L(w),G(w),V(w,n),H(w),U(w,n),I(w,P(i),n);let c=_(`draftUpdated`);c&&w.lastUpdated&&(c.textContent=`Updated ${e(w.lastUpdated)}`),K(w),ee(w,n),J(w),D===`live`&&setTimeout(W,9e4)}catch{_(`draftTickerTrack`).innerHTML=`<span class="draft-ticker-item">Draft data unavailable</span>`,_(`draftOrder`).innerHTML=`<span class="sidebar-msg">Draft data unavailable</span>`}}function G(e){let t=_(`draftHeroBadge`),n=_(`draftHeroFacts`),r=_(`draftHighlights`),s=_(`draftHeroLogo`);if(s&&(s.src=o(a,56)),t){if(D===`live`)t.innerHTML=`<span class="live-dot" aria-hidden="true"></span> Draft is live`;else if(D===`complete`)t.textContent=`Draft complete`;else{let n=e.startTime?new Date(e.startTime):null,r=n?n.getTime()-Date.now():0;if(r>0){let e=Math.floor(r/864e5),n=Math.floor(r%864e5/36e5),i=Math.floor(r%36e5/6e4);t.textContent=e>0?`${e}d ${n}h until Round 1`:`${n}h ${i}m until Round 1`}else t.textContent=`Draft is underway`}}if(n){let t=e.teamPickOrder??[];n.innerHTML=`
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">When</span>
        <span class="draft-hero-fact-value">${g(e.dates??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">Where</span>
        <span class="draft-hero-fact-value">${g(e.location??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">${g(i)} picks</span>
        <span class="draft-hero-fact-value">${t.length} in the first ${t.length?t[t.length-1].round:5} rounds</span>
      </div>
    `}r&&(r.innerHTML=(e.highlights??[]).map((e,t)=>{let n=e.photo?y(T,e.photo):null;return`
      <div class="draft-highlight-card">
        <div class="draft-highlight-head">
          ${n?`<img class="draft-highlight-photo" src="${O(n)}" alt="" loading="lazy">`:`<span class="draft-highlight-icon">${k[t%k.length]}</span>`}
          <div class="draft-highlight-title">${g(e.title)}</div>
        </div>
        <div class="draft-highlight-body">${g(e.body)}</div>
      </div>
    `}).join(``));let c=_(`draftBroadcast`);c&&(c.innerHTML=(e.broadcast??[]).map(e=>`
      <div class="draft-broadcast-day">
        <div class="draft-broadcast-day-label">${g(e.day)}</div>
        ${e.blocks.map(e=>`
          <div class="draft-broadcast-row">
            <span class="draft-broadcast-time">${g(e.time)}</span>
            <span class="draft-broadcast-desc">${g(e.desc)}</span>
            <span class="draft-broadcast-network">${g(e.network)}</span>
          </div>
        `).join(``)}
      </div>
    `).join(``))}function K(e){let t=_(`draftInfo`);if(!t)return;let n=e.startTime?new Date(e.startTime):null,r=``,i=n?n.getTime()-Date.now():0;r=D===`upcoming`&&i>0?`<div class="event-countdown">${Math.floor(i/864e5)}d ${Math.floor(i%864e5/36e5)}h until Round 1</div>`:D===`complete`?`<div class="event-countdown">Draft complete</div>`:`<div class="event-countdown">Draft is underway</div>`,t.innerHTML=`
    <div class="event-game-card">
      <div class="event-game-date">${g(e.dates??``)}</div>
      ${r}
      <div class="event-game-venue">${g(e.location??``)}</div>
    </div>
    <div class="draft-order-summary">
      ${(e.teamPickOrder??[]).map(e=>`<span class="draft-order-chip">R${e.round} · #${e.pick}</span>`).join(``)}
    </div>
    <a class="widget-link" href="https://www.mlb.com/draft" target="_blank" rel="noopener">MLB Draft hub ↗</a>
  `}function q(e){return e?.length?`<div class="draft-links-list">${e.map(e=>`<a class="draft-link-item" href="${g(e.url)}" target="_blank" rel="noopener">${g(e.label)}</a>`).join(``)}</div>`:`<span class="sidebar-msg">Unavailable</span>`}function J(e){let t=_(`draftLiveCoverage`),n=_(`draftSources`);t&&(t.innerHTML=q(e.liveCoverage)),n&&(n.innerHTML=q([...e.teamSources??[],...e.sources??[]]))}var Y=new Set([`P`,`SP`,`RP`,`LHP`,`RHP`]);async function X(e,n){if(!e)return null;let i=Y.has(n)?`pitching`:`hitting`;try{let n=(await fetch(`${t}/people/${e}/stats?stats=season&season=${r}&group=${i}`).then(e=>e.json())).stats?.[0]?.splits?.[0]?.stat;return n?i===`hitting`?`${r}: ${n.avg??`.---`}/${n.obp??`.---`}/${n.slg??`.---`}, ${n.homeRuns??0} HR`:`${r}: ${n.era??`-.--`} ERA, ${n.strikeOuts??0} K`:null}catch{return null}}function Z(e){return`${e.year}-${e.pick}-${e.name}`.replace(/\W+/g,``)}function Q(e,t,n,r){let i=r?`<img class="event-history-avatar" src="${O(r)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'event-history-avatar event-history-avatar--placeholder'}))">`:`<span class="event-history-avatar event-history-avatar--placeholder"></span>`;return`
    <div class="event-history-item" data-history-key="${Z(e)}">
      ${i}
      <span class="event-history-year">${e.year}</span>
      <div class="event-history-body">
        <div class="event-history-result">${R(e.name,t)} · ${g(e.position)}</div>
        <div class="event-history-meta">Round ${e.round}, Pick ${e.pick} · ${g(e.school)}</div>
        ${n?`<div class="event-history-stat">${g(n)}</div>`:``}
      </div>
    </div>
  `}async function $(){let e=[r-1,r-2,r-3];return(await Promise.all(e.map(e=>fetch(`${t}/draft/${e}?teamId=${a}`).then(e=>e.json()).catch(()=>null)))).flatMap((t,n)=>(t?.drafts?.rounds??[]).flatMap(e=>e.picks).filter(e=>e.isDrafted&&e.person).sort((e,t)=>e.pickNumber-t.pickNumber).slice(0,2).map(t=>({year:e[n],round:t.pickRound,pick:t.pickNumber,name:t.person.fullName,position:t.person.primaryPosition?.abbreviation??``,school:t.school?.name??``,personId:t.person.id})))}async function ee(e,t){let n=_(`draftHistory`);if(!n)return;let r=await $(),i=[...e.notables??[]].sort((e,t)=>t.year-e.year),a=[...r,...i];a.length?(n.innerHTML=`
    ${r.length?`<div class="roster-group-label">Recent Top Picks</div>${r.map(e=>Q(e,t,null,e.personId)).join(``)}`:``}
    ${i.length?`<div class="roster-group-label">Franchise Notables</div>${i.map(e=>Q(e,t,null,y(t,e.name))).join(``)}`:``}
  `,c(n),a.forEach(async e=>{let r=e.personId??y(t,e.name);r||=await h(e.name);let i=await X(r,e.position),a=n.querySelector(`[data-history-key="${Z(e)}"]`);a&&(a.outerHTML=Q(e,t,i,r))})):n.innerHTML=`<span class="sidebar-msg">No history available</span>`}async function te(){let e=_(`draftNews`);if(e)try{let t=await x(),n=await Promise.allSettled(t.map(e=>S(e).then(t=>({source:e,articles:t.items??[]})))),r=Date.now()-12096e5,i=/draft/i,a=[];for(let e of n){if(e.status!==`fulfilled`)continue;let{source:t,articles:n}=e.value;for(let e of n){let n=p(e.title||``);if(!i.test(n)&&!i.test(e.description||``))continue;let o=new Date(e.pubDate);isNaN(o)||o.getTime()<r||a.push({title:n,link:e.link,pubDate:e.pubDate,sourceName:t.name,thumbnail:d(e)})}}a.sort((e,t)=>new Date(t.pubDate)-new Date(e.pubDate));let o=a.slice(0,12);if(!o.length){e.innerHTML=`<span class="sidebar-msg">No recent Draft news</span>`;return}await Promise.all(o.map(async e=>{e.thumbnail||=await v(e.link)})),e.innerHTML=`<div class="news-thumb-list">${o.map(b).join(``)}</div>`}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function ne(){document.querySelectorAll(`.section-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.sidebar-section`),n=t.closest(`.sidebar`),r=t.classList.contains(`collapsed`);n?.querySelectorAll(`.sidebar-section.collapsible`).forEach(e=>{e!==t&&e.classList.add(`collapsed`)}),t.classList.toggle(`collapsed`,!r)})})}ne(),C()&&(W(),te());