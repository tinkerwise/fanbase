import{B as e,C as t,H as n,I as r,L as i,N as a,O as o,S as s,T as c,V as l,a as u,b as d,c as f,d as p,f as m,j as h,k as g,l as _,n as v,t as y,w as b,y as x,z as S}from"./teamPicker.7W2vBXW7.js";import"./theme.l0-ccP5M.js";import{t as C}from"./feedSources.Dlyf_AqR.js";var w=null,T=null,E=1,D=`upcoming`;function O(e){return`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${e}/headshot/67/current`}var k=[`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20 15 9"/><path d="M13 7a2.5 2.5 0 1 1 3.5 3.5L15 12l-3.5-3.5Z"/><circle cx="19" cy="5" r="2"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L12 3Z"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11v2a2 2 0 0 0 2 2h1l4 4v-4h1l7 4V5l-7 4h-1L6 9H5a2 2 0 0 0-2 2Z"/></svg>`];async function A(e){try{return(await fetch(`https://statsapi.mlb.com/api/v1/draft/${e}`).then(e=>e.json())).drafts?.rounds??null}catch{return null}}function j(e){if(!e)return null;let t=[],n=[],r={};for(let i of e){if(!/^\d+$/.test(i.round))continue;let e=Number(i.round);if(!(e>5)){r[i.round]=i.picks.map(e=>({pick:e.pickNumber,teamId:e.team?.id,note:e.isDrafted&&e.person?`${e.person.fullName} · ${e.person.primaryPosition?.abbreviation??``}`:void 0,personId:e.isDrafted?e.person?.id:void 0}));for(let r of i.picks)r.team?.id===l&&(t.push({round:e,pick:r.pickNumber}),r.isDrafted&&r.person&&n.push({round:e,pick:r.pickNumber,name:r.person.fullName,position:r.person.primaryPosition?.abbreviation??``,personId:r.person.id}))}}return t.length?(t.sort((e,t)=>e.pick-t.pick),{teamPickOrder:t,picks:n,roundOrders:r}):null}function M(e){return Object.entries(e.roundOrders??{}).flatMap(([e,t])=>t.filter(e=>e.teamId===l).map(t=>({round:Number(e),pick:t.pick})))}function N(e){return g(e??``).toLowerCase().trim()}function P(e){let t=new Map;if(!e)return t;for(let n of e)for(let e of n.picks)e.isDrafted&&e.person&&t.set(N(e.person.fullName),{personId:e.person.id,pickNumber:e.pickNumber,teamId:e.team?.id});return t}function F(e){let t=(e||``).split(`/`)[0].toUpperCase();return t===`C`?`c`:[`SS`,`2B`,`3B`,`1B`,`MIF`].includes(t)?`if`:[`OF`,`CF`,`RF`,`LF`].includes(t)?`of`:t===`RHP`?`rhp`:t===`LHP`?`lhp`:`other`}function I(t,n,r){let i=v(`draftProspectBoard`);if(!i)return;let a=t.bigBoard??[];if(!a.length){i.innerHTML=`<span class="sidebar-msg">Unavailable</span>`;return}let o=a.filter(e=>!n.has(N(e.name))),l=o.slice(0,10),u=a.filter(e=>n.has(N(e.name))).map(e=>({...e,info:n.get(N(e.name))})).sort((e,t)=>t.info.pickNumber-e.info.pickNumber)[0],p=u?`<div class="prospect-board-status">Last off the board: <a href="${d(u.info.personId)}" target="_blank" rel="noopener">${f(u.name)}</a> — Pick #${u.info.pickNumber}${e[u.info.teamId]?` (${f(e[u.info.teamId])})`:``}</div>`:``,m=l.map(e=>`
    <div class="prospect-row">
      <span class="prospect-rank">${e.rank}</span>
      <div class="prospect-info">
        ${s(e.name,r,`prospect-name`)}
        <span class="prospect-meta">${f(e.school)}</span>
      </div>
      <span class="prospect-pos-badge prospect-pos-badge--${F(e.position)}">${f(e.position)}</span>
    </div>
  `).join(``);i.innerHTML=`
    <div class="prospect-board-head">
      <span class="prospect-board-count">${o.length} remaining on our board</span>
    </div>
    <div class="prospect-board-list">${m||`<span class="sidebar-msg">Board fully drafted</span>`}</div>
    ${p}
  `,c(i)}function L(e){let t=e.startTime?new Date(e.startTime):null,n=e.endTime?new Date(e.endTime):null,r=Date.now();if(t&&r<t.getTime())return`upcoming`;let i=(e.teamPickOrder??[]).length,a=(e.picks??[]).length;return i&&a>=i||n&&r>n.getTime()?`complete`:`live`}function R(e,t){return s(e,t)}function z(e,t,n){let r=`R${e.round} · #${e.pick} — `;if(!t)return`<span class="draft-ticker-item">${f(r)}on the clock</span>`;let i=t.personId?`<a class="draft-ticker-name" href="${d(t.personId)}" target="_blank" rel="noopener">${f(t.name)}</a>`:s(t.name,n,`draft-ticker-name`),a=t.position?f(` (${t.position})`):``;return`<span class="draft-ticker-item">${f(r)}${i}${a}</span>`}function B(e){let t=(e.teamPickOrder??[]).map(e=>`R${e.round} #${e.pick}`).join(`, `),r=[`2026 MLB Draft begins ${f(e.dates??``)} at the ${f(e.location??``)}`];return t&&r.push(`${f(n)} pick order: ${f(t)}`),r.push(`Round 1 airs on NBC & Peacock starting 1:00 PM ET Saturday`),r.map(e=>`<span class="draft-ticker-item">${e}</span>`)}function V(e,t){let r=v(`draftTickerTrack`),i=v(`draftTickerLabel`);if(!r)return;if(i&&(i.innerHTML=D===`live`?`<span class="live-dot" aria-hidden="true"></span> Live Picks`:D===`complete`?`Final Picks`:`${f(S)} Picks`),D===`upcoming`){let t=B(e);r.innerHTML=t.join(``)+t.join(``);return}let a=e.teamPickOrder??[],o=e.picks??[];if(!a.length){r.innerHTML=`<span class="draft-ticker-item">${f(n)} pick order unavailable</span>`;return}let s=a.map(e=>z(e,o.find(t=>t.round===e.round&&t.pick===e.pick),t));r.innerHTML=s.join(``)+s.join(``),c(r)}function H(e){let t=v(`draftRoundTabs`);t&&(t.innerHTML=(e.teamPickOrder??[]).map(e=>e.round).map(e=>`<button class="pill${e===E?` active`:``}" data-round="${e}">Round ${e}</button>`).join(``),t.querySelectorAll(`button[data-round]`).forEach(e=>{e.addEventListener(`click`,()=>{E=Number(e.dataset.round),t.querySelectorAll(`button`).forEach(t=>t.classList.toggle(`active`,t===e)),U(w,T)})}))}function U(t,r){let i=v(`draftOrder`);if(!i)return;let a=t.roundOrders?.[String(E)],o=(t.teamPickOrder??[]).find(e=>e.round===E);if(a?.length)i.innerHTML=a.map(t=>{let n=t.teamId===l,r=e[t.teamId]??``,i=t.note?t.personId?`<a class="draft-order-note draft-order-note--pick" href="${d(t.personId)}" target="_blank" rel="noopener">${f(t.note)}</a>`:`<span class="draft-order-note">${f(t.note)}</span>`:``;return`<div class="draft-order-row${n?` draft-order-row--my-team`:``}">
      <span class="draft-order-pick">${t.pick}</span>
      <img class="draft-order-logo" src="${h(t.teamId,18)}" alt="" width="18" height="18" loading="lazy">
      <span class="draft-order-team">${f(r)}</span>
      ${i}
    </div>`}).join(``);else{let e=(t.picks??[]).find(e=>e.round===E);i.innerHTML=`<div class="draft-order-empty">
      <p>Full Round ${E} order isn't published yet.</p>
      ${o?`<div class="roster-item">
        <span class="roster-pos">R${o.round}</span>
        ${e?R(e.name,r):`<span class="roster-name roster-name--pending">${f(n)} on the clock</span>`}
        <span class="roster-badge roster-badge--info">Pick #${o.pick}</span>
      </div>`:``}
      <a class="widget-link" href="https://www.mlb.com/draft/${w?.season??``}/order" target="_blank" rel="noopener">Check MLB.com for the latest order ↗</a>
    </div>`,c(i)}}async function W(){try{let[e,n,r]=await Promise.all([fetch(`/fanbase/draft-picks.json`).then(e=>e.json()),m(),A(i)]),a=j(r),o=e.teams?.[l]??{};w={...e,...o,teamPickOrder:M(e),picks:[],...a},T=n,D=L(w),G(w),V(w,n),H(w),U(w,n),I(w,P(r),n);let s=v(`draftUpdated`);s&&w.lastUpdated&&(s.textContent=`Updated ${t(w.lastUpdated)}`),K(w),ee(w,n),J(w),D===`live`&&setTimeout(W,9e4)}catch{v(`draftTickerTrack`).innerHTML=`<span class="draft-ticker-item">Draft data unavailable</span>`,v(`draftOrder`).innerHTML=`<span class="sidebar-msg">Draft data unavailable</span>`}}function G(e){let t=v(`draftHeroBadge`),r=v(`draftHeroFacts`),i=v(`draftHighlights`),a=v(`draftHeroLogo`);if(a&&(a.src=h(l,56)),t){if(D===`live`)t.innerHTML=`<span class="live-dot" aria-hidden="true"></span> Draft is live`;else if(D===`complete`)t.textContent=`Draft complete`;else{let n=e.startTime?new Date(e.startTime):null,r=n?n.getTime()-Date.now():0;if(r>0){let e=Math.floor(r/864e5),n=Math.floor(r%864e5/36e5),i=Math.floor(r%36e5/6e4);t.textContent=e>0?`${e}d ${n}h until Round 1`:`${n}h ${i}m until Round 1`}else t.textContent=`Draft is underway`}}if(r){let t=e.teamPickOrder??[];r.innerHTML=`
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">When</span>
        <span class="draft-hero-fact-value">${f(e.dates??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">Where</span>
        <span class="draft-hero-fact-value">${f(e.location??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">${f(n)} picks</span>
        <span class="draft-hero-fact-value">${t.length} in the first ${t.length?t[t.length-1].round:5} rounds</span>
      </div>
    `}i&&(i.innerHTML=(e.highlights??[]).map((e,t)=>{let n=e.photo?x(T,e.photo):null;return`
      <div class="draft-highlight-card">
        <div class="draft-highlight-head">
          ${n?`<img class="draft-highlight-photo" src="${O(n)}" alt="" loading="lazy">`:`<span class="draft-highlight-icon">${k[t%k.length]}</span>`}
          <div class="draft-highlight-title">${f(e.title)}</div>
        </div>
        <div class="draft-highlight-body">${f(e.body)}</div>
      </div>
    `}).join(``));let o=v(`draftBroadcast`);o&&(o.innerHTML=(e.broadcast??[]).map(e=>`
      <div class="draft-broadcast-day">
        <div class="draft-broadcast-day-label">${f(e.day)}</div>
        ${e.blocks.map(e=>`
          <div class="draft-broadcast-row">
            <span class="draft-broadcast-time">${f(e.time)}</span>
            <span class="draft-broadcast-desc">${f(e.desc)}</span>
            <span class="draft-broadcast-network">${f(e.network)}</span>
          </div>
        `).join(``)}
      </div>
    `).join(``))}function K(e){let t=v(`draftInfo`);if(!t)return;let n=e.startTime?new Date(e.startTime):null,r=``,i=n?n.getTime()-Date.now():0;r=D===`upcoming`&&i>0?`<div class="event-countdown">${Math.floor(i/864e5)}d ${Math.floor(i%864e5/36e5)}h until Round 1</div>`:D===`complete`?`<div class="event-countdown">Draft complete</div>`:`<div class="event-countdown">Draft is underway</div>`,t.innerHTML=`
    <div class="event-game-card">
      <div class="event-game-date">${f(e.dates??``)}</div>
      ${r}
      <div class="event-game-venue">${f(e.location??``)}</div>
    </div>
    <div class="draft-order-summary">
      ${(e.teamPickOrder??[]).map(e=>`<span class="draft-order-chip">R${e.round} · #${e.pick}</span>`).join(``)}
    </div>
    <a class="widget-link" href="https://www.mlb.com/draft" target="_blank" rel="noopener">MLB Draft hub ↗</a>
  `}function q(e){return e?.length?`<div class="draft-links-list">${e.map(e=>`<a class="draft-link-item" href="${f(e.url)}" target="_blank" rel="noopener">${f(e.label)}</a>`).join(``)}</div>`:`<span class="sidebar-msg">Unavailable</span>`}function J(e){let t=v(`draftLiveCoverage`),n=v(`draftSources`);t&&(t.innerHTML=q(e.liveCoverage)),n&&(n.innerHTML=q([...e.teamSources??[],...e.sources??[]]))}var Y=new Set([`P`,`SP`,`RP`,`LHP`,`RHP`]);async function X(e,t){if(!e)return null;let n=Y.has(t)?`pitching`:`hitting`;try{let t=(await fetch(`${a}/people/${e}/stats?stats=season&season=${i}&group=${n}`).then(e=>e.json())).stats?.[0]?.splits?.[0]?.stat;return t?n===`hitting`?`${i}: ${t.avg??`.---`}/${t.obp??`.---`}/${t.slg??`.---`}, ${t.homeRuns??0} HR`:`${i}: ${t.era??`-.--`} ERA, ${t.strikeOuts??0} K`:null}catch{return null}}function Z(e){return`${e.year}-${e.pick}-${e.name}`.replace(/\W+/g,``)}function Q(e,t,n,r){let i=r?`<img class="event-history-avatar" src="${O(r)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'event-history-avatar event-history-avatar--placeholder'}))">`:`<span class="event-history-avatar event-history-avatar--placeholder"></span>`;return`
    <div class="event-history-item" data-history-key="${Z(e)}">
      ${i}
      <span class="event-history-year">${e.year}</span>
      <div class="event-history-body">
        <div class="event-history-result">${R(e.name,t)} · ${f(e.position)}</div>
        <div class="event-history-meta">Round ${e.round}, Pick ${e.pick} · ${f(e.school)}</div>
        ${n?`<div class="event-history-stat">${f(n)}</div>`:``}
      </div>
    </div>
  `}async function $(){let e=[i-1,i-2,i-3];return(await Promise.all(e.map(e=>fetch(`${a}/draft/${e}?teamId=${l}`).then(e=>e.json()).catch(()=>null)))).flatMap((t,n)=>(t?.drafts?.rounds??[]).flatMap(e=>e.picks).filter(e=>e.isDrafted&&e.person).sort((e,t)=>e.pickNumber-t.pickNumber).slice(0,2).map(t=>({year:e[n],round:t.pickRound,pick:t.pickNumber,name:t.person.fullName,position:t.person.primaryPosition?.abbreviation??``,school:t.school?.name??``,personId:t.person.id})))}async function ee(e,t){let n=v(`draftHistory`);if(!n)return;let r=await $(),i=[...e.notables??[]].sort((e,t)=>t.year-e.year),a=[...r,...i];a.length?(n.innerHTML=`
    ${r.length?`<div class="roster-group-label">Recent Top Picks</div>${r.map(e=>Q(e,t,null,e.personId)).join(``)}`:``}
    ${i.length?`<div class="roster-group-label">Franchise Notables</div>${i.map(e=>Q(e,t,null,x(t,e.name))).join(``)}`:``}
  `,c(n),a.forEach(async e=>{let r=e.personId??x(t,e.name);r||=await o(e.name);let i=await X(r,e.position),a=n.querySelector(`[data-history-key="${Z(e)}"]`);a&&(a.outerHTML=Q(e,t,i,r))})):n.innerHTML=`<span class="sidebar-msg">No history available</span>`}async function te(){let e=v(`draftNews`);if(e)try{let t=await C(),n=await Promise.allSettled(t.map(e=>fetch(`${r}?url=${encodeURIComponent(e.url)}`).then(e=>e.json()).then(t=>({source:e,articles:t.items??[]})))),i=Date.now()-12096e5,a=/draft/i,o=[];for(let e of n){if(e.status!==`fulfilled`)continue;let{source:t,articles:n}=e.value;for(let e of n){let n=u(e.title||``);if(!a.test(n)&&!a.test(e.description||``))continue;let r=new Date(e.pubDate);isNaN(r)||r.getTime()<i||o.push({title:n,link:e.link,pubDate:e.pubDate,sourceName:t.name,thumbnail:_(e)})}}o.sort((e,t)=>new Date(t.pubDate)-new Date(e.pubDate));let s=o.slice(0,12);if(!s.length){e.innerHTML=`<span class="sidebar-msg">No recent Draft news</span>`;return}await Promise.all(s.map(async e=>{e.thumbnail||=await p(e.link)})),e.innerHTML=`<div class="news-thumb-list">${s.map(b).join(``)}</div>`}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function ne(){document.querySelectorAll(`.section-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.sidebar-section`),n=t.closest(`.sidebar`),r=t.classList.contains(`collapsed`);n?.querySelectorAll(`.sidebar-section.collapsible`).forEach(e=>{e!==t&&e.classList.add(`collapsed`)}),t.classList.toggle(`collapsed`,!r)})})}ne(),y()&&(W(),te());