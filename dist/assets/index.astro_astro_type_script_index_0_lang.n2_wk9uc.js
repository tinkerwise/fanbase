import{N as e,U as t,s as n,t as r}from"./utils.DaJInyY3.js";import"./theme.CU5GnKc5.js";import{t as i}from"./teamPicker.DtDYhMcX.js";import{a,i as o,t as s}from"./frontOfficeData.B_REK8Zk.js";import{c,n as l,o as u,t as d}from"./sidebars.BTuMR8VY.js";function f(t,i){let a=r(`foLogo`);a&&(a.src=e(t.id,56),a.alt=`${t.name} logo`);let o=[t.div,i?.ballpark,i?.owner&&`Owner: ${i.owner}${i.ownerSince?` (since ${i.ownerSince})`:``}`].filter(Boolean).map(n).join(` · `);o&&(r(`foMeta`).innerHTML=o+(i?.ownerNote?`<br>${n(i.ownerNote)}`:``))}function p(e,t){let i=r(`foBrass`),a=t?.brass??[];if(!a.length){i.innerHTML=`<span class="sidebar-msg">The ${n(e.fullName)} front office hasn't been filled in yet.</span>`;return}let o=s(t.asOf);o&&(r(`foAsOf`).textContent=`as of ${o}`),i.innerHTML=`<div class="fo-brass">${a.map(e=>`
    <div class="fo-brass-card${e.vacant?` fo-brass-card--vacant`:``}">
      <span class="fo-brass-title">${n(e.title)}</span>
      <span class="fo-brass-name">${n(e.name)}</span>
      ${e.since?`<span class="fo-brass-since">Since ${n(e.since)}</span>`:``}
      ${e.note?`<span class="fo-brass-note">${n(e.note)}</span>`:``}
    </div>`).join(``)}</div>`}function m(e){let t=r(`foRecord`),i=e?.eraRecord??[];i.length?(r(`foRecordNote`).textContent=`last ${i.length} seasons`,t.innerHTML=`<div class="fo-table-wrap"><table class="fo-record">
    <thead><tr><th scope="col">Year</th><th scope="col" class="fo-num">W</th><th scope="col" class="fo-num">L</th><th scope="col" class="fo-num">Pct</th><th scope="col">Finish</th><th scope="col">Postseason</th></tr></thead>
    <tbody>${[...i].reverse().map(e=>{let t=e.w>e.l;return`<tr>
      <th scope="row">${n(e.year)}</th>
      <td class="fo-num${t?` fo-win`:``}">${n(e.w)}</td>
      <td class="fo-num">${n(e.l)}</td>
      <td class="fo-num">${n(e.pct)}</td>
      <td>${n(e.finish)}</td>
      <td class="fo-record-note">${n(e.note)}</td>
    </tr>`}).join(``)}</tbody>
  </table></div>`):t.innerHTML=`<span class="sidebar-msg">Season records aren't available yet.</span>`}function h(e){let t=r(`foDrafts`),i=(e?.recentDraftClasses??[]).filter(e=>e.picks?.length);t.innerHTML=i.length?`<div class="fo-drafts">${[...i].reverse().map(e=>`
    <div class="fo-draft-class">
      <span class="fo-draft-year">${n(e.year)}</span>
      ${e.picks.map(e=>`<div class="fo-draft-pick">
        <span class="fo-draft-slot">Rd ${n(e.round)} · #${n(e.overall)}</span>
        <span class="fo-draft-name">${n(e.name)} <span class="fo-draft-pos">${n(e.pos)}</span></span>
        <span class="fo-draft-status">${n(e.status)}</span>
      </div>`).join(``)}
    </div>`).join(``)}</div>`:`<span class="sidebar-msg">Draft history isn't available yet.</span>`}async function g(){let e=await a(t.id);f(t,e),p(t,e),m(e),h(e)}i()&&Promise.allSettled([g(),l(),c({days:60,limit:20,badges:!0}),d(),u(),o(r(`foNews`),`"${t.fullName}" general manager OR "front office" OR "baseball operations"`)]).then(()=>{location.hash.startsWith(`#fo-`)&&document.querySelector(location.hash)?.scrollIntoView({behavior:`instant`})});