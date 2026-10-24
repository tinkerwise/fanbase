import{A as e,B as t,C as n,D as r,H as i,L as a,M as o,O as s,R as c,S as l,V as u,W as d,c as f,d as p,i as m,s as h,t as g,u as _,v,w as y,x as b,y as x}from"./utils.DGgnyXpX.js";import{t as S}from"./teamPicker.BYYQgKdS.js";import"./theme.h7m3Vpbe.js";import{t as C}from"./feedSources.DKfaPRlE.js";var w=null,T=null,E=1,D=`upcoming`;function O(e){return`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${e}/headshot/67/current`}var k=[`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20 15 9"/><path d="M13 7a2.5 2.5 0 1 1 3.5 3.5L15 12l-3.5-3.5Z"/><circle cx="19" cy="5" r="2"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L12 3Z"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11v2a2 2 0 0 0 2 2h1l4 4v-4h1l7 4V5l-7 4h-1L6 9H5a2 2 0 0 0-2 2Z"/></svg>`];async function A(e){try{return(await fetch(`https://statsapi.mlb.com/api/v1/draft/${e}`).then(e=>e.json())).drafts?.rounds??null}catch{return null}}function j(e){if(!e)return null;let t=[],n=[],r={};for(let a of e){if(!/^\d+$/.test(a.round))continue;let e=Number(a.round);if(!(e>5)){r[a.round]=a.picks.map(e=>({pick:e.pickNumber,teamId:e.team?.id,note:e.isDrafted&&e.person?`${e.person.fullName} · ${e.person.primaryPosition?.abbreviation??``}`:void 0,personId:e.isDrafted?e.person?.id:void 0}));for(let r of a.picks)r.team?.id===i&&(t.push({round:e,pick:r.pickNumber}),r.isDrafted&&r.person&&n.push({round:e,pick:r.pickNumber,name:r.person.fullName,position:r.person.primaryPosition?.abbreviation??``,personId:r.person.id}))}}return t.length?(t.sort((e,t)=>e.pick-t.pick),{teamPickOrder:t,picks:n,roundOrders:r}):null}function M(e){return Object.entries(e.roundOrders??{}).flatMap(([e,t])=>t.filter(e=>e.teamId===i).map(t=>({round:Number(e),pick:t.pick})))}function N(e){return s(e??``).toLowerCase().trim()}function P(e){let t=new Map;if(!e)return t;for(let n of e)for(let e of n.picks)e.isDrafted&&e.person&&t.set(N(e.person.fullName),{personId:e.person.id,pickNumber:e.pickNumber,teamId:e.team?.id});return t}function F(e){let t=(e||``).split(`/`)[0].toUpperCase();return t===`C`?`c`:[`SS`,`2B`,`3B`,`1B`,`MIF`].includes(t)?`if`:[`OF`,`CF`,`RF`,`LF`].includes(t)?`of`:t===`RHP`?`rhp`:t===`LHP`?`lhp`:`other`}function I(e,t,n){let r=g(`draftProspectBoard`);if(!r)return;let i=e.bigBoard??[];if(!i.length){r.innerHTML=`<span class="sidebar-msg">Unavailable</span>`;return}let a=i.filter(e=>!t.has(N(e.name))),o=a.slice(0,10),s=i.filter(e=>t.has(N(e.name))).map(e=>({...e,info:t.get(N(e.name))})).sort((e,t)=>t.info.pickNumber-e.info.pickNumber)[0],c=s?`<div class="prospect-board-status">Last off the board: <a href="${x(s.info.personId)}" target="_blank" rel="noopener">${h(s.name)}</a> — Pick #${s.info.pickNumber}${u[s.info.teamId]?` (${h(u[s.info.teamId])})`:``}</div>`:``,l=o.map(e=>`
    <div class="prospect-row">
      <span class="prospect-rank">${e.rank}</span>
      <div class="prospect-info">
        ${b(e.name,n,`prospect-name`)}
        <span class="prospect-meta">${h(e.school)}</span>
      </div>
      <span class="prospect-pos-badge prospect-pos-badge--${F(e.position)}">${h(e.position)}</span>
    </div>
  `).join(``);r.innerHTML=`
    <div class="prospect-board-head">
      <span class="prospect-board-count">${a.length} remaining on our board</span>
    </div>
    <div class="prospect-board-list">${l||`<span class="sidebar-msg">Board fully drafted</span>`}</div>
    ${c}
  `,y(r)}function L(e){let t=e.startTime?new Date(e.startTime):null,n=e.endTime?new Date(e.endTime):null,r=Date.now();if(t&&r<t.getTime())return`upcoming`;let i=(e.teamPickOrder??[]).length,a=(e.picks??[]).length;return i&&a>=i||n&&r>n.getTime()?`complete`:`live`}function R(e,t){return b(e,t)}function z(e,t,n){let r=`R${e.round} · #${e.pick} — `;if(!t)return`<span class="draft-ticker-item">${h(r)}on the clock</span>`;let i=t.personId?`<a class="draft-ticker-name" href="${x(t.personId)}" target="_blank" rel="noopener">${h(t.name)}</a>`:b(t.name,n,`draft-ticker-name`),a=t.position?h(` (${t.position})`):``;return`<span class="draft-ticker-item">${h(r)}${i}${a}</span>`}function B(e){let t=(e.teamPickOrder??[]).map(e=>`R${e.round} #${e.pick}`).join(`, `),n=[`2026 MLB Draft begins ${h(e.dates??``)} at the ${h(e.location??``)}`];return t&&n.push(`${h(d)} pick order: ${h(t)}`),n.push(`Round 1 airs on NBC & Peacock starting 1:00 PM ET Saturday`),n.map(e=>`<span class="draft-ticker-item">${e}</span>`)}function V(e,n){let r=g(`draftTickerTrack`),i=g(`draftTickerLabel`);if(!r)return;if(i&&(i.innerHTML=D===`live`?`<span class="live-dot" aria-hidden="true"></span> Live Picks`:D===`complete`?`Final Picks`:`${h(t)} Picks`),D===`upcoming`){let t=B(e);r.innerHTML=t.join(``)+t.join(``);return}let a=e.teamPickOrder??[],o=e.picks??[];if(!a.length){r.innerHTML=`<span class="draft-ticker-item">${h(d)} pick order unavailable</span>`;return}let s=a.map(e=>z(e,o.find(t=>t.round===e.round&&t.pick===e.pick),n));r.innerHTML=s.join(``)+s.join(``),y(r)}function H(e){let t=g(`draftRoundTabs`);t&&(t.innerHTML=(e.teamPickOrder??[]).map(e=>e.round).map(e=>`<button class="pill${e===E?` active`:``}" data-round="${e}">Round ${e}</button>`).join(``),t.querySelectorAll(`button[data-round]`).forEach(e=>{e.addEventListener(`click`,()=>{E=Number(e.dataset.round),t.querySelectorAll(`button`).forEach(t=>t.classList.toggle(`active`,t===e)),U(w,T)})}))}function U(t,n){let r=g(`draftOrder`);if(!r)return;let a=t.roundOrders?.[String(E)],o=(t.teamPickOrder??[]).find(e=>e.round===E);if(a?.length)r.innerHTML=a.map(t=>{let n=t.teamId===i,r=u[t.teamId]??``,a=t.note?t.personId?`<a class="draft-order-note draft-order-note--pick" href="${x(t.personId)}" target="_blank" rel="noopener">${h(t.note)}</a>`:`<span class="draft-order-note">${h(t.note)}</span>`:``;return`<div class="draft-order-row${n?` draft-order-row--my-team`:``}">
      <span class="draft-order-pick">${t.pick}</span>
      <img class="draft-order-logo" src="${e(t.teamId,18)}" alt="" width="18" height="18" loading="lazy">
      <span class="draft-order-team">${h(r)}</span>
      ${a}
    </div>`}).join(``);else{let e=(t.picks??[]).find(e=>e.round===E);r.innerHTML=`<div class="draft-order-empty">
      <p>Full Round ${E} order isn't published yet.</p>
      ${o?`<div class="roster-item">
        <span class="roster-pos">R${o.round}</span>
        ${e?R(e.name,n):`<span class="roster-name roster-name--pending">${h(d)} on the clock</span>`}
        <span class="roster-badge roster-badge--info">Pick #${o.pick}</span>
      </div>`:``}
      <a class="widget-link" href="https://www.mlb.com/draft/${w?.season??``}/order" target="_blank" rel="noopener">Check MLB.com for the latest order ↗</a>
    </div>`,y(r)}}async function W(){try{let[e,t,n]=await Promise.all([fetch(`/fanbase/draft-picks.json`).then(e=>e.json()),p(),A(c)]),r=j(n),a=e.teams?.[i]??{};w={...e,...a,teamPickOrder:M(e),picks:[],...r},T=t,D=L(w),G(w),V(w,t),H(w),U(w,t),I(w,P(n),t);let o=g(`draftUpdated`);o&&w.lastUpdated&&(o.textContent=`Updated ${l(w.lastUpdated)}`),K(w),ee(w,t),J(w),D===`live`&&setTimeout(W,9e4)}catch{g(`draftTickerTrack`).innerHTML=`<span class="draft-ticker-item">Draft data unavailable</span>`,g(`draftOrder`).innerHTML=`<span class="sidebar-msg">Draft data unavailable</span>`}}function G(t){let n=g(`draftHeroBadge`),r=g(`draftHeroFacts`),a=g(`draftHighlights`),o=g(`draftHeroLogo`);if(o&&(o.src=e(i,56)),n){if(D===`live`)n.innerHTML=`<span class="live-dot" aria-hidden="true"></span> Draft is live`;else if(D===`complete`)n.textContent=`Draft complete`;else{let e=t.startTime?new Date(t.startTime):null,r=e?e.getTime()-Date.now():0;if(r>0){let e=Math.floor(r/864e5),t=Math.floor(r%864e5/36e5),i=Math.floor(r%36e5/6e4);n.textContent=e>0?`${e}d ${t}h until Round 1`:`${t}h ${i}m until Round 1`}else n.textContent=`Draft is underway`}}if(r){let e=t.teamPickOrder??[];r.innerHTML=`
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">When</span>
        <span class="draft-hero-fact-value">${h(t.dates??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">Where</span>
        <span class="draft-hero-fact-value">${h(t.location??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">${h(d)} picks</span>
        <span class="draft-hero-fact-value">${e.length} in the first ${e.length?e[e.length-1].round:5} rounds</span>
      </div>
    `}a&&(a.innerHTML=(t.highlights??[]).map((e,t)=>{let n=e.photo?v(T,e.photo):null;return`
      <div class="draft-highlight-card">
        <div class="draft-highlight-head">
          ${n?`<img class="draft-highlight-photo" src="${O(n)}" alt="" loading="lazy">`:`<span class="draft-highlight-icon">${k[t%k.length]}</span>`}
          <div class="draft-highlight-title">${h(e.title)}</div>
        </div>
        <div class="draft-highlight-body">${h(e.body)}</div>
      </div>
    `}).join(``));let s=g(`draftBroadcast`);s&&(s.innerHTML=(t.broadcast??[]).map(e=>`
      <div class="draft-broadcast-day">
        <div class="draft-broadcast-day-label">${h(e.day)}</div>
        ${e.blocks.map(e=>`
          <div class="draft-broadcast-row">
            <span class="draft-broadcast-time">${h(e.time)}</span>
            <span class="draft-broadcast-desc">${h(e.desc)}</span>
            <span class="draft-broadcast-network">${h(e.network)}</span>
          </div>
        `).join(``)}
      </div>
    `).join(``))}function K(e){let t=g(`draftInfo`);if(!t)return;let n=e.startTime?new Date(e.startTime):null,r=``,i=n?n.getTime()-Date.now():0;r=D===`upcoming`&&i>0?`<div class="event-countdown">${Math.floor(i/864e5)}d ${Math.floor(i%864e5/36e5)}h until Round 1</div>`:D===`complete`?`<div class="event-countdown">Draft complete</div>`:`<div class="event-countdown">Draft is underway</div>`,t.innerHTML=`
    <div class="event-game-card">
      <div class="event-game-date">${h(e.dates??``)}</div>
      ${r}
      <div class="event-game-venue">${h(e.location??``)}</div>
    </div>
    <div class="draft-order-summary">
      ${(e.teamPickOrder??[]).map(e=>`<span class="draft-order-chip">R${e.round} · #${e.pick}</span>`).join(``)}
    </div>
    <a class="widget-link" href="https://www.mlb.com/draft" target="_blank" rel="noopener">MLB Draft hub ↗</a>
  `}function q(e){return e?.length?`<div class="draft-links-list">${e.map(e=>`<a class="draft-link-item" href="${h(e.url)}" target="_blank" rel="noopener">${h(e.label)}</a>`).join(``)}</div>`:`<span class="sidebar-msg">Unavailable</span>`}function J(e){let t=g(`draftLiveCoverage`),n=g(`draftSources`);t&&(t.innerHTML=q(e.liveCoverage)),n&&(n.innerHTML=q([...e.teamSources??[],...e.sources??[]]))}var Y=new Set([`P`,`SP`,`RP`,`LHP`,`RHP`]);async function X(e,t){if(!e)return null;let n=Y.has(t)?`pitching`:`hitting`;try{let t=(await fetch(`${o}/people/${e}/stats?stats=season&season=${c}&group=${n}`).then(e=>e.json())).stats?.[0]?.splits?.[0]?.stat;return t?n===`hitting`?`${c}: ${t.avg??`.---`}/${t.obp??`.---`}/${t.slg??`.---`}, ${t.homeRuns??0} HR`:`${c}: ${t.era??`-.--`} ERA, ${t.strikeOuts??0} K`:null}catch{return null}}function Z(e){return`${e.year}-${e.pick}-${e.name}`.replace(/\W+/g,``)}function Q(e,t,n,r){let i=r?`<img class="event-history-avatar" src="${O(r)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'event-history-avatar event-history-avatar--placeholder'}))">`:`<span class="event-history-avatar event-history-avatar--placeholder"></span>`;return`
    <div class="event-history-item" data-history-key="${Z(e)}">
      ${i}
      <span class="event-history-year">${e.year}</span>
      <div class="event-history-body">
        <div class="event-history-result">${R(e.name,t)} · ${h(e.position)}</div>
        <div class="event-history-meta">Round ${e.round}, Pick ${e.pick} · ${h(e.school)}</div>
        ${n?`<div class="event-history-stat">${h(n)}</div>`:``}
      </div>
    </div>
  `}async function $(){let e=[c-1,c-2,c-3];return(await Promise.all(e.map(e=>fetch(`${o}/draft/${e}?teamId=${i}`).then(e=>e.json()).catch(()=>null)))).flatMap((t,n)=>(t?.drafts?.rounds??[]).flatMap(e=>e.picks).filter(e=>e.isDrafted&&e.person).sort((e,t)=>e.pickNumber-t.pickNumber).slice(0,2).map(t=>({year:e[n],round:t.pickRound,pick:t.pickNumber,name:t.person.fullName,position:t.person.primaryPosition?.abbreviation??``,school:t.school?.name??``,personId:t.person.id})))}async function ee(e,t){let n=g(`draftHistory`);if(!n)return;let i=await $(),a=[...e.notables??[]].sort((e,t)=>t.year-e.year),o=[...i,...a];o.length?(n.innerHTML=`
    ${i.length?`<div class="roster-group-label">Recent Top Picks</div>${i.map(e=>Q(e,t,null,e.personId)).join(``)}`:``}
    ${a.length?`<div class="roster-group-label">Franchise Notables</div>${a.map(e=>Q(e,t,null,v(t,e.name))).join(``)}`:``}
  `,y(n),o.forEach(async e=>{let i=e.personId??v(t,e.name);i||=await r(e.name);let a=await X(i,e.position),o=n.querySelector(`[data-history-key="${Z(e)}"]`);o&&(o.outerHTML=Q(e,t,a,i))})):n.innerHTML=`<span class="sidebar-msg">No history available</span>`}async function te(){let e=g(`draftNews`);if(e)try{let t=await C(),r=await Promise.allSettled(t.map(e=>fetch(`${a}?url=${encodeURIComponent(e.url)}`).then(e=>e.json()).then(t=>({source:e,articles:t.items??[]})))),i=Date.now()-12096e5,o=/draft/i,s=[];for(let e of r){if(e.status!==`fulfilled`)continue;let{source:t,articles:n}=e.value;for(let e of n){let n=m(e.title||``);if(!o.test(n)&&!o.test(e.description||``))continue;let r=new Date(e.pubDate);isNaN(r)||r.getTime()<i||s.push({title:n,link:e.link,pubDate:e.pubDate,sourceName:t.name,thumbnail:f(e)})}}s.sort((e,t)=>new Date(t.pubDate)-new Date(e.pubDate));let c=s.slice(0,12);if(!c.length){e.innerHTML=`<span class="sidebar-msg">No recent Draft news</span>`;return}await Promise.all(c.map(async e=>{e.thumbnail||=await _(e.link)})),e.innerHTML=`<div class="news-thumb-list">${c.map(n).join(``)}</div>`}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function ne(){document.querySelectorAll(`.section-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.sidebar-section`),n=t.closest(`.sidebar`),r=t.classList.contains(`collapsed`);n?.querySelectorAll(`.sidebar-section.collapsible`).forEach(e=>{e!==t&&e.classList.add(`collapsed`)}),t.classList.toggle(`collapsed`,!r)})})}ne(),S()&&(W(),te());