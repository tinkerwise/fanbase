import{$ as e,C as t,E as n,F as r,G as i,H as a,N as o,P as s,Q as c,V as l,Y as u,_ as d,i as f,nt as p,p as m,s as h,t as g,tt as _,x as v}from"./utils.DaJInyY3.js";import{r as y}from"./frontOfficeData.DxZPLl-i.js";import{t as b}from"./state.C-RM2mMG.js";import{a as x,i as S,o as C,s as w,t as T}from"./scores.DG3OLE9n.js";import{n as E,t as ee}from"./weather.CspRqzO0.js";import{r as D}from"./scheduleGames.DjOffK15.js";async function O(){try{let e=await fetch(`${r}/standings?leagueId=103,104&season=${a}&standingsTypes=regularSeason`).then(e=>e.json());b.standings=e.records.map(e=>({divisionId:e.division.id,division:s[e.division.id]??e.division.name??String(e.division.id),teams:e.teamRecords.map(e=>({id:e.team.id,abbrev:i[e.team.id]??e.team.abbreviation??e.team.name.slice(0,3).toUpperCase(),wins:e.wins,losses:e.losses,gb:e.gamesBack===`0`?`-`:e.gamesBack,streak:e.streak?.streakCode??`-`,isOrioles:e.team.id===c()}))}));let t=b.standings.find(e=>e.teams.some(e=>e.isOrioles));b.activeDiv=t?.divisionId??b.standings[0]?.divisionId??null,k(),A()}catch{g(`standingsWrap`).innerHTML=`<span class="sidebar-msg">Standings unavailable</span>`}}function k(){let e=g(`divTabs`);e.innerHTML=b.standings.map(e=>{let t=e.division.replace(`American League `,`AL `).replace(`National League `,`NL `);return`<button class="div-tab${e.divisionId===b.activeDiv?` active`:``}"
      data-div="${e.divisionId}">${h(t)}</button>`}).join(``),e.querySelectorAll(`.div-tab`).forEach(e=>{e.addEventListener(`click`,()=>{b.activeDiv=Number(e.dataset.div),k(),A()})})}function A(){let e=b.standings.find(e=>e.divisionId===b.activeDiv);e&&(g(`standingsWrap`).innerHTML=`
    <table class="standings-table">
      <thead><tr>
        <th>Team</th><th>W</th><th>L</th><th>GB</th><th>Str</th>
      </tr></thead>
      <tbody>${e.teams.map(e=>{let t=u[e.id]?`https://www.mlb.com/${u[e.id]}`:`#`;return`<tr class="${e.isOrioles?`orioles-row`:``}">
          <td class="team-abbrev"><a href="${t}" target="_blank" rel="noopener"><img class="standings-team-logo" src="${o(e.id,14)}" alt="" width="14" height="14" loading="lazy" decoding="async">${h(e.abbrev)}</a></td>
          <td>${e.wins}</td><td>${e.losses}</td>
          <td>${h(e.gb)}</td><td>${h(e.streak)}</td>
        </tr>`}).join(``)}
      </tbody>
    </table>`)}async function j(){let t=g(`onDeckWrap`);if(e())t&&(t.innerHTML=`
      <div class="on-deck-no-team">
        <div class="on-deck-no-team-icon">⚾</div>
        <div class="on-deck-no-team-msg">Pick your team to see their schedule and upcoming games.</div>
      </div>`);else try{let e=d(0),n=d(1),r=d(14),a=c(),s=((await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${a}&startDate=${e}&endDate=${r}&hydrate=probablePitcher,venue`).then(e=>e.json())).dates??[]).flatMap(e=>e.games),l=e,u=s.find(e=>e.gameDate.startsWith(l)),f=u?.status?.abstractGameState===`Live`,g=e=>{let t=D(e).state;return t===`scheduled`||t===`live`},_=f?s.find(e=>!e.gameDate.startsWith(l)&&g(e)):s.find(g);if(!_){t.innerHTML=`<span class="sidebar-msg">No upcoming games</span>`;return}let v=_.teams.away,y=_.teams.home,b=y.team.id===a,x=b?v:y,S=i[x.team.id]??x.team.name.slice(0,3),C=b?S:x.team.name,w=new Date(_.gameDate),T=w.toLocaleDateString(`en-US`,{weekday:`short`,month:`short`,day:`numeric`}),O=D(_),k=O.afterGame1?`After game 1`:O.timeTBD?`Time TBD`:w.toLocaleTimeString(`en-US`,{hour:`numeric`,minute:`2-digit`}),A=_.venue?.name??``;await m(_.venue?.id);let j=_.gameDate.startsWith(l),M=_.gameDate.startsWith(n),N=``;if(j||M){await ee([_]);let e=E(_);N=e?`<div class="on-deck-weather" aria-label="${h(e.condition)} ${e.temp} degrees">
            <span class="on-deck-weather-icon">${e.emoji}</span>
            <span class="on-deck-weather-temp">${e.temp}°F</span>
          </div>`:``}let P=`https://www.mlb.com/gameday/${p[v.team.id]??``}-vs-${p[y.team.id]??``}/${_.gameDate.slice(0,10).replace(/-/g,`/`)}/${_.gamePk}/preview`,F=s.filter(g).slice(0,5).map(e=>{let t=e.teams.away,n=e.teams.home,r=n.team.id===a,s=r?t:n,c=i[s.team.id]??s.team.name.slice(0,3),l=new Date(e.gameDate).toLocaleDateString(`en-US`,{weekday:`short`}),u=`https://www.mlb.com/gameday/${p[t.team.id]??``}-vs-${p[n.team.id]??``}/${e.gameDate.slice(0,10).replace(/-/g,`/`)}/${e.gamePk}/preview`;return`<a class="sched-box${e.status?.abstractGameState===`Live`?` sched-box--live`:``}" href="${u}" target="_blank" rel="noopener">
        <span class="sched-box-day">${h(l)}</span>
        <div class="sched-box-logo-wrap">
          <span class="sched-box-at">${r?`vs`:`@`}</span>
          <img class="sched-box-logo" src="${o(s.team.id,22)}" alt="${h(c)}" width="22" height="22">
        </div>
      </a>`}).join(``),I=F?`<div class="sched-row-wrap">${F}</div>`:``,L=u&&u.status?.abstractGameState!==`Final`,R=``;if(L){let e=u.teams.away,t=u.teams.home,n=p[e.team.id]??``,r=p[t.team.id]??``,i=u.gameDate.slice(0,10).replace(/-/g,`/`),a=u.status?.abstractGameState===`Live`?`live`:`preview`,o=`https://www.mlb.com/gameday/${n}-vs-${r}/${i}/${u.gamePk}/${a}`;R=`
      <div class="gameday-media-strip">
        <a class="gameday-media-link" href="${o}" target="_blank" rel="noopener" aria-label="Watch on MLB.com">
          <svg class="gameday-media-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span class="gameday-media-label">Watch</span>
          <span class="gameday-media-network">MLB.tv</span>
        </a>
        <a class="gameday-media-link" href="${o}" target="_blank" rel="noopener" aria-label="Listen on MLB.com">
          <svg class="gameday-media-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          <span class="gameday-media-label">Listen</span>
          <span class="gameday-media-network">MLB Audio</span>
        </a>
      </div>`}t.innerHTML=`
      <div class="on-deck-card-wrap">
        <a class="on-deck-card" href="${P}" target="_blank" rel="noopener">
          ${N}
          <div class="on-deck-matchup">
            <img class="on-deck-logo" src="${o(x.team.id,28)}" alt="" width="28" height="28">
            <span class="on-deck-opp">${h(C)}</span>
          </div>
          <div class="on-deck-details">
            <span class="on-deck-date">${h(T)} · ${h(k)}</span>
            <span class="on-deck-venue">${h(A)}</span>
          </div>
        </a>
        ${R}
      </div>
      ${I}`}catch{t.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function M(e){return`https://baseballsavant.mlb.com/savant-player/${e}`}var N={D10:`10-Day IL`,D15:`15-Day IL`,D60:`60-Day IL`};async function P(){let t=g(`rosterWrap`);if(e())t&&(t.innerHTML=`<div class="sidebar-no-team-msg">Select a team to see their roster.</div>`);else try{let e=c(),n=u[e]??`orioles`,r=S(l,n),i=(await fetch(`https://statsapi.mlb.com/api/v1/teams/${e}/roster?rosterType=40Man&season=${a}`).then(e=>e.json())).roster??[];if(!i.length){t.innerHTML=`<span class="sidebar-msg">Roster unavailable</span>`;return}let o=i.filter(e=>e.status?.code===`A`),s=i.filter(e=>[`D10`,`D15`,`D60`].includes(e.status?.code)),d=i.filter(e=>e.status?.code===`RM`),f={C:0,"1B":1,"2B":2,"3B":3,SS:4,LF:5,CF:5,RF:5,OF:5,DH:6},p=e=>e.slice().sort((e,t)=>{let n=e.position?.abbreviation??``,r=t.position?.abbreviation??``,i=!Object.prototype.hasOwnProperty.call(f,n);return i===!Object.prototype.hasOwnProperty.call(f,r)?(f[n]??9)-(f[r]??9)||e.person.fullName.localeCompare(t.person.fullName):i?1:-1}),m=(e,t={})=>{let r=M(e.person.id),i=e.position?.abbreviation??``,a=t.badge?`<span class="roster-badge roster-badge--${t.badgeType??`il`}">${h(t.badge)}</span>`:``,o=e.person.fullName,s=x(e.person.id,o,n),c=h(o),l;if(s.length>0)l=s.map(e=>`<a class="walkup-song-link" href="${h(e)}" data-song-url="${h(e)}" data-player-name="${c}" target="_blank" rel="noopener" title="Play walk-up song" aria-label="Play walk-up song for ${c}">${T}</a>`).join(``);else{let e=`https://open.spotify.com/search/${encodeURIComponent(o+` walk up song`)}`;l=`<a class="walkup-song-link walkup-song-link--search" href="${h(e)}" data-player-name="${c}" target="_blank" rel="noopener" title="Search walk-up song for ${c}" aria-label="Search walk-up song for ${c}">${T}</a>`}return`<div class="roster-item${t.muted?` roster-item--muted`:``}">
        <span class="roster-num">${h(e.jerseyNumber??``)}</span>
        <a class="roster-name" href="${r}" target="_blank" rel="noopener">${h(o)}</a>${l}
        <span class="roster-pos">${h(i)}</span>
        ${a}
      </div>`},g=p(o.filter(e=>![`SP`,`RP`,`P`].includes(e.position?.abbreviation??``))),_=p(o.filter(e=>[`SP`,`RP`,`P`].includes(e.position?.abbreviation??``))),v=()=>{let e=``;return g.length&&(e+=`<div class="roster-group-label">Position Players</div>`,e+=g.map(e=>m(e)).join(``)),_.length&&(e+=`<div class="roster-group-label">Pitchers</div>`,e+=_.map(e=>m(e)).join(``)),s.length&&(e+=`<div class="roster-group-label">Injured List</div>`,e+=p(s).map(e=>m(e,{badge:N[e.status?.code]??`IL`,badgeType:`il`})).join(``)),d.length&&(e+=`<div class="roster-group-label">Minors</div>`,e+=p(d).map(e=>m(e,{muted:!0})).join(``)),`<div class="roster-list">${e}</div>
        <a class="widget-link" href="https://www.mlb.com/${n}/roster/40-man" target="_blank" rel="noopener">Full 40-man roster ↗</a>`};t.innerHTML=v(),r.then(()=>{t.innerHTML=v()}).catch(()=>{})}catch{t.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}async function F({days:t=14,limit:n=12,badges:r=!1}={}){let i=g(`transactionsWrap`);if(e())i&&(i.innerHTML=`<div class="sidebar-no-team-msg">Select a team to see their transactions.</div>`);else try{let e=d(0),a=new Date;a.setDate(a.getDate()-t);let o=a.toISOString().slice(0,10),s=c(),l=u[s]??`orioles`,f=((await fetch(`https://statsapi.mlb.com/api/v1/transactions?teamId=${s}&startDate=${o}&endDate=${e}`).then(e=>e.json())).transactions??[]).sort((e,t)=>new Date(t.date||t.effectiveDate)-new Date(e.date||e.effectiveDate)).slice(0,n);if(!f.length){i.innerHTML=`<span class="sidebar-msg">No transactions in the last ${t} days</span>`;return}i.innerHTML=`<div class="txn-list">${f.map(e=>{let t=new Date(e.date||e.effectiveDate).toLocaleDateString(`en-US`,{month:`short`,day:`numeric`}),n=e.person?.id,i=n?`https://www.mlb.com/player/${n}`:``,a=e.person?.fullName??`Unknown`,o=e.description||`${a} - ${e.typeDesc??e.typeCode}`,s=i?o.replace(a,`<a class="txn-player" href="${i}" target="_blank" rel="noopener">${h(a)}</a>`):h(o),c=r?y(e):null;return`<div class="txn-item">
        <span class="txn-date">${h(t)}</span>
        ${c?`<span class="fo-tx-type fo-tx-type--${c.cls}">${c.label}</span>`:``}
        <span class="txn-desc">${s}</span>
      </div>`}).join(``)}</div>
      <a class="widget-link" href="https://www.mlb.com/${l}/roster/transactions" target="_blank" rel="noopener">View all transactions ↗</a>`}catch{i.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}async function I(){let t=g(`ilWrap`);if(e())t&&(t.innerHTML=`<div class="sidebar-no-team-msg">Select a team to see their injury report.</div>`);else try{let[e,n]=await Promise.all([fetch(`${r}/teams/${c()}/roster?rosterType=40Man`).then(e=>e.json()),fetch(`${r}/transactions?teamId=${c()}&startDate=${a}-01-01&endDate=${d(0)}`).then(e=>e.json()).catch(()=>({transactions:[]}))]),i=(e.roster??[]).filter(e=>e.status?.description?.toLowerCase().includes(`injured`));if(!i.length){t.innerHTML=`<span class="sidebar-msg">No players on IL</span>`;return}let o=e=>{let t=e.status.description.match(/(\d+)-day/i);return t?parseInt(t[1]):99},s=n.transactions??[],l=e=>{if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t},u=e=>{let t=l(e);return t?t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`}):``},f=e=>{let t=e.person?.id,n=o(e),r=s.filter(e=>e.person?.id===t).filter(e=>/injured list/i.test(e.description||``)||/status change/i.test(e.typeDesc||``)).sort((e,t)=>new Date(e.date)-new Date(t.date)),i=r.filter(e=>/placed .*injured list/i.test(e.description||``)),a=i.length?i[i.length-1]:null,c=i.length?i[0]:null,d=a||c||r[r.length-1]||null;if(!d)return{startedLabel:``,expectedLabel:``,sortTime:2**53-1};let f=(d.description||``).match(/retroactive to ([A-Za-z]+ \d{1,2}, \d{4})/i),p=l(f?.[1]||d.date),m=!!f,h=p?`Started ${u(p)}${m?` (retro)`:``}`:``,g=``,_=2**53-1;if(p&&Number.isFinite(n)&&n<60){let e=new Date(p);e.setDate(e.getDate()+n),g=`Earliest ${u(e)}`,_=e.getTime()}else p&&(_=p.getTime()+n*864e5);return{startedLabel:h,expectedLabel:g,sortTime:_}},p=i.map(e=>({player:e,timeline:f(e)}));p.sort((e,t)=>e.timeline.sortTime-t.timeline.sortTime||o(e.player)-o(t.player)||e.player.person.fullName.localeCompare(t.player.person.fullName));let m={};for(let e of p){let t=o(e.player),n=[10,15,60].includes(t)?`${t}-Day IL`:`IL`;(m[n]??=[]).push(e)}t.innerHTML=`<div class="il-list">${[`10-Day IL`,`15-Day IL`,`60-Day IL`,`IL`].filter(e=>m[e]?.length).map(e=>{let t=m[e].map(({player:e,timeline:t})=>{let n=`https://www.mlb.com/player/${e.person.id}`,r=v(e.note||``),i=e.position?.abbreviation??``,a=t.expectedLabel.replace(`Earliest `,``)||t.startedLabel||``;return`<div class="il-item">
          <div class="il-topline">
            <a class="il-name" href="${n}" target="_blank" rel="noopener">${h(e.person.fullName)}</a>
            ${i?`<span class="il-pos">${h(i)}</span>`:``}
            ${a?`<span class="il-eta">${h(a)}</span>`:``}
          </div>
          ${r?`<div class="il-note">${h(r)}</div>`:``}
        </div>`}).join(``);return`<div class="il-group"><div class="il-group-label">${h(e)}</div>${t}</div>`}).join(``)}</div>`}catch{t.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}var L=[{id:`PLL-lmlkrmJakABrOT6FmV0mU-5oIF8nGu`,label:`MLB Fastcast`},{id:`PLL-lmlkrmJalPg-EgiZ92Eyg9YodLbQsE`,label:`MLB Top Plays`}],R={id:`PLoeYQM_iUEVwNa9HwsFfS0aWvshxoYnhy`,label:`Orioles Moments`,random:!0},te=`PLoeYQM_iUEVyoMu-AIZFXs9ja6GMzF1Ce`;async function z(e){let t=`${l}?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?playlist_id=${e.id}`)}`,n=(await fetch(t).then(e=>e.json())).items??[];if(!n.length)return null;let r=e.random?n[Math.floor(Math.random()*n.length)]:n[0];if(!r)return null;let i=r.link||``,a=w(i);return{title:f(r.title),label:e.label,thumb:r.thumbnail||(a?`https://i.ytimg.com/vi/${a}/mqdefault.jpg`:``),url:i,videoId:a}}function ne(e){let t=new Date(`${e}T12:00:00`);if(isNaN(t))return``;let n=String(t.getFullYear()).slice(-2);return`${t.getMonth()+1}/${t.getDate()}/${n}`}function re(e){let t=(e?.content?.media?.epgAlternate??[]).flatMap(e=>e.items??[]);return t.find(e=>e.keywordsAll?.some(e=>e.value===`mlb_recap`||e.value===`game-recap`))||t.find(e=>e.keywordsAll?.some(e=>e.value===`condensed_game`||e.value===`condensed-game`))||null}function ie(e){let t=e?.image?.cuts??[];return t.find(e=>e.width===640)?.src||t.find(e=>e.aspectRatio===`16:9`)?.src||``}async function ae(){let e=c(),t=d(0),n=d(-4),[a,o]=await Promise.all([e===110?fetch(`${l}?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?playlist_id=${te}`)}`).then(e=>e.json()):Promise.resolve({items:[]}),fetch(`${r}/schedule?sportId=1&teamId=${e}&startDate=${n}&endDate=${t}&hydrate=game(content(media(epg)))`).then(e=>e.json())]),s=a.items??[],u=(o.dates??[]).flatMap(e=>e.games??[]).filter(e=>e.status?.abstractGameState===`Final`).sort((e,t)=>new Date(t.gameDate)-new Date(e.gameDate))[0]??null,p=u?.officialDate?ne(u.officialDate):``,m=p?s.find(e=>(e.title||``).includes(`(${p})`)):s[0];if(m){let e=m.link||``,t=w(e);return{title:f(m.title),label:`${i[c()]??`Orioles`} Game Recaps`,thumb:m.thumbnail||(t?`https://i.ytimg.com/vi/${t}/mqdefault.jpg`:``),url:e,videoId:t}}let h=u?re(u):null;return h?{title:f(h.headline||h.title||h.blurb||`${i[c()]??`Game`} Recap`),label:`${i[c()]??`Orioles`} Recap`,thumb:ie(h),url:`https://www.mlb.com/video/${h.slug||h.id}`,videoId:``}:null}async function oe(){let e=g(`videoWrap`);try{let t=(await Promise.allSettled([ae(),...[...L,...c()===110?[R]:[]].map(z)])).filter(e=>e.status===`fulfilled`&&e.value).map(e=>e.value);if(!t.length){e.innerHTML=`<span class="sidebar-msg">No videos available</span>`;return}e.innerHTML=`<div class="video-list">${t.map(e=>`<div class="video-item" data-video-id="${h(e.videoId)}" data-video-url="${h(e.url)}">
        <div class="video-thumb-wrap">
          <img class="video-thumb" src="${h(e.thumb)}" alt="" loading="lazy">
          <svg class="video-play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="video-info">
          <span class="video-channel">${h(e.label)}</span>
          <span class="video-title">${h(e.title)}</span>
        </div>
      </div>`).join(``)}</div>`,C(e,`.video-item`)}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}var se=`https://feeds.megaphone.fm/ESP1723897648`,B=`https://www.espn.com/espnradio/podcast/archive?id=2386164`;function ce(e){if(!e)return;let t=e.querySelector(`.podcast-hover-panel`);if(!t)return;document.querySelectorAll(`.podcast-hover-panel--floating`).forEach(e=>e.remove()),t.classList.add(`podcast-hover-panel--floating`),document.body.appendChild(t);let n=!1,r=()=>{let n=e.getBoundingClientRect();t.style.left=`${Math.min(n.right+12,window.innerWidth-t.offsetWidth-12)}px`,t.style.top=`${Math.max(12,n.top)}px`},i=()=>{n=!0,r(),t.classList.add(`is-visible`)},a=()=>{n=!1,t.classList.remove(`is-visible`)},o=()=>{n&&r()};e.addEventListener(`mouseenter`,i),e.addEventListener(`mouseleave`,a),e.addEventListener(`focusin`,i),e.addEventListener(`focusout`,a),window.addEventListener(`scroll`,o,{passive:!0}),window.addEventListener(`resize`,o)}async function V(){let e=g(`podcastWrap`);try{let r=await fetch(se).then(e=>e.text()),i=new DOMParser().parseFromString(r,`application/xml`),a=Array.from(i.querySelectorAll(`channel > item`)),o=a.findIndex(e=>{let t=e.querySelector(`enclosure`);return t&&t.getAttribute(`type`)?.startsWith(`audio/`)}),s=o>=0?a[o]:null;if(!s){e.innerHTML=`<div class="podcast-card">
        <span class="podcast-kicker">Baseball Tonight</span>
        <div class="podcast-title">Podcast feed is temporarily unavailable.</div>
        <div class="podcast-links">
          <a class="podcast-link" href="${B}" target="_blank" rel="noopener">Open show page ↗</a>
        </div>
      </div>`;return}let c=s.querySelector(`enclosure`),l=c?.getAttribute(`url`)||``,u=c?.getAttribute(`type`)||`audio/mpeg`,d=s.querySelector(`title`)?.textContent||`Latest episode`,p=s.querySelector(`description`)?.textContent||``,m=s.querySelector(`pubDate`)?.textContent||``,g=s.querySelector(`link`)?.textContent||B,_=f(d),v=f(p),y=t(m),b=o>0?`<span class="podcast-fallback-note">Showing a recent playable episode</span>`:``,x=_.length>62?`podcast-title podcast-title--scroll`:`podcast-title`,S=v?`<div class="podcast-hover-panel" aria-hidden="true">
          <div class="podcast-hover-title">${h(_)}</div>
          <div class="podcast-hover-desc">${h(v)}</div>
        </div>`:``;e.innerHTML=`<div class="podcast-card podcast-card--hoverable">
      <span class="podcast-kicker">Baseball Tonight</span>
      ${b}
      <div class="${x}"><span class="podcast-title-track">${h(_)}</span></div>
      <div class="podcast-meta">
        <span>${h(y||`Latest episode`)}</span>
        <span>Buster Olney</span>
      </div>
      <audio class="podcast-player" controls preload="metadata">
        <source src="${h(n(l))}" type="${h(u)}">
        Your browser does not support the audio element.
      </audio>
      <div class="podcast-links">
        <a class="podcast-link" href="${h(n(g)||B)}" target="_blank" rel="noopener">Episode details ↗</a>
        <a class="podcast-link" href="${B}" target="_blank" rel="noopener">Show archive ↗</a>
      </div>
      ${S}
    </div>`,ce(e.querySelector(`.podcast-card--hoverable`))}catch{e.innerHTML=`<div class="podcast-card">
      <span class="podcast-kicker">Baseball Tonight</span>
      <div class="podcast-title">Podcast feed is temporarily unavailable.</div>
      <div class="podcast-links">
        <a class="podcast-link" href="${B}" target="_blank" rel="noopener">Open show page ↗</a>
      </div>
    </div>`}}var H={},U=`orioles`,W=[`onBasePlusSlugging`,`sluggingPercentage`,`onBasePercentage`,`battingAverage`,`homeRuns`,`runsBattedIn`,`hits`,`baseOnBalls`,`walks`],le=[`earnedRunAverage`,`walksAndHitsPerInningPitched`,`strikeoutsPer9Inn`,`strikeouts`,`walksPer9Inn`,`qualityStarts`,`wins`],ue=`onBasePlusSlugging,sluggingPercentage,onBasePercentage,battingAverage,homeRuns,runsBattedIn,hits,baseOnBalls,earnedRunAverage,walksAndHitsPerInningPitched,strikeoutsPer9Inn,strikeouts,walksPer9Inn,qualityStarts,wins`,de=`onBasePlusSlugging,sluggingPercentage,onBasePercentage,battingAverage,homeRuns,runsBattedIn,hits,walks,earnedRunAverage,walksAndHitsPerInningPitched,strikeoutsPer9Inn,strikeouts,walksPer9Inn,wins`,G={battingAverage:`AVG`,onBasePercentage:`OBP`,onBasePlusSlugging:`OPS`,homeRuns:`HR`,hits:`H`,baseOnBalls:`BB`,walks:`BB`,sluggingPercentage:`SLG`,runsBattedIn:`RBI`},K={earnedRunAverage:`ERA`,strikeouts:`SO`,qualityStarts:`QS`,walksAndHitsPerInningPitched:`WHIP`,wins:`W`,strikeoutsPer9Inn:`K/9`,walksPer9Inn:`BB/9`},fe={onBasePlusSlugging:{stat:`on_base_plus_slg`,type:`batter`,sortDir:`desc`},sluggingPercentage:{stat:`slg_percent`,type:`batter`,sortDir:`desc`},onBasePercentage:{stat:`on_base_percent`,type:`batter`,sortDir:`desc`},battingAverage:{stat:`batting_avg`,type:`batter`,sortDir:`desc`},homeRuns:{stat:`home_run`,type:`batter`,sortDir:`desc`},runsBattedIn:{stat:`rbi`,type:`batter`,sortDir:`desc`},hits:{stat:`h`,type:`batter`,sortDir:`desc`},baseOnBalls:{stat:`bb`,type:`batter`,sortDir:`desc`},walks:{stat:`bb`,type:`batter`,sortDir:`desc`},earnedRunAverage:{stat:`p_era`,type:`pitcher`,sortDir:`asc`},walksAndHitsPerInningPitched:{type:`pitcher`,sort:`p_walk`,sortDir:`asc`,selections:[`p_walk`,`p_total_hits`,`p_formatted_ip`],x:`p_walk`,y:`p_walk`},strikeoutsPer9Inn:{type:`pitcher`,sort:`p_strikeout`,sortDir:`desc`,selections:[`p_strikeout`,`p_formatted_ip`],x:`p_strikeout`,y:`p_strikeout`},strikeouts:{stat:`p_strikeout`,type:`pitcher`,sortDir:`desc`},walksPer9Inn:{type:`pitcher`,sort:`p_walk`,sortDir:`asc`,selections:[`p_walk`,`p_formatted_ip`],x:`p_walk`,y:`p_walk`},qualityStarts:{stat:`p_quality_start`,type:`pitcher`,sortDir:`desc`},wins:{stat:`p_win`,type:`pitcher`,sortDir:`desc`}};function pe(e){let t=fe[e];if(!t)return`#`;let n=t.selections??[t.stat],r=t.sort??t.stat,i=t.x??r,o=t.y??r,s=new URL(`https://baseballsavant.mlb.com/leaderboard/custom`);return s.searchParams.set(`year`,String(a)),s.searchParams.set(`type`,t.type),s.searchParams.set(`min`,`q`),s.searchParams.set(`selections`,n.join(`,`)),s.searchParams.set(`sort`,r),s.searchParams.set(`sortDir`,t.sortDir),s.searchParams.set(`chart`,`false`),s.searchParams.set(`chartType`,`beeswarm`),s.searchParams.set(`filter`,``),s.searchParams.set(`r`,`no`),s.searchParams.set(`x`,i),s.searchParams.set(`y`,o),s.toString()}var q=`onBasePlusSlugging,homeRuns,battingAverage,earnedRunAverage,strikeouts,walksAndHitsPerInningPitched`,J=[`onBasePlusSlugging`,`homeRuns`,`battingAverage`],Y=[`earnedRunAverage`,`strikeouts`,`walksAndHitsPerInningPitched`];function me(e){return e===`orioles`?`${r}/teams/${c()}/leaders?leaderCategories=${ue}&season=${a}&leaderGameTypes=R&playerPool=Qualified`:`${r}/stats/leaders?leaderCategories=${de}&season=${a}&leaderGameTypes=R${e===`al`?`&leagueId=103`:e===`nl`?`&leagueId=104`:``}&playerPool=Qualified&limit=1`}function X(e,t=W,n=le){let r=(e,t)=>e.sort((e,n)=>(t.indexOf(e.key)===-1?99:t.indexOf(e.key))-(t.indexOf(n.key)===-1?99:t.indexOf(n.key)));return{batting:r(e.filter(e=>G[e.leaderCategory]&&e.statGroup===`hitting`&&t.includes(e.leaderCategory)).map(e=>({key:e.leaderCategory,label:G[e.leaderCategory],leaders:e.leaders})),t),pitching:r(e.filter(e=>K[e.leaderCategory]&&e.statGroup===`pitching`&&n.includes(e.leaderCategory)).map(e=>({key:e.leaderCategory,label:K[e.leaderCategory],leaders:e.leaders})),n)}}async function Z(){let e=g(`leadersWrap`);try{if(U===`roy`){if(!H.roy){let[e,t]=await Promise.all([fetch(`${r}/stats/leaders?leaderCategories=${q}&season=${a}&leaderGameTypes=R&leagueId=103&playerPool=Rookies&limit=1`).then(e=>e.json()),fetch(`${r}/stats/leaders?leaderCategories=${q}&season=${a}&leaderGameTypes=R&leagueId=104&playerPool=Rookies&limit=1`).then(e=>e.json())]);H.roy={al:X(e.leagueLeaders??[],J,Y),nl:X(t.leagueLeaders??[],J,Y)}}$();return}let e=me(U);if(!H[U]){let t=await fetch(e).then(e=>e.json()),n=U===`orioles`?t.teamLeaders??[]:t.leagueLeaders??[];H[U]=X(n)}$()}catch{e.innerHTML=`<span class="sidebar-msg">Unavailable</span>`}}function Q(e){let t=e.leaders?.[0];if(!t)return``;let n=(t.person?.fullName??``).split(` `).pop()??``,r=t.person?.id;return`<div class="leader-item">
    <a class="leader-cat" href="${pe(e.key)}" target="_blank" rel="noopener">${h(e.label)}</a>
    <a class="leader-name" href="${r?M(r):`#`}" target="_blank" rel="noopener">${h(n)}</a>
    <span class="leader-val">${h(t.value)}</span>
  </div>`}function $(){let e=g(`leadersWrap`),t=H[U];if(!t){e.innerHTML=`<span class="sidebar-msg">Loading…</span>`;return}let n=`<div class="leaders-scope">
    <button class="leaders-scope-btn${U===`orioles`?` active`:``}" data-scope="orioles"><img class="leaders-scope-logo" src="${o(c(),12)}" alt="" width="12" height="12" loading="eager" decoding="async">${i[c()]??`O's`}</button>
    <button class="leaders-scope-btn${U===`al`?` active`:``}" data-scope="al"><img class="leaders-scope-logo leaders-scope-logo--league" src="https://midfield.mlbstatic.com/v1/team/american-league/logo" alt="" width="12" height="12" loading="eager" decoding="async">AL</button>
    <button class="leaders-scope-btn${U===`nl`?` active`:``}" data-scope="nl"><img class="leaders-scope-logo leaders-scope-logo--league" src="https://midfield.mlbstatic.com/v1/team/national-league/logo" alt="" width="12" height="12" loading="eager" decoding="async">NL</button>
    <button class="leaders-scope-btn${U===`mlb`?` active`:``}" data-scope="mlb"><img class="leaders-scope-logo leaders-scope-logo--league" src="https://www.mlbstatic.com/team-logos/apple-touch-icons-180x180/mlb.png" alt="" width="12" height="12" loading="eager" decoding="async">MLB</button>
    <button class="leaders-scope-btn${U===`roy`?` active`:``}" data-scope="roy">ROY</button>
  </div>`,r;if(U===`roy`){let e=(e,t)=>`
      <div class="leaders-roy-league">${h(e)} ROY Watch</div>
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
    <div class="leaders-stack">${r}</div>`,e.querySelectorAll(`.leaders-scope-btn`).forEach(e=>{e.addEventListener(`click`,()=>{U=e.dataset.scope,Z()})})}var he={109:`diamondbacks`};function ge(){let e=g(`contractsWrap`);if(!e)return;let t=c(),n=_[t]??_[110],r=he[n.id]??p[n.id],i=n.fullName.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``);e.innerHTML=`
    <p class="contracts-blurb">Salaries, contracts and luxury-tax payroll for the ${new Date().getFullYear()} ${h(n.name)}.</p>
    <a class="widget-link-card" href="https://www.fangraphs.com/roster-resource/payroll/${encodeURIComponent(r)}" target="_blank" rel="noopener">
      <span class="widget-link-card-label">Contracts &amp; Payroll</span>
      <span class="widget-link-card-sub">FanGraphs RosterResource ↗</span>
    </a>
    <a class="widget-link-card" href="https://www.spotrac.com/mlb/${i}/payroll/" target="_blank" rel="noopener">
      <span class="widget-link-card-label">Payroll</span>
      <span class="widget-link-card-sub">Spotrac: salaries, options &amp; totals ↗</span>
    </a>
    <a class="widget-link-card" href="https://www.spotrac.com/mlb/${i}/tax/" target="_blank" rel="noopener">
      <span class="widget-link-card-label">Luxury Tax</span>
      <span class="widget-link-card-sub">Spotrac: competitive balance tax payroll ↗</span>
    </a>
    <a class="widget-link-card" href="https://www.baseballprospectus.com/compensation/cots/" target="_blank" rel="noopener">
      <span class="widget-link-card-label">Contract Details</span>
      <span class="widget-link-card-sub">Cot's Baseball Contracts ↗</span>
    </a>`}export{V as a,F as c,j as i,oe as l,I as n,P as o,Z as r,O as s,ge as t};