import{N as e,U as t,s as n,t as r}from"./utils.DaJInyY3.js";import"./theme.CU5GnKc5.js";import{t as i}from"./teamPicker.DtDYhMcX.js";import{a,n as o,o as s,t as c}from"./frontOfficeData.CgpcHL8q.js";import{c as l,n as u,o as d,t as f}from"./sidebars.C-gJTG5d.js";function p(t,n){let i=r(`foLogo`);i&&(i.src=e(t.id,56),i.alt=`${t.name} logo`);let a=[t.div,n?.ballpark].filter(Boolean).join(` · `);a&&(r(`foMeta`).textContent=a)}var m={owner:{label:`Ownership`,does:`Owns the club. Sets the budget, signs off on the biggest contracts and hires the top baseball executive.`,learn:`fo-learn-money`},president:{label:`Head of Baseball Operations`,does:`Runs the whole baseball side. Sets the long-term plan, makes the final call on major trades and signings, and hires the GM and manager.`,learn:`fo-learn-president`},combined:{label:`President & General Manager`,does:`Holds both jobs: sets the long-term plan and also builds the roster day to day, working the phones on trades and contracts.`,learn:`fo-learn-president`},gm:{label:`General Manager`,does:`Builds the roster day to day: works the phones on trades, negotiates contracts and pulls together scouting, analytics and player development.`,learn:`fo-learn-gm`},topGm:{label:`General Manager`,does:`The top baseball executive here, reporting straight to ownership. Sets the plan and builds the roster: trades, contracts, scouting, analytics and player development.`,learn:`fo-learn-gm`},manager:{label:`Manager`,does:`Runs the team on the field: lineups, pitching changes and the clubhouse, with a staff of coaches. Works from the front office's plans and data.`,learn:`fo-learn-manager`}};function h(e){return`<div class="fo-brass-card${e.vacant?` fo-brass-card--vacant`:``}">
      <span class="fo-brass-title">${n(e.title)}</span>
      <span class="fo-brass-name">${n(e.name)}</span>
      ${e.since?`<span class="fo-brass-since">Since ${n(e.since)}</span>`:``}
      ${e.note?`<span class="fo-brass-note">${n(e.note)}</span>`:``}
    </div>`}function g(e,t,r){let i=m[e];return`<li class="fo-rung${r?` fo-rung--gap`:``}">
    <div class="fo-rung-role">
      <span class="fo-rung-label">${n(i.label)}</span>
      <p class="fo-rung-does">${n(i.does)}</p>
      <a class="fo-rung-learn" href="#${i.learn}">How this job works ↓</a>
    </div>
    <div class="fo-rung-people">${t?h(t):`<p class="fo-rung-gap">${n(r)}</p>`}</div>
  </li>`}function _(e,t){let i=r(`foBrass`),a=o(t);if(!a.owner&&!a.president&&!a.gm&&!a.manager){i.innerHTML=`<span class="sidebar-msg">The ${n(e.fullName)} front office hasn't been filled in yet.</span>`;return}let s=c(t.asOf);s&&(r(`foAsOf`).textContent=`as of ${s}`);let l=[];a.owner&&l.push(g(`owner`,a.owner)),a.combined?l.push(g(`combined`,a.president)):(a.president?l.push(g(`president`,a.president)):a.gm&&l.push(g(`president`,null,`No separate head of baseball operations. The GM answers straight to ownership.`)),a.gm?l.push(g(a.president?`gm`:`topGm`,a.gm)):a.president&&l.push(g(`gm`,null,`No general manager listed. The ${a.president.title.toLowerCase()} and staff cover the job.`))),a.manager&&l.push(g(`manager`,a.manager));let u=new Set([a.president,a.gm,a.manager]),d=(t?.brass??[]).filter(e=>!u.has(e));i.innerHTML=`<ol class="fo-chain">${l.join(``)}</ol>`+(d.length?`<div class="fo-brass fo-brass--others">${d.map(h).join(``)}</div>`:``);let f={owner:a.owner?.name,president:a.president&&!a.president.vacant?a.president.name:null,gm:a.gm&&!a.gm.vacant?a.gm.name:null,manager:a.manager&&!a.manager.vacant?a.manager.name:null};document.querySelectorAll(`[data-fo-person]`).forEach(t=>{let n=f[t.dataset.foPerson];t.hidden=!n,n&&(t.textContent=`For the ${e.name}: ${n}.`)})}function v(e){let t=r(`foRecord`),i=e?.eraRecord??[];i.length?(r(`foRecordNote`).textContent=`last ${i.length} seasons`,t.innerHTML=`<div class="fo-table-wrap"><table class="fo-record">
    <thead><tr><th scope="col">Year</th><th scope="col" class="fo-num">W</th><th scope="col" class="fo-num">L</th><th scope="col" class="fo-num">Pct</th><th scope="col">Finish</th><th scope="col">Postseason</th></tr></thead>
    <tbody>${[...i].reverse().map(e=>{let t=e.w>e.l;return`<tr>
      <th scope="row">${n(e.year)}</th>
      <td class="fo-num${t?` fo-win`:``}">${n(e.w)}</td>
      <td class="fo-num">${n(e.l)}</td>
      <td class="fo-num">${n(e.pct)}</td>
      <td>${n(e.finish)}</td>
      <td class="fo-record-note">${n(e.note)}</td>
    </tr>`}).join(``)}</tbody>
  </table></div>`):t.innerHTML=`<span class="sidebar-msg">Season records aren't available yet.</span>`}function y(e){let t=r(`foDrafts`),i=(e?.recentDraftClasses??[]).filter(e=>e.picks?.length);t.innerHTML=i.length?`<div class="fo-drafts">${[...i].reverse().map(e=>`
    <div class="fo-draft-class">
      <span class="fo-draft-year">${n(e.year)}</span>
      ${e.picks.map(e=>`<div class="fo-draft-pick">
        <span class="fo-draft-slot">Rd ${n(e.round)} · #${n(e.overall)}</span>
        <span class="fo-draft-name">${n(e.name)} <span class="fo-draft-pos">${n(e.pos)}</span></span>
        <span class="fo-draft-status">${n(e.status)}</span>
      </div>`).join(``)}
    </div>`).join(``)}</div>`:`<span class="sidebar-msg">Draft history isn't available yet.</span>`}async function b(){let e=await s(t.id);p(t,e),_(t,e),v(e),y(e)}i()&&Promise.allSettled([b(),u(),l({days:60,limit:20,badges:!0}),f(),d(),a(r(`foNews`),`"${t.fullName}" general manager OR "front office" OR "baseball operations"`)]).then(()=>{location.hash.startsWith(`#fo-`)&&document.querySelector(location.hash)?.scrollIntoView({behavior:`instant`})});