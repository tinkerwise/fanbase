import{B as e,J as t,M as n,N as r,Q as i,S as a,T as o,U as s,Z as c,_ as l,b as u,et as d,i as f,j as p,p as m,q as h,s as g,t as _,z as v}from"./utils.DnOkClm6.js";import{t as y}from"./state.DWOT-98V.js";import{a as b,i as x,o as S,s as C,t as w}from"./scores.C5Sk9Nnn.js";import{n as ee,t as te}from"./weather.B8TEw_D_.js";async function T(){try{let t=await fetch(`${r}/standings?leagueId=103,104&season=${e}&standingsTypes=regularSeason`).then(e=>e.json());y.standings=t.records.map(e=>({divisionId:e.division.id,division:n[e.division.id]??e.division.name??String(e.division.id),teams:e.teamRecords.map(e=>({id:e.team.id,abbrev:s[e.team.id]??e.team.abbreviation??e.team.name.slice(0,3).toUpperCase(),wins:e.wins,losses:e.losses,gb:e.gamesBack===`0`?`-`:e.gamesBack,streak:e.streak?.streakCode??`-`,isOrioles:e.team.id===c()}))}));let i=y.standings.find(e=>e.teams.some(e=>e.isOrioles));y.activeDiv=i?.divisionId??y.standings[0]?.divisionId??null,E(),D()}catch{_(`standingsWrap`).innerHTML=`<span class="sidebar-msg">Standings unavailable</span>`}}function E(){let e=_(`divTabs`);e.innerHTML=y.standings.map(e=>{let t=e.division.replace(`American League `,`AL `).replace(`National League `,`NL `);return`<button class="div-tab${e.divisionId===y.activeDiv?` active`:``}"
      data-div="${e.divisionId}">${g(t)}</button>`}).join(``),e.querySelectorAll(`.div-tab`).forEach(e=>{e.addEventListener(`click`,()=>{y.activeDiv=Number(e.dataset.div),E(),D()})})}function D(){let e=y.standings.find(e=>e.divisionId===y.activeDiv);e&&(_(`standingsWrap`).innerHTML=`
    <table class="standings-table">
      <thead><tr>
        <th>Team</th><th>W</th><th>L</th><th>GB</th><th>Str</th>
      </tr></thead>
      <tbody>${e.teams.map(e=>{let t=h[e.id]?`https://www.mlb.com/${h[e.id]}`:`#`;return`<tr class="${e.isOrioles?`orioles-row`:``}">
          <td class="team-abbrev"><a href="${t}" target="_blank" rel="noopener"><img class="standings-team-logo" src="${p(e.id,14)}" alt="" width="14" height="14" loading="lazy" decoding="async">${g(e.abbrev)}</a></td>
          <td>${e.wins}</td><td>${e.losses}</td>
          <td>${g(e.gb)}</td><td>${g(e.streak)}</td>
        </tr>`}).join(``)}
      </tbody>
    </table>`)}async function O(){let e=_(`onDeckWrap`);if(i())e&&(e.innerHTML=`
      <div class="on-deck-no-team">
        <div class="on-deck-no-team-icon">⚾</div>
        <div class="on-deck-no-team-msg">Pick your team to see their schedule and upcoming games.</div>
      </div>`);else try{let n=l(0),r=l(1),i=l(14),a=c(),o=((await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${a}&startDate=${n}&endDate=${i}&hydrate=probablePitcher,venue`).then(e=>e.json())).dates??[]).flatMap(e=>e.games),u=n,d=o.find(e=>e.gameDate.startsWith(u)),f=d?.status?.abstractGameState===`Live`?o.find(e=>!e.gameDate.startsWith(u)&&e.status.abstractGameState!==`Final`):o.find(e=>e.status.abstractGameState!==`Final`);if(!f){e.innerHTML=`<span class="sidebar-msg">No upcoming games</span>`;return}let h=f.teams.away,_=f.teams.home,v=_.team.id===a,y=v?h:_,b=s[y.team.id]??y.team.name.slice(0,3),x=v?b:y.team.name,S=new Date(f.gameDate),C=S.toLocaleDateString(`en-US`,{weekday:`short`,month:`short`,day:`numeric`}),w=S.toLocaleTimeString(`en-US`,{hour:`numeric`,minute:`2-digit`}),T=f.venue?.name??``;await m(f.venue?.id);let E=f.gameDate.startsWith(u),D=f.gameDate.startsWith(r),O=``;if(E||D){await te([f]);let e=ee(f);O=e?`<div class="on-deck-weather" aria-label="${g(e.condition)} ${e.temp} degrees">
            <span class="on-deck-weather-icon">${e.emoji}</span>
            <span class="on-deck-weather-temp">${e.temp}°F</span>
          </div>`:``}let k=`https://www.mlb.com/gameday/${t[h.team.id]??``}-vs-${t[_.team.id]??``}/${f.gameDate.slice(0,10).replace(/-/g,`/`)}/${f.gamePk}/preview`,A=o.filter(e=>e.status.abstractGameState!==`Final`).slice(0,5).map(e=>{let n=e.teams.away,r=e.teams.home,i=r.team.id===a,o=i?n:r,c=s[o.team.id]??o.team.name.slice(0,3),l=new Date(e.gameDate).toLocaleDateString(`en-US`,{weekday:`short`}),u=`https://www.mlb.com/gameday/${t[n.team.id]??``}-vs-${t[r.team.id]??``}/${e.gameDate.slice(0,10).replace(/-/g,`/`)}/${e.gamePk}/preview`;return`<a class="sched-box${e.status?.abstractGameState===`Live`?` sched-box--live`:``}" href="${u}" target="_blank" rel="noopener">
        <span class="sched-box-day">${g(l)}</span>
        <div class="sched-box-logo-wrap">
          <span class="sched-box-at">${i?`vs`:`@`}</span>
          <img class="sched-box-logo" src="${p(o.team.id,22)}" alt="${g(c)}" width="22" height="22">
        </div>
      </a>`}).join(``),j=A?`<div class="sched-row-wrap">${A}</div>`:``,M=d&&d.status?.abstractGameState!==`Final`,N=``;if(M){let e=d.teams.away,n=d.teams.home,r=t[e.team.id]??``,i=t[n.team.id]??``,a=d.gameDate.slice(0,10).replace(/-/g,`/`),o=d.status?.abstractGameState===`Live`?`live`:`preview`,s=`https://www.mlb.com/gameday/${r}-vs-${i}/${a}/${d.gamePk}/${o}`;N=`
      <div class="gameday-media-strip">
        <a class="gameday-media-link" href="${s}" target="_blank" rel="noopener" aria-label="Watch on MLB.com">
          <svg class="gameday-media-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span class="gameday-media-label">Watch</span>
          <span class="gameday-media-network">MLB.tv</span>
        </a>
        <a class="gameday-media-link" href="${s}" target="_blank" rel="noopener" aria-label="Listen on MLB.com">
          <svg class="gameday-media-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          <span class="gameday-media-label">Listen</span>
          <span class="gameday-media-network">MLB Audio</span>
        </a>
      </div>`}e.innerHTML=`
      <div class="on-deck-card-wrap">
        <a class="on-deck-card" href="${k}" target="_blank" rel="noopener">
          ${O}
          <div class="on-deck-matchup">
            <img class="on-deck-logo" src="${p(y.team.id,28)}" alt="" width="28" height="28">
            <span class="on-deck-opp">${g(x)}</span>
          </div>
          <div class="on-deck-details">
            <span class="on-deck-date">${g(C)} · ${g(w)}</span>
            <span class="on-deck-venue">${g(T)}</span>
          </div>
        </a>
        ${N}
      </div>
      ${j}`}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function k(e){return`https://baseballsavant.mlb.com/savant-player/${e}`}var A={D10:`10-Day IL`,D15:`15-Day IL`,D60:`60-Day IL`};async function j(){let t=_(`rosterWrap`);if(i())t&&(t.innerHTML=`<div class="sidebar-no-team-msg">Select a team to see their roster.</div>`);else try{let n=c(),r=h[n]??`orioles`,i=x(v,r),a=(await fetch(`https://statsapi.mlb.com/api/v1/teams/${n}/roster?rosterType=40Man&season=${e}`).then(e=>e.json())).roster??[];if(!a.length){t.innerHTML=`<span class="sidebar-msg">Roster unavailable</span>`;return}let o=a.filter(e=>e.status?.code===`A`),s=a.filter(e=>[`D10`,`D15`,`D60`].includes(e.status?.code)),l=a.filter(e=>e.status?.code===`RM`),u={C:0,"1B":1,"2B":2,"3B":3,SS:4,LF:5,CF:5,RF:5,OF:5,DH:6},d=e=>e.slice().sort((e,t)=>{let n=e.position?.abbreviation??``,r=t.position?.abbreviation??``,i=!Object.prototype.hasOwnProperty.call(u,n);return i===!Object.prototype.hasOwnProperty.call(u,r)?(u[n]??9)-(u[r]??9)||e.person.fullName.localeCompare(t.person.fullName):i?1:-1}),f=(e,t={})=>{let n=k(e.person.id),i=e.position?.abbreviation??``,a=t.badge?`<span class="roster-badge roster-badge--${t.badgeType??`il`}">${g(t.badge)}</span>`:``,o=e.person.fullName,s=b(e.person.id,o,r),c=g(o),l;if(s.length>0)l=s.map(e=>`<a class="walkup-song-link" href="${g(e)}" data-song-url="${g(e)}" data-player-name="${c}" target="_blank" rel="noopener" title="Play walk-up song" aria-label="Play walk-up song for ${c}">${w}</a>`).join(``);else{let e=`https://open.spotify.com/search/${encodeURIComponent(o+` walk up song`)}`;l=`<a class="walkup-song-link walkup-song-link--search" href="${g(e)}" data-player-name="${c}" target="_blank" rel="noopener" title="Search walk-up song for ${c}" aria-label="Search walk-up song for ${c}">${w}</a>`}return`<div class="roster-item${t.muted?` roster-item--muted`:``}">
        <span class="roster-num">${g(e.jerseyNumber??``)}</span>
        <a class="roster-name" href="${n}" target="_blank" rel="noopener">${g(o)}</a>${l}
        <span class="roster-pos">${g(i)}</span>
        ${a}
      </div>`},p=d(o.filter(e=>![`SP`,`RP`,`P`].includes(e.position?.abbreviation??``))),m=d(o.filter(e=>[`SP`,`RP`,`P`].includes(e.position?.abbreviation??``))),_=()=>{let e=``;return p.length&&(e+=`<div class="roster-group-label">Position Players</div>`,e+=p.map(e=>f(e)).join(``)),m.length&&(e+=`<div class="roster-group-label">Pitchers</div>`,e+=m.map(e=>f(e)).join(``)),s.length&&(e+=`<div class="roster-group-label">Injured List</div>`,e+=d(s).map(e=>f(e,{badge:A[e.status?.code]??`IL`,badgeType:`il`})).join(``)),l.length&&(e+=`<div class="roster-group-label">Minors</div>`,e+=d(l).map(e=>f(e,{muted:!0})).join(``)),`<div class="roster-list">${e}</div>
        <a class="widget-link" href="https://www.mlb.com/${r}/roster/40-man" target="_blank" rel="noopener">Full 40-man roster ↗</a>`};t.innerHTML=_(),i.then(()=>{t.innerHTML=_()}).catch(()=>{})}catch{t.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}async function M(){let e=_(`transactionsWrap`);if(i())e&&(e.innerHTML=`<div class="sidebar-no-team-msg">Select a team to see their transactions.</div>`);else try{let t=l(0),n=new Date;n.setDate(n.getDate()-14);let r=n.toISOString().slice(0,10),i=c(),a=h[i]??`orioles`,o=((await fetch(`https://statsapi.mlb.com/api/v1/transactions?teamId=${i}&startDate=${r}&endDate=${t}`).then(e=>e.json())).transactions??[]).sort((e,t)=>new Date(t.date||t.effectiveDate)-new Date(e.date||e.effectiveDate)).slice(0,12);if(!o.length){e.innerHTML=`<span class="sidebar-msg">No recent transactions</span>`;return}e.innerHTML=`<div class="txn-list">${o.map(e=>{let t=new Date(e.date||e.effectiveDate).toLocaleDateString(`en-US`,{month:`short`,day:`numeric`}),n=e.person?.id,r=n?`https://www.mlb.com/player/${n}`:``,i=e.person?.fullName??`Unknown`,a=e.description||`${i} - ${e.typeDesc??e.typeCode}`,o=r?a.replace(i,`<a class="txn-player" href="${r}" target="_blank" rel="noopener">${g(i)}</a>`):g(a);return`<div class="txn-item">
        <span class="txn-date">${g(t)}</span>
        <span class="txn-desc">${o}</span>
      </div>`}).join(``)}</div>
      <a class="widget-link" href="https://www.mlb.com/${a}/roster/transactions" target="_blank" rel="noopener">View all transactions ↗</a>`}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}async function N(){let t=_(`ilWrap`);if(i())t&&(t.innerHTML=`<div class="sidebar-no-team-msg">Select a team to see their injury report.</div>`);else try{let[n,i]=await Promise.all([fetch(`${r}/teams/${c()}/roster?rosterType=40Man`).then(e=>e.json()),fetch(`${r}/transactions?teamId=${c()}&startDate=${e}-01-01&endDate=${l(0)}`).then(e=>e.json()).catch(()=>({transactions:[]}))]),a=(n.roster??[]).filter(e=>e.status?.description?.toLowerCase().includes(`injured`));if(!a.length){t.innerHTML=`<span class="sidebar-msg">No players on IL</span>`;return}let o=e=>{let t=e.status.description.match(/(\d+)-day/i);return t?parseInt(t[1]):99},s=i.transactions??[],d=e=>{if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t},f=e=>{let t=d(e);return t?t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`}):``},p=e=>{let t=e.person?.id,n=o(e),r=s.filter(e=>e.person?.id===t).filter(e=>/injured list/i.test(e.description||``)||/status change/i.test(e.typeDesc||``)).sort((e,t)=>new Date(e.date)-new Date(t.date)),i=r.filter(e=>/placed .*injured list/i.test(e.description||``)),a=i.length?i[i.length-1]:null,c=i.length?i[0]:null,l=a||c||r[r.length-1]||null;if(!l)return{startedLabel:``,expectedLabel:``,sortTime:2**53-1};let u=(l.description||``).match(/retroactive to ([A-Za-z]+ \d{1,2}, \d{4})/i),p=d(u?.[1]||l.date),m=!!u,h=p?`Started ${f(p)}${m?` (retro)`:``}`:``,g=``,_=2**53-1;if(p&&Number.isFinite(n)&&n<60){let e=new Date(p);e.setDate(e.getDate()+n),g=`Earliest ${f(e)}`,_=e.getTime()}else p&&(_=p.getTime()+n*864e5);return{startedLabel:h,expectedLabel:g,sortTime:_}},m=a.map(e=>({player:e,timeline:p(e)}));m.sort((e,t)=>e.timeline.sortTime-t.timeline.sortTime||o(e.player)-o(t.player)||e.player.person.fullName.localeCompare(t.player.person.fullName));let h={};for(let e of m){let t=o(e.player),n=[10,15,60].includes(t)?`${t}-Day IL`:`IL`;(h[n]??=[]).push(e)}t.innerHTML=`<div class="il-list">${[`10-Day IL`,`15-Day IL`,`60-Day IL`,`IL`].filter(e=>h[e]?.length).map(e=>{let t=h[e].map(({player:e,timeline:t})=>{let n=`https://www.mlb.com/player/${e.person.id}`,r=u(e.note||``),i=e.position?.abbreviation??``,a=t.expectedLabel.replace(`Earliest `,``)||t.startedLabel||``;return`<div class="il-item">
          <div class="il-topline">
            <a class="il-name" href="${n}" target="_blank" rel="noopener">${g(e.person.fullName)}</a>
            ${i?`<span class="il-pos">${g(i)}</span>`:``}
            ${a?`<span class="il-eta">${g(a)}</span>`:``}
          </div>
          ${r?`<div class="il-note">${g(r)}</div>`:``}
        </div>`}).join(``);return`<div class="il-group"><div class="il-group-label">${g(e)}</div>${t}</div>`}).join(``)}</div>`}catch{t.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}var ne=[{id:`PLL-lmlkrmJakABrOT6FmV0mU-5oIF8nGu`,label:`MLB Fastcast`},{id:`PLL-lmlkrmJalPg-EgiZ92Eyg9YodLbQsE`,label:`MLB Top Plays`}],P={id:`PLoeYQM_iUEVwNa9HwsFfS0aWvshxoYnhy`,label:`Orioles Moments`,random:!0},F=`PLoeYQM_iUEVyoMu-AIZFXs9ja6GMzF1Ce`;async function I(e){let t=`${v}?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?playlist_id=${e.id}`)}`,n=(await fetch(t).then(e=>e.json())).items??[];if(!n.length)return null;let r=e.random?n[Math.floor(Math.random()*n.length)]:n[0];if(!r)return null;let i=r.link||``,a=C(i);return{title:f(r.title),label:e.label,thumb:r.thumbnail||(a?`https://i.ytimg.com/vi/${a}/mqdefault.jpg`:``),url:i,videoId:a}}function L(e){let t=new Date(`${e}T12:00:00`);if(isNaN(t))return``;let n=String(t.getFullYear()).slice(-2);return`${t.getMonth()+1}/${t.getDate()}/${n}`}function R(e){let t=(e?.content?.media?.epgAlternate??[]).flatMap(e=>e.items??[]);return t.find(e=>e.keywordsAll?.some(e=>e.value===`mlb_recap`||e.value===`game-recap`))||t.find(e=>e.keywordsAll?.some(e=>e.value===`condensed_game`||e.value===`condensed-game`))||null}function z(e){let t=e?.image?.cuts??[];return t.find(e=>e.width===640)?.src||t.find(e=>e.aspectRatio===`16:9`)?.src||``}async function B(){let e=c(),t=l(0),n=l(-4),[i,a]=await Promise.all([e===110?fetch(`${v}?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?playlist_id=${F}`)}`).then(e=>e.json()):Promise.resolve({items:[]}),fetch(`${r}/schedule?sportId=1&teamId=${e}&startDate=${n}&endDate=${t}&hydrate=game(content(media(epg)))`).then(e=>e.json())]),o=i.items??[],u=(a.dates??[]).flatMap(e=>e.games??[]).filter(e=>e.status?.abstractGameState===`Final`).sort((e,t)=>new Date(t.gameDate)-new Date(e.gameDate))[0]??null,d=u?.officialDate?L(u.officialDate):``,p=d?o.find(e=>(e.title||``).includes(`(${d})`)):o[0];if(p){let e=p.link||``,t=C(e);return{title:f(p.title),label:`${s[c()]??`Orioles`} Game Recaps`,thumb:p.thumbnail||(t?`https://i.ytimg.com/vi/${t}/mqdefault.jpg`:``),url:e,videoId:t}}let m=u?R(u):null;return m?{title:f(m.headline||m.title||m.blurb||`${s[c()]??`Game`} Recap`),label:`${s[c()]??`Orioles`} Recap`,thumb:z(m),url:`https://www.mlb.com/video/${m.slug||m.id}`,videoId:``}:null}async function V(){let e=_(`videoWrap`);try{let t=(await Promise.allSettled([B(),...[...ne,...c()===110?[P]:[]].map(I)])).filter(e=>e.status===`fulfilled`&&e.value).map(e=>e.value);if(!t.length){e.innerHTML=`<span class="sidebar-msg">No videos available</span>`;return}e.innerHTML=`<div class="video-list">${t.map(e=>`<div class="video-item" data-video-id="${g(e.videoId)}" data-video-url="${g(e.url)}">
        <div class="video-thumb-wrap">
          <img class="video-thumb" src="${g(e.thumb)}" alt="" loading="lazy">
          <svg class="video-play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="video-info">
          <span class="video-channel">${g(e.label)}</span>
          <span class="video-title">${g(e.title)}</span>
        </div>
      </div>`).join(``)}</div>`,S(e,`.video-item`)}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}var re=`https://feeds.megaphone.fm/ESP1723897648`,H=`https://www.espn.com/espnradio/podcast/archive?id=2386164`;function ie(e){if(!e)return;let t=e.querySelector(`.podcast-hover-panel`);if(!t)return;document.querySelectorAll(`.podcast-hover-panel--floating`).forEach(e=>e.remove()),t.classList.add(`podcast-hover-panel--floating`),document.body.appendChild(t);let n=!1,r=()=>{let n=e.getBoundingClientRect();t.style.left=`${Math.min(n.right+12,window.innerWidth-t.offsetWidth-12)}px`,t.style.top=`${Math.max(12,n.top)}px`},i=()=>{n=!0,r(),t.classList.add(`is-visible`)},a=()=>{n=!1,t.classList.remove(`is-visible`)},o=()=>{n&&r()};e.addEventListener(`mouseenter`,i),e.addEventListener(`mouseleave`,a),e.addEventListener(`focusin`,i),e.addEventListener(`focusout`,a),window.addEventListener(`scroll`,o,{passive:!0}),window.addEventListener(`resize`,o)}async function ae(){let e=_(`podcastWrap`);try{let t=await fetch(re).then(e=>e.text()),n=new DOMParser().parseFromString(t,`application/xml`),r=Array.from(n.querySelectorAll(`channel > item`)),i=r.findIndex(e=>{let t=e.querySelector(`enclosure`);return t&&t.getAttribute(`type`)?.startsWith(`audio/`)}),s=i>=0?r[i]:null;if(!s){e.innerHTML=`<div class="podcast-card">
        <span class="podcast-kicker">Baseball Tonight</span>
        <div class="podcast-title">Podcast feed is temporarily unavailable.</div>
        <div class="podcast-links">
          <a class="podcast-link" href="${H}" target="_blank" rel="noopener">Open show page ↗</a>
        </div>
      </div>`;return}let c=s.querySelector(`enclosure`),l=c?.getAttribute(`url`)||``,u=c?.getAttribute(`type`)||`audio/mpeg`,d=s.querySelector(`title`)?.textContent||`Latest episode`,p=s.querySelector(`description`)?.textContent||``,m=s.querySelector(`pubDate`)?.textContent||``,h=s.querySelector(`link`)?.textContent||H,_=f(d),v=f(p),y=a(m),b=i>0?`<span class="podcast-fallback-note">Showing a recent playable episode</span>`:``,x=_.length>62?`podcast-title podcast-title--scroll`:`podcast-title`,S=v?`<div class="podcast-hover-panel" aria-hidden="true">
          <div class="podcast-hover-title">${g(_)}</div>
          <div class="podcast-hover-desc">${g(v)}</div>
        </div>`:``;e.innerHTML=`<div class="podcast-card podcast-card--hoverable">
      <span class="podcast-kicker">Baseball Tonight</span>
      ${b}
      <div class="${x}"><span class="podcast-title-track">${g(_)}</span></div>
      <div class="podcast-meta">
        <span>${g(y||`Latest episode`)}</span>
        <span>Buster Olney</span>
      </div>
      <audio class="podcast-player" controls preload="metadata">
        <source src="${g(o(l))}" type="${g(u)}">
        Your browser does not support the audio element.
      </audio>
      <div class="podcast-links">
        <a class="podcast-link" href="${g(o(h)||H)}" target="_blank" rel="noopener">Episode details ↗</a>
        <a class="podcast-link" href="${H}" target="_blank" rel="noopener">Show archive ↗</a>
      </div>
      ${S}
    </div>`,ie(e.querySelector(`.podcast-card--hoverable`))}catch{e.innerHTML=`<div class="podcast-card">
      <span class="podcast-kicker">Baseball Tonight</span>
      <div class="podcast-title">Podcast feed is temporarily unavailable.</div>
      <div class="podcast-links">
        <a class="podcast-link" href="${H}" target="_blank" rel="noopener">Open show page ↗</a>
      </div>
    </div>`}}var U={},W=`orioles`,oe=[`onBasePlusSlugging`,`sluggingPercentage`,`onBasePercentage`,`battingAverage`,`homeRuns`,`runsBattedIn`,`hits`,`baseOnBalls`,`walks`],se=[`earnedRunAverage`,`walksAndHitsPerInningPitched`,`strikeoutsPer9Inn`,`strikeouts`,`walksPer9Inn`,`qualityStarts`,`wins`],ce=`onBasePlusSlugging,sluggingPercentage,onBasePercentage,battingAverage,homeRuns,runsBattedIn,hits,baseOnBalls,earnedRunAverage,walksAndHitsPerInningPitched,strikeoutsPer9Inn,strikeouts,walksPer9Inn,qualityStarts,wins`,le=`onBasePlusSlugging,sluggingPercentage,onBasePercentage,battingAverage,homeRuns,runsBattedIn,hits,walks,earnedRunAverage,walksAndHitsPerInningPitched,strikeoutsPer9Inn,strikeouts,walksPer9Inn,wins`,G={battingAverage:`AVG`,onBasePercentage:`OBP`,onBasePlusSlugging:`OPS`,homeRuns:`HR`,hits:`H`,baseOnBalls:`BB`,walks:`BB`,sluggingPercentage:`SLG`,runsBattedIn:`RBI`},K={earnedRunAverage:`ERA`,strikeouts:`SO`,qualityStarts:`QS`,walksAndHitsPerInningPitched:`WHIP`,wins:`W`,strikeoutsPer9Inn:`K/9`,walksPer9Inn:`BB/9`},ue={onBasePlusSlugging:{stat:`on_base_plus_slg`,type:`batter`,sortDir:`desc`},sluggingPercentage:{stat:`slg_percent`,type:`batter`,sortDir:`desc`},onBasePercentage:{stat:`on_base_percent`,type:`batter`,sortDir:`desc`},battingAverage:{stat:`batting_avg`,type:`batter`,sortDir:`desc`},homeRuns:{stat:`home_run`,type:`batter`,sortDir:`desc`},runsBattedIn:{stat:`rbi`,type:`batter`,sortDir:`desc`},hits:{stat:`h`,type:`batter`,sortDir:`desc`},baseOnBalls:{stat:`bb`,type:`batter`,sortDir:`desc`},walks:{stat:`bb`,type:`batter`,sortDir:`desc`},earnedRunAverage:{stat:`p_era`,type:`pitcher`,sortDir:`asc`},walksAndHitsPerInningPitched:{type:`pitcher`,sort:`p_walk`,sortDir:`asc`,selections:[`p_walk`,`p_total_hits`,`p_formatted_ip`],x:`p_walk`,y:`p_walk`},strikeoutsPer9Inn:{type:`pitcher`,sort:`p_strikeout`,sortDir:`desc`,selections:[`p_strikeout`,`p_formatted_ip`],x:`p_strikeout`,y:`p_strikeout`},strikeouts:{stat:`p_strikeout`,type:`pitcher`,sortDir:`desc`},walksPer9Inn:{type:`pitcher`,sort:`p_walk`,sortDir:`asc`,selections:[`p_walk`,`p_formatted_ip`],x:`p_walk`,y:`p_walk`},qualityStarts:{stat:`p_quality_start`,type:`pitcher`,sortDir:`desc`},wins:{stat:`p_win`,type:`pitcher`,sortDir:`desc`}};function de(t){let n=ue[t];if(!n)return`#`;let r=n.selections??[n.stat],i=n.sort??n.stat,a=n.x??i,o=n.y??i,s=new URL(`https://baseballsavant.mlb.com/leaderboard/custom`);return s.searchParams.set(`year`,String(e)),s.searchParams.set(`type`,n.type),s.searchParams.set(`min`,`q`),s.searchParams.set(`selections`,r.join(`,`)),s.searchParams.set(`sort`,i),s.searchParams.set(`sortDir`,n.sortDir),s.searchParams.set(`chart`,`false`),s.searchParams.set(`chartType`,`beeswarm`),s.searchParams.set(`filter`,``),s.searchParams.set(`r`,`no`),s.searchParams.set(`x`,a),s.searchParams.set(`y`,o),s.toString()}var q=`onBasePlusSlugging,homeRuns,battingAverage,earnedRunAverage,strikeouts,walksAndHitsPerInningPitched`,J=[`onBasePlusSlugging`,`homeRuns`,`battingAverage`],Y=[`earnedRunAverage`,`strikeouts`,`walksAndHitsPerInningPitched`];function fe(t){return t===`orioles`?`${r}/teams/${c()}/leaders?leaderCategories=${ce}&season=${e}&leaderGameTypes=R&playerPool=Qualified`:`${r}/stats/leaders?leaderCategories=${le}&season=${e}&leaderGameTypes=R${t===`al`?`&leagueId=103`:t===`nl`?`&leagueId=104`:``}&playerPool=Qualified&limit=1`}function X(e,t=oe,n=se){let r=(e,t)=>e.sort((e,n)=>(t.indexOf(e.key)===-1?99:t.indexOf(e.key))-(t.indexOf(n.key)===-1?99:t.indexOf(n.key)));return{batting:r(e.filter(e=>G[e.leaderCategory]&&e.statGroup===`hitting`&&t.includes(e.leaderCategory)).map(e=>({key:e.leaderCategory,label:G[e.leaderCategory],leaders:e.leaders})),t),pitching:r(e.filter(e=>K[e.leaderCategory]&&e.statGroup===`pitching`&&n.includes(e.leaderCategory)).map(e=>({key:e.leaderCategory,label:K[e.leaderCategory],leaders:e.leaders})),n)}}async function Z(){let t=_(`leadersWrap`);try{if(W===`roy`){if(!U.roy){let[t,n]=await Promise.all([fetch(`${r}/stats/leaders?leaderCategories=${q}&season=${e}&leaderGameTypes=R&leagueId=103&playerPool=Rookies&limit=1`).then(e=>e.json()),fetch(`${r}/stats/leaders?leaderCategories=${q}&season=${e}&leaderGameTypes=R&leagueId=104&playerPool=Rookies&limit=1`).then(e=>e.json())]);U.roy={al:X(t.leagueLeaders??[],J,Y),nl:X(n.leagueLeaders??[],J,Y)}}$();return}let t=fe(W);if(!U[W]){let e=await fetch(t).then(e=>e.json()),n=W===`orioles`?e.teamLeaders??[]:e.leagueLeaders??[];U[W]=X(n)}$()}catch{t.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function Q(e){let t=e.leaders?.[0];if(!t)return``;let n=(t.person?.fullName??``).split(` `).pop()??``,r=t.person?.id;return`<div class="leader-item">
    <a class="leader-cat" href="${de(e.key)}" target="_blank" rel="noopener">${g(e.label)}</a>
    <a class="leader-name" href="${r?k(r):`#`}" target="_blank" rel="noopener">${g(n)}</a>
    <span class="leader-val">${g(t.value)}</span>
  </div>`}function $(){let e=_(`leadersWrap`),t=U[W];if(!t){e.innerHTML=`<span class="sidebar-msg">Loading…</span>`;return}let n=`<div class="leaders-scope">
    <button class="leaders-scope-btn${W===`orioles`?` active`:``}" data-scope="orioles"><img class="leaders-scope-logo" src="${p(c(),12)}" alt="" width="12" height="12" loading="eager" decoding="async">${s[c()]??`O's`}</button>
    <button class="leaders-scope-btn${W===`al`?` active`:``}" data-scope="al"><img class="leaders-scope-logo leaders-scope-logo--league" src="https://midfield.mlbstatic.com/v1/team/american-league/logo" alt="" width="12" height="12" loading="eager" decoding="async">AL</button>
    <button class="leaders-scope-btn${W===`nl`?` active`:``}" data-scope="nl"><img class="leaders-scope-logo leaders-scope-logo--league" src="https://midfield.mlbstatic.com/v1/team/national-league/logo" alt="" width="12" height="12" loading="eager" decoding="async">NL</button>
    <button class="leaders-scope-btn${W===`mlb`?` active`:``}" data-scope="mlb"><img class="leaders-scope-logo leaders-scope-logo--league" src="https://www.mlbstatic.com/team-logos/apple-touch-icons-180x180/mlb.png" alt="" width="12" height="12" loading="eager" decoding="async">MLB</button>
    <button class="leaders-scope-btn${W===`roy`?` active`:``}" data-scope="roy">ROY</button>
  </div>`,r;if(W===`roy`){let e=(e,t)=>`
      <div class="leaders-roy-league">${g(e)} ROY Watch</div>
      <div class="leaders-group">
        <div class="leaders-group-title">Batting</div>
        <div class="leaders-list">${t.batting.map(Q).join(``)}</div>
      </div>
      <div class="leaders-group">
        <div class="leaders-group-title">Pitching</div>
        <div class="leaders-list">${t.pitching.map(Q).join(``)}</div>
      </div>`;r=e(`AL`,t.al)+e(`NL`,t.nl)}else r=`
      <div class="leaders-group">
        <div class="leaders-group-title">Batting</div>
        <div class="leaders-list">${t.batting.map(Q).join(``)}</div>
      </div>
      <div class="leaders-group">
        <div class="leaders-group-title">Pitching</div>
        <div class="leaders-list">${t.pitching.map(Q).join(``)}</div>
      </div>`;e.innerHTML=`
    <div class="leaders-controls"><div class="leaders-controls-row">${n}</div></div>
    <div class="leaders-stack">${r}</div>`,e.querySelectorAll(`.leaders-scope-btn`).forEach(e=>{e.addEventListener(`click`,()=>{W=e.dataset.scope,Z()})})}var pe={109:`diamondbacks`};function me(){let e=_(`contractsWrap`);if(!e)return;let n=c(),r=d[n]??d[110],i=pe[r.id]??t[r.id],a=r.fullName.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``);e.innerHTML=`
    <p class="contracts-blurb">Salaries, contracts and luxury-tax payroll for the ${new Date().getFullYear()} ${g(r.name)}.</p>
    <a class="widget-link-card" href="https://www.fangraphs.com/roster-resource/payroll/${encodeURIComponent(i)}" target="_blank" rel="noopener">
      <span class="widget-link-card-label">Contracts &amp; Payroll</span>
      <span class="widget-link-card-sub">FanGraphs RosterResource ↗</span>
    </a>
    <a class="widget-link-card" href="https://www.spotrac.com/mlb/${a}/payroll/" target="_blank" rel="noopener">
      <span class="widget-link-card-label">Payroll</span>
      <span class="widget-link-card-sub">Spotrac: salaries, options &amp; totals ↗</span>
    </a>
    <a class="widget-link-card" href="https://www.spotrac.com/mlb/${a}/tax/" target="_blank" rel="noopener">
      <span class="widget-link-card-label">Luxury Tax</span>
      <span class="widget-link-card-sub">Spotrac: competitive balance tax payroll ↗</span>
    </a>`}export{ae as a,M as c,O as i,V as l,N as n,j as o,Z as r,T as s,me as t};