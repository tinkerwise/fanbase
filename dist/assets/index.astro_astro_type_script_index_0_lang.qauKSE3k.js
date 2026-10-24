import{A as e,C as t,D as n,G as r,H as i,M as a,O as o,R as s,S as c,U as l,V as u,c as d,d as f,i as p,s as m,t as h,u as g,v as _,w as v,x as y,y as b,z as x}from"./utils.xvj8btl9.js";import"./theme.DGspLTMu.js";import{t as S}from"./teamPicker.DyLSMwJz.js";import{t as C}from"./feedSources.BoG6LdZV.js";var w=null,T=null,E=1,D=`upcoming`;function O(e){return`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${e}/headshot/67/current`}var k=[`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20 15 9"/><path d="M13 7a2.5 2.5 0 1 1 3.5 3.5L15 12l-3.5-3.5Z"/><circle cx="19" cy="5" r="2"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L12 3Z"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11v2a2 2 0 0 0 2 2h1l4 4v-4h1l7 4V5l-7 4h-1L6 9H5a2 2 0 0 0-2 2Z"/></svg>`];async function A(e){try{return(await fetch(`https://statsapi.mlb.com/api/v1/draft/${e}`).then(e=>e.json())).drafts?.rounds??null}catch{return null}}function j(e){if(!e)return null;let t=[],n=[],r={};for(let i of e){if(!/^\d+$/.test(i.round))continue;let e=Number(i.round);if(!(e>5)){r[i.round]=i.picks.map(e=>({pick:e.pickNumber,teamId:e.team?.id,note:e.isDrafted&&e.person?`${e.person.fullName} · ${e.person.primaryPosition?.abbreviation??``}`:void 0,personId:e.isDrafted?e.person?.id:void 0}));for(let r of i.picks)r.team?.id===l&&(t.push({round:e,pick:r.pickNumber}),r.isDrafted&&r.person&&n.push({round:e,pick:r.pickNumber,name:r.person.fullName,position:r.person.primaryPosition?.abbreviation??``,personId:r.person.id}))}}return t.length?(t.sort((e,t)=>e.pick-t.pick),{teamPickOrder:t,picks:n,roundOrders:r}):null}function M(e){return Object.entries(e.roundOrders??{}).flatMap(([e,t])=>t.filter(e=>e.teamId===l).map(t=>({round:Number(e),pick:t.pick})))}function N(e){return o(e??``).toLowerCase().trim()}function P(e){let t=new Map;if(!e)return t;for(let n of e)for(let e of n.picks)e.isDrafted&&e.person&&t.set(N(e.person.fullName),{personId:e.person.id,pickNumber:e.pickNumber,teamId:e.team?.id});return t}function F(e){let t=(e||``).split(`/`)[0].toUpperCase();return t===`C`?`c`:[`SS`,`2B`,`3B`,`1B`,`MIF`].includes(t)?`if`:[`OF`,`CF`,`RF`,`LF`].includes(t)?`of`:t===`RHP`?`rhp`:t===`LHP`?`lhp`:`other`}function I(e,t,n){let r=h(`draftProspectBoard`);if(!r)return;let a=e.bigBoard??[];if(!a.length){r.innerHTML=`<span class="sidebar-msg">Unavailable</span>`;return}let o=a.filter(e=>!t.has(N(e.name))),s=o.slice(0,10),c=a.filter(e=>t.has(N(e.name))).map(e=>({...e,info:t.get(N(e.name))})).sort((e,t)=>t.info.pickNumber-e.info.pickNumber)[0],l=c?`<div class="prospect-board-status">Last off the board: <a href="${b(c.info.personId)}" target="_blank" rel="noopener">${m(c.name)}</a> — Pick #${c.info.pickNumber}${i[c.info.teamId]?` (${m(i[c.info.teamId])})`:``}</div>`:``,u=s.map(e=>`
    <div class="prospect-row">
      <span class="prospect-rank">${e.rank}</span>
      <div class="prospect-info">
        ${y(e.name,n,`prospect-name`)}
        <span class="prospect-meta">${m(e.school)}</span>
      </div>
      <span class="prospect-pos-badge prospect-pos-badge--${F(e.position)}">${m(e.position)}</span>
    </div>
  `).join(``);r.innerHTML=`
    <div class="prospect-board-head">
      <span class="prospect-board-count">${o.length} remaining on our board</span>
    </div>
    <div class="prospect-board-list">${u||`<span class="sidebar-msg">Board fully drafted</span>`}</div>
    ${l}
  `,v(r)}function L(e){let t=e.startTime?new Date(e.startTime):null,n=e.endTime?new Date(e.endTime):null,r=Date.now();if(t&&r<t.getTime())return`upcoming`;let i=(e.teamPickOrder??[]).length,a=(e.picks??[]).length;return i&&a>=i||n&&r>n.getTime()?`complete`:`live`}function R(e,t){return y(e,t)}function z(e,t,n){let r=`R${e.round} · #${e.pick} — `;if(!t)return`<span class="draft-ticker-item">${m(r)}on the clock</span>`;let i=t.personId?`<a class="draft-ticker-name" href="${b(t.personId)}" target="_blank" rel="noopener">${m(t.name)}</a>`:y(t.name,n,`draft-ticker-name`),a=t.position?m(` (${t.position})`):``;return`<span class="draft-ticker-item">${m(r)}${i}${a}</span>`}function B(e){let t=(e.teamPickOrder??[]).map(e=>`R${e.round} #${e.pick}`).join(`, `),n=[`2026 MLB Draft begins ${m(e.dates??``)} at the ${m(e.location??``)}`];return t&&n.push(`${m(r)} pick order: ${m(t)}`),n.push(`Round 1 airs on NBC & Peacock starting 1:00 PM ET Saturday`),n.map(e=>`<span class="draft-ticker-item">${e}</span>`)}function V(e,t){let n=h(`draftTickerTrack`),i=h(`draftTickerLabel`);if(!n)return;if(i&&(i.innerHTML=D===`live`?`<span class="live-dot" aria-hidden="true"></span> Live Picks`:D===`complete`?`Final Picks`:`${m(u)} Picks`),D===`upcoming`){let t=B(e);n.innerHTML=t.join(``)+t.join(``);return}let a=e.teamPickOrder??[],o=e.picks??[];if(!a.length){n.innerHTML=`<span class="draft-ticker-item">${m(r)} pick order unavailable</span>`;return}let s=a.map(e=>z(e,o.find(t=>t.round===e.round&&t.pick===e.pick),t));n.innerHTML=s.join(``)+s.join(``),v(n)}function H(e){let t=h(`draftRoundTabs`);t&&(t.innerHTML=(e.teamPickOrder??[]).map(e=>e.round).map(e=>`<button class="pill${e===E?` active`:``}" data-round="${e}">Round ${e}</button>`).join(``),t.querySelectorAll(`button[data-round]`).forEach(e=>{e.addEventListener(`click`,()=>{E=Number(e.dataset.round),t.querySelectorAll(`button`).forEach(t=>t.classList.toggle(`active`,t===e)),U(w,T)})}))}function U(t,n){let a=h(`draftOrder`);if(!a)return;let o=t.roundOrders?.[String(E)],s=(t.teamPickOrder??[]).find(e=>e.round===E);if(o?.length)a.innerHTML=o.map(t=>{let n=t.teamId===l,r=i[t.teamId]??``,a=t.note?t.personId?`<a class="draft-order-note draft-order-note--pick" href="${b(t.personId)}" target="_blank" rel="noopener">${m(t.note)}</a>`:`<span class="draft-order-note">${m(t.note)}</span>`:``;return`<div class="draft-order-row${n?` draft-order-row--my-team`:``}">
      <span class="draft-order-pick">${t.pick}</span>
      <img class="draft-order-logo" src="${e(t.teamId,18)}" alt="" width="18" height="18" loading="lazy">
      <span class="draft-order-team">${m(r)}</span>
      ${a}
    </div>`}).join(``);else{let e=(t.picks??[]).find(e=>e.round===E);a.innerHTML=`<div class="draft-order-empty">
      <p>Full Round ${E} order isn't published yet.</p>
      ${s?`<div class="roster-item">
        <span class="roster-pos">R${s.round}</span>
        ${e?R(e.name,n):`<span class="roster-name roster-name--pending">${m(r)} on the clock</span>`}
        <span class="roster-badge roster-badge--info">Pick #${s.pick}</span>
      </div>`:``}
      <a class="widget-link" href="https://www.mlb.com/draft/${w?.season??``}/order" target="_blank" rel="noopener">Check MLB.com for the latest order ↗</a>
    </div>`,v(a)}}async function W(){try{let[e,t,n]=await Promise.all([fetch(`/fanbase/draft-picks.json`).then(e=>e.json()),f(),A(x)]),r=j(n),i=e.teams?.[l]??{};w={...e,...i,teamPickOrder:M(e),picks:[],...r},T=t,D=L(w),G(w),V(w,t),H(w),U(w,t),I(w,P(n),t);let a=h(`draftUpdated`);a&&w.lastUpdated&&(a.textContent=`Updated ${c(w.lastUpdated)}`),K(w),ee(w,t),J(w),D===`live`&&setTimeout(W,9e4)}catch{h(`draftTickerTrack`).innerHTML=`<span class="draft-ticker-item">Draft data unavailable</span>`,h(`draftOrder`).innerHTML=`<span class="sidebar-msg">Draft data unavailable</span>`}}function G(t){let n=h(`draftHeroBadge`),i=h(`draftHeroFacts`),a=h(`draftHighlights`),o=h(`draftHeroLogo`);if(o&&(o.src=e(l,56)),n){if(D===`live`)n.innerHTML=`<span class="live-dot" aria-hidden="true"></span> Draft is live`;else if(D===`complete`)n.textContent=`Draft complete`;else{let e=t.startTime?new Date(t.startTime):null,r=e?e.getTime()-Date.now():0;if(r>0){let e=Math.floor(r/864e5),t=Math.floor(r%864e5/36e5),i=Math.floor(r%36e5/6e4);n.textContent=e>0?`${e}d ${t}h until Round 1`:`${t}h ${i}m until Round 1`}else n.textContent=`Draft is underway`}}if(i){let e=t.teamPickOrder??[];i.innerHTML=`
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">When</span>
        <span class="draft-hero-fact-value">${m(t.dates??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">Where</span>
        <span class="draft-hero-fact-value">${m(t.location??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">${m(r)} picks</span>
        <span class="draft-hero-fact-value">${e.length} in the first ${e.length?e[e.length-1].round:5} rounds</span>
      </div>
    `}a&&(a.innerHTML=(t.highlights??[]).map((e,t)=>{let n=e.photo?_(T,e.photo):null;return`
      <div class="draft-highlight-card">
        <div class="draft-highlight-head">
          ${n?`<img class="draft-highlight-photo" src="${O(n)}" alt="" loading="lazy">`:`<span class="draft-highlight-icon">${k[t%k.length]}</span>`}
          <div class="draft-highlight-title">${m(e.title)}</div>
        </div>
        <div class="draft-highlight-body">${m(e.body)}</div>
      </div>
    `}).join(``));let s=h(`draftBroadcast`);s&&(s.innerHTML=(t.broadcast??[]).map(e=>`
      <div class="draft-broadcast-day">
        <div class="draft-broadcast-day-label">${m(e.day)}</div>
        ${e.blocks.map(e=>`
          <div class="draft-broadcast-row">
            <span class="draft-broadcast-time">${m(e.time)}</span>
            <span class="draft-broadcast-desc">${m(e.desc)}</span>
            <span class="draft-broadcast-network">${m(e.network)}</span>
          </div>
        `).join(``)}
      </div>
    `).join(``))}function K(e){let t=h(`draftInfo`);if(!t)return;let n=e.startTime?new Date(e.startTime):null,r=``,i=n?n.getTime()-Date.now():0;r=D===`upcoming`&&i>0?`<div class="event-countdown">${Math.floor(i/864e5)}d ${Math.floor(i%864e5/36e5)}h until Round 1</div>`:D===`complete`?`<div class="event-countdown">Draft complete</div>`:`<div class="event-countdown">Draft is underway</div>`,t.innerHTML=`
    <div class="event-game-card">
      <div class="event-game-date">${m(e.dates??``)}</div>
      ${r}
      <div class="event-game-venue">${m(e.location??``)}</div>
    </div>
    <div class="draft-order-summary">
      ${(e.teamPickOrder??[]).map(e=>`<span class="draft-order-chip">R${e.round} · #${e.pick}</span>`).join(``)}
    </div>
    <a class="widget-link" href="https://www.mlb.com/draft" target="_blank" rel="noopener">MLB Draft hub ↗</a>
  `}function q(e){return e?.length?`<div class="draft-links-list">${e.map(e=>`<a class="draft-link-item" href="${m(e.url)}" target="_blank" rel="noopener">${m(e.label)}</a>`).join(``)}</div>`:`<span class="sidebar-msg">Unavailable</span>`}function J(e){let t=h(`draftLiveCoverage`),n=h(`draftSources`);t&&(t.innerHTML=q(e.liveCoverage)),n&&(n.innerHTML=q([...e.teamSources??[],...e.sources??[]]))}var Y=new Set([`P`,`SP`,`RP`,`LHP`,`RHP`]);async function X(e,t){if(!e)return null;let n=Y.has(t)?`pitching`:`hitting`;try{let t=(await fetch(`${a}/people/${e}/stats?stats=season&season=${x}&group=${n}`).then(e=>e.json())).stats?.[0]?.splits?.[0]?.stat;return t?n===`hitting`?`${x}: ${t.avg??`.---`}/${t.obp??`.---`}/${t.slg??`.---`}, ${t.homeRuns??0} HR`:`${x}: ${t.era??`-.--`} ERA, ${t.strikeOuts??0} K`:null}catch{return null}}function Z(e){return`${e.year}-${e.pick}-${e.name}`.replace(/\W+/g,``)}function Q(e,t,n,r){let i=r?`<img class="event-history-avatar" src="${O(r)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'event-history-avatar event-history-avatar--placeholder'}))">`:`<span class="event-history-avatar event-history-avatar--placeholder"></span>`;return`
    <div class="event-history-item" data-history-key="${Z(e)}">
      ${i}
      <span class="event-history-year">${e.year}</span>
      <div class="event-history-body">
        <div class="event-history-result">${R(e.name,t)} · ${m(e.position)}</div>
        <div class="event-history-meta">Round ${e.round}, Pick ${e.pick} · ${m(e.school)}</div>
        ${n?`<div class="event-history-stat">${m(n)}</div>`:``}
      </div>
    </div>
  `}async function $(){let e=[x-1,x-2,x-3];return(await Promise.all(e.map(e=>fetch(`${a}/draft/${e}?teamId=${l}`).then(e=>e.json()).catch(()=>null)))).flatMap((t,n)=>(t?.drafts?.rounds??[]).flatMap(e=>e.picks).filter(e=>e.isDrafted&&e.person).sort((e,t)=>e.pickNumber-t.pickNumber).slice(0,2).map(t=>({year:e[n],round:t.pickRound,pick:t.pickNumber,name:t.person.fullName,position:t.person.primaryPosition?.abbreviation??``,school:t.school?.name??``,personId:t.person.id})))}async function ee(e,t){let r=h(`draftHistory`);if(!r)return;let i=await $(),a=[...e.notables??[]].sort((e,t)=>t.year-e.year),o=[...i,...a];o.length?(r.innerHTML=`
    ${i.length?`<div class="roster-group-label">Recent Top Picks</div>${i.map(e=>Q(e,t,null,e.personId)).join(``)}`:``}
    ${a.length?`<div class="roster-group-label">Franchise Notables</div>${a.map(e=>Q(e,t,null,_(t,e.name))).join(``)}`:``}
  `,v(r),o.forEach(async e=>{let i=e.personId??_(t,e.name);i||=await n(e.name);let a=await X(i,e.position),o=r.querySelector(`[data-history-key="${Z(e)}"]`);o&&(o.outerHTML=Q(e,t,a,i))})):r.innerHTML=`<span class="sidebar-msg">No history available</span>`}async function te(){let e=h(`draftNews`);if(e)try{let n=await C(),r=await Promise.allSettled(n.map(e=>fetch(`${s}?url=${encodeURIComponent(e.url)}`).then(e=>e.json()).then(t=>({source:e,articles:t.items??[]})))),i=Date.now()-12096e5,a=/draft/i,o=[];for(let e of r){if(e.status!==`fulfilled`)continue;let{source:t,articles:n}=e.value;for(let e of n){let n=p(e.title||``);if(!a.test(n)&&!a.test(e.description||``))continue;let r=new Date(e.pubDate);isNaN(r)||r.getTime()<i||o.push({title:n,link:e.link,pubDate:e.pubDate,sourceName:t.name,thumbnail:d(e)})}}o.sort((e,t)=>new Date(t.pubDate)-new Date(e.pubDate));let c=o.slice(0,12);if(!c.length){e.innerHTML=`<span class="sidebar-msg">No recent Draft news</span>`;return}await Promise.all(c.map(async e=>{e.thumbnail||=await g(e.link)})),e.innerHTML=`<div class="news-thumb-list">${c.map(t).join(``)}</div>`}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function ne(){document.querySelectorAll(`.section-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.sidebar-section`),n=t.closest(`.sidebar`),r=t.classList.contains(`collapsed`);n?.querySelectorAll(`.sidebar-section.collapsible`).forEach(e=>{e!==t&&e.classList.add(`collapsed`)}),t.classList.toggle(`collapsed`,!r)})})}ne(),S()&&(W(),te());