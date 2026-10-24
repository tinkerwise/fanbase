import{B as e,C as t,H as n,K as r,N as i,O as a,S as o,U as s,W as c,c as l,d as u,i as d,j as f,k as p,s as m,t as h,u as g,v as _,w as v,x as y,y as b}from"./utils.DnOkClm6.js";import"./theme.CGl16IXc.js";import{t as x}from"./teamPicker.DkDTilHf.js";import{n as S,t as C}from"./feedSources.cx_0WEvU.js";var w=null,T=null,E=1,D=`upcoming`;function O(e){return`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${e}/headshot/67/current`}var k=[`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20 15 9"/><path d="M13 7a2.5 2.5 0 1 1 3.5 3.5L15 12l-3.5-3.5Z"/><circle cx="19" cy="5" r="2"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L12 3Z"/></svg>`,`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11v2a2 2 0 0 0 2 2h1l4 4v-4h1l7 4V5l-7 4h-1L6 9H5a2 2 0 0 0-2 2Z"/></svg>`];async function A(e){try{return(await fetch(`https://statsapi.mlb.com/api/v1/draft/${e}`).then(e=>e.json())).drafts?.rounds??null}catch{return null}}function j(e){if(!e)return null;let t=[],n=[],r={};for(let i of e){if(!/^\d+$/.test(i.round))continue;let e=Number(i.round);if(!(e>5)){r[i.round]=i.picks.map(e=>({pick:e.pickNumber,teamId:e.team?.id,note:e.isDrafted&&e.person?`${e.person.fullName} · ${e.person.primaryPosition?.abbreviation??``}`:void 0,personId:e.isDrafted?e.person?.id:void 0}));for(let r of i.picks)r.team?.id===c&&(t.push({round:e,pick:r.pickNumber}),r.isDrafted&&r.person&&n.push({round:e,pick:r.pickNumber,name:r.person.fullName,position:r.person.primaryPosition?.abbreviation??``,personId:r.person.id}))}}return t.length?(t.sort((e,t)=>e.pick-t.pick),{teamPickOrder:t,picks:n,roundOrders:r}):null}function M(e){return Object.entries(e.roundOrders??{}).flatMap(([e,t])=>t.filter(e=>e.teamId===c).map(t=>({round:Number(e),pick:t.pick})))}function N(e){return p(e??``).toLowerCase().trim()}function P(e){let t=new Map;if(!e)return t;for(let n of e)for(let e of n.picks)e.isDrafted&&e.person&&t.set(N(e.person.fullName),{personId:e.person.id,pickNumber:e.pickNumber,teamId:e.team?.id});return t}function F(e){let t=(e||``).split(`/`)[0].toUpperCase();return t===`C`?`c`:[`SS`,`2B`,`3B`,`1B`,`MIF`].includes(t)?`if`:[`OF`,`CF`,`RF`,`LF`].includes(t)?`of`:t===`RHP`?`rhp`:t===`LHP`?`lhp`:`other`}function I(e,t,n){let r=h(`draftProspectBoard`);if(!r)return;let i=e.bigBoard??[];if(!i.length){r.innerHTML=`<span class="sidebar-msg">Unavailable</span>`;return}let a=i.filter(e=>!t.has(N(e.name))),o=a.slice(0,10),c=i.filter(e=>t.has(N(e.name))).map(e=>({...e,info:t.get(N(e.name))})).sort((e,t)=>t.info.pickNumber-e.info.pickNumber)[0],l=c?`<div class="prospect-board-status">Last off the board: <a href="${b(c.info.personId)}" target="_blank" rel="noopener">${m(c.name)}</a> — Pick #${c.info.pickNumber}${s[c.info.teamId]?` (${m(s[c.info.teamId])})`:``}</div>`:``,u=o.map(e=>`
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
      <span class="prospect-board-count">${a.length} remaining on our board</span>
    </div>
    <div class="prospect-board-list">${u||`<span class="sidebar-msg">Board fully drafted</span>`}</div>
    ${l}
  `,v(r)}function L(e){let t=e.startTime?new Date(e.startTime):null,n=e.endTime?new Date(e.endTime):null,r=Date.now();if(t&&r<t.getTime())return`upcoming`;let i=(e.teamPickOrder??[]).length,a=(e.picks??[]).length;return i&&a>=i||n&&r>n.getTime()?`complete`:`live`}function R(e,t){return y(e,t)}function z(e,t,n){let r=`R${e.round} · #${e.pick} — `;if(!t)return`<span class="draft-ticker-item">${m(r)}on the clock</span>`;let i=t.personId?`<a class="draft-ticker-name" href="${b(t.personId)}" target="_blank" rel="noopener">${m(t.name)}</a>`:y(t.name,n,`draft-ticker-name`),a=t.position?m(` (${t.position})`):``;return`<span class="draft-ticker-item">${m(r)}${i}${a}</span>`}function B(e){let t=(e.teamPickOrder??[]).map(e=>`R${e.round} #${e.pick}`).join(`, `),n=[`2026 MLB Draft begins ${m(e.dates??``)} at the ${m(e.location??``)}`];return t&&n.push(`${m(r)} pick order: ${m(t)}`),n.push(`Round 1 airs on NBC & Peacock starting 1:00 PM ET Saturday`),n.map(e=>`<span class="draft-ticker-item">${e}</span>`)}function V(e,t){let i=h(`draftTickerTrack`),a=h(`draftTickerLabel`);if(!i)return;if(a&&(a.innerHTML=D===`live`?`<span class="live-dot" aria-hidden="true"></span> Live Picks`:D===`complete`?`Final Picks`:`${m(n)} Picks`),D===`upcoming`){let t=B(e);i.innerHTML=t.join(``)+t.join(``);return}let o=e.teamPickOrder??[],s=e.picks??[];if(!o.length){i.innerHTML=`<span class="draft-ticker-item">${m(r)} pick order unavailable</span>`;return}let c=o.map(e=>z(e,s.find(t=>t.round===e.round&&t.pick===e.pick),t));i.innerHTML=c.join(``)+c.join(``),v(i)}function H(e){let t=h(`draftRoundTabs`);t&&(t.innerHTML=(e.teamPickOrder??[]).map(e=>e.round).map(e=>`<button class="pill${e===E?` active`:``}" data-round="${e}">Round ${e}</button>`).join(``),t.querySelectorAll(`button[data-round]`).forEach(e=>{e.addEventListener(`click`,()=>{E=Number(e.dataset.round),t.querySelectorAll(`button`).forEach(t=>t.classList.toggle(`active`,t===e)),U(w,T)})}))}function U(e,t){let n=h(`draftOrder`);if(!n)return;let i=e.roundOrders?.[String(E)],a=(e.teamPickOrder??[]).find(e=>e.round===E);if(i?.length)n.innerHTML=i.map(e=>{let t=e.teamId===c,n=s[e.teamId]??``,r=e.note?e.personId?`<a class="draft-order-note draft-order-note--pick" href="${b(e.personId)}" target="_blank" rel="noopener">${m(e.note)}</a>`:`<span class="draft-order-note">${m(e.note)}</span>`:``;return`<div class="draft-order-row${t?` draft-order-row--my-team`:``}">
      <span class="draft-order-pick">${e.pick}</span>
      <img class="draft-order-logo" src="${f(e.teamId,18)}" alt="" width="18" height="18" loading="lazy">
      <span class="draft-order-team">${m(n)}</span>
      ${r}
    </div>`}).join(``);else{let i=(e.picks??[]).find(e=>e.round===E);n.innerHTML=`<div class="draft-order-empty">
      <p>Full Round ${E} order isn't published yet.</p>
      ${a?`<div class="roster-item">
        <span class="roster-pos">R${a.round}</span>
        ${i?R(i.name,t):`<span class="roster-name roster-name--pending">${m(r)} on the clock</span>`}
        <span class="roster-badge roster-badge--info">Pick #${a.pick}</span>
      </div>`:``}
      <a class="widget-link" href="https://www.mlb.com/draft/${w?.season??``}/order" target="_blank" rel="noopener">Check MLB.com for the latest order ↗</a>
    </div>`,v(n)}}async function W(){try{let[t,n,r]=await Promise.all([fetch(`/fanbase/draft-picks.json`).then(e=>e.json()),u(),A(e)]),i=j(r),a=t.teams?.[c]??{};w={...t,...a,teamPickOrder:M(t),picks:[],...i},T=n,D=L(w),G(w),V(w,n),H(w),U(w,n),I(w,P(r),n);let s=h(`draftUpdated`);s&&w.lastUpdated&&(s.textContent=`Updated ${o(w.lastUpdated)}`),K(w),ee(w,n),J(w),D===`live`&&setTimeout(W,9e4)}catch{h(`draftTickerTrack`).innerHTML=`<span class="draft-ticker-item">Draft data unavailable</span>`,h(`draftOrder`).innerHTML=`<span class="sidebar-msg">Draft data unavailable</span>`}}function G(e){let t=h(`draftHeroBadge`),n=h(`draftHeroFacts`),i=h(`draftHighlights`),a=h(`draftHeroLogo`);if(a&&(a.src=f(c,56)),t){if(D===`live`)t.innerHTML=`<span class="live-dot" aria-hidden="true"></span> Draft is live`;else if(D===`complete`)t.textContent=`Draft complete`;else{let n=e.startTime?new Date(e.startTime):null,r=n?n.getTime()-Date.now():0;if(r>0){let e=Math.floor(r/864e5),n=Math.floor(r%864e5/36e5),i=Math.floor(r%36e5/6e4);t.textContent=e>0?`${e}d ${n}h until Round 1`:`${n}h ${i}m until Round 1`}else t.textContent=`Draft is underway`}}if(n){let t=e.teamPickOrder??[];n.innerHTML=`
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">When</span>
        <span class="draft-hero-fact-value">${m(e.dates??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">Where</span>
        <span class="draft-hero-fact-value">${m(e.location??``)}</span>
      </div>
      <div class="draft-hero-fact">
        <span class="draft-hero-fact-label">${m(r)} picks</span>
        <span class="draft-hero-fact-value">${t.length} in the first ${t.length?t[t.length-1].round:5} rounds</span>
      </div>
    `}i&&(i.innerHTML=(e.highlights??[]).map((e,t)=>{let n=e.photo?_(T,e.photo):null;return`
      <div class="draft-highlight-card">
        <div class="draft-highlight-head">
          ${n?`<img class="draft-highlight-photo" src="${O(n)}" alt="" loading="lazy">`:`<span class="draft-highlight-icon">${k[t%k.length]}</span>`}
          <div class="draft-highlight-title">${m(e.title)}</div>
        </div>
        <div class="draft-highlight-body">${m(e.body)}</div>
      </div>
    `}).join(``));let o=h(`draftBroadcast`);o&&(o.innerHTML=(e.broadcast??[]).map(e=>`
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
  `}function q(e){return e?.length?`<div class="draft-links-list">${e.map(e=>`<a class="draft-link-item" href="${m(e.url)}" target="_blank" rel="noopener">${m(e.label)}</a>`).join(``)}</div>`:`<span class="sidebar-msg">Unavailable</span>`}function J(e){let t=h(`draftLiveCoverage`),n=h(`draftSources`);t&&(t.innerHTML=q(e.liveCoverage)),n&&(n.innerHTML=q([...e.teamSources??[],...e.sources??[]]))}var Y=new Set([`P`,`SP`,`RP`,`LHP`,`RHP`]);async function X(t,n){if(!t)return null;let r=Y.has(n)?`pitching`:`hitting`;try{let n=(await fetch(`${i}/people/${t}/stats?stats=season&season=${e}&group=${r}`).then(e=>e.json())).stats?.[0]?.splits?.[0]?.stat;return n?r===`hitting`?`${e}: ${n.avg??`.---`}/${n.obp??`.---`}/${n.slg??`.---`}, ${n.homeRuns??0} HR`:`${e}: ${n.era??`-.--`} ERA, ${n.strikeOuts??0} K`:null}catch{return null}}function Z(e){return`${e.year}-${e.pick}-${e.name}`.replace(/\W+/g,``)}function Q(e,t,n,r){let i=r?`<img class="event-history-avatar" src="${O(r)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'event-history-avatar event-history-avatar--placeholder'}))">`:`<span class="event-history-avatar event-history-avatar--placeholder"></span>`;return`
    <div class="event-history-item" data-history-key="${Z(e)}">
      ${i}
      <span class="event-history-year">${e.year}</span>
      <div class="event-history-body">
        <div class="event-history-result">${R(e.name,t)} · ${m(e.position)}</div>
        <div class="event-history-meta">Round ${e.round}, Pick ${e.pick} · ${m(e.school)}</div>
        ${n?`<div class="event-history-stat">${m(n)}</div>`:``}
      </div>
    </div>
  `}async function $(){let t=[e-1,e-2,e-3];return(await Promise.all(t.map(e=>fetch(`${i}/draft/${e}?teamId=${c}`).then(e=>e.json()).catch(()=>null)))).flatMap((e,n)=>(e?.drafts?.rounds??[]).flatMap(e=>e.picks).filter(e=>e.isDrafted&&e.person).sort((e,t)=>e.pickNumber-t.pickNumber).slice(0,2).map(e=>({year:t[n],round:e.pickRound,pick:e.pickNumber,name:e.person.fullName,position:e.person.primaryPosition?.abbreviation??``,school:e.school?.name??``,personId:e.person.id})))}async function ee(e,t){let n=h(`draftHistory`);if(!n)return;let r=await $(),i=[...e.notables??[]].sort((e,t)=>t.year-e.year),o=[...r,...i];o.length?(n.innerHTML=`
    ${r.length?`<div class="roster-group-label">Recent Top Picks</div>${r.map(e=>Q(e,t,null,e.personId)).join(``)}`:``}
    ${i.length?`<div class="roster-group-label">Franchise Notables</div>${i.map(e=>Q(e,t,null,_(t,e.name))).join(``)}`:``}
  `,v(n),o.forEach(async e=>{let r=e.personId??_(t,e.name);r||=await a(e.name);let i=await X(r,e.position),o=n.querySelector(`[data-history-key="${Z(e)}"]`);o&&(o.outerHTML=Q(e,t,i,r))})):n.innerHTML=`<span class="sidebar-msg">No history available</span>`}async function te(){let e=h(`draftNews`);if(e)try{let n=await S(),r=await Promise.allSettled(n.map(e=>C(e).then(t=>({source:e,articles:t.items??[]})))),i=Date.now()-12096e5,a=/draft/i,o=[];for(let e of r){if(e.status!==`fulfilled`)continue;let{source:t,articles:n}=e.value;for(let e of n){let n=d(e.title||``);if(!a.test(n)&&!a.test(e.description||``))continue;let r=new Date(e.pubDate);isNaN(r)||r.getTime()<i||o.push({title:n,link:e.link,pubDate:e.pubDate,sourceName:t.name,thumbnail:l(e)})}}o.sort((e,t)=>new Date(t.pubDate)-new Date(e.pubDate));let s=o.slice(0,12);if(!s.length){e.innerHTML=`<span class="sidebar-msg">No recent Draft news</span>`;return}await Promise.all(s.map(async e=>{e.thumbnail||=await g(e.link)})),e.innerHTML=`<div class="news-thumb-list">${s.map(t).join(``)}</div>`}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function ne(){document.querySelectorAll(`.section-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.sidebar-section`),n=t.closest(`.sidebar`),r=t.classList.contains(`collapsed`);n?.querySelectorAll(`.sidebar-section.collapsible`).forEach(e=>{e!==t&&e.classList.add(`collapsed`)}),t.classList.toggle(`collapsed`,!r)})})}ne(),x()&&(W(),te());