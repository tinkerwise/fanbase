import{g as h}from"./teamConfig.ClYXjOh9.js";const w="https://statsapi.mlb.com/api/v1",I=new Date().getFullYear();function g(){return h().id}async function S(){const e=document.getElementById("feeds-panel");if(e)try{const t=await fetch("/feeds.json");if(!t.ok)throw new Error("Failed to load feeds");const r=await t.json(),d=g(),c=r.filter(a=>a.teamId===d||a.teamId===0);if(e.innerHTML="",c.length===0){e.innerHTML='<p class="loading">No feeds available for this team.</p>';return}const o=document.createElement("ul");o.className="feed-list",c.forEach(a=>{const l=document.createElement("li");l.className="feed-item",l.innerHTML=`
        <a href="${a.url}" target="_blank" rel="noopener noreferrer" class="feed-link">
          <span class="feed-label">${a.label}</span>
          <span class="feed-type">${a.type||"rss"}</span>
        </a>`,o.appendChild(l)}),e.appendChild(o)}catch(t){e.innerHTML=`<p class="error">Could not load feeds: ${t.message}</p>`}}S();async function T(){const e=document.getElementById("scores-list");if(!e)return;const t=g();try{const r=new Date,d=r.toISOString().split("T")[0],c=new Date(r-10080*60*1e3).toISOString().split("T")[0],o=`${w}/schedule?teamId=${t}&sportId=1&startDate=${c}&endDate=${d}&hydrate=linescore,decisions`,a=await fetch(o);if(!a.ok)throw new Error("API error");const s=((await a.json()).dates||[]).flatMap(n=>n.games||[]).reverse().filter(n=>{const i=n.status?.detailedState||"";return i==="Final"||i==="Game Over"});if(s.length===0){e.innerHTML='<p class="loading">No recent completed games.</p>';return}e.innerHTML=s.slice(0,6).map(n=>{const i=n.teams?.home,p=n.teams?.away,v=i?.score??"–",$=p?.score??"–",b=i?.team?.abbreviation||"?",y=p?.team?.abbreviation||"?",u=i?.isWinner?" winner":"",f=p?.isWinner?" winner":"";return`
        <div class="score-row">
          <span class="team-abbrev${f}">${y}</span>
          <span class="score${f}">${$}</span>
          <span class="vs">@</span>
          <span class="team-abbrev${u}">${b}</span>
          <span class="score${u}">${v}</span>
        </div>`}).join("")}catch{e.innerHTML='<p class="error">Could not load scores.</p>'}}T();async function M(){const e=document.getElementById("standings-list"),t=document.querySelector("#standings-widget h3");if(!e)return;const r=g(),d=h();try{const c=`${w}/standings?leagueId=103,104&season=${I}&standingsTypes=regularSeason&hydrate=team`,o=await fetch(c);if(!o.ok)throw new Error("API error");const m=((await o.json()).records||[]).find(s=>s.teamRecords?.some(n=>n.team?.id===r));if(!m){e.innerHTML='<p class="loading">Standings unavailable.</p>';return}t&&(t.textContent=`${d.division} Standings`),e.innerHTML=m.teamRecords.slice().sort((s,n)=>Number(s.divisionRank)-Number(n.divisionRank)).map(s=>`
          <div class="standing-row${s.team?.id===r?" highlight":""}">
            <span class="standing-rank">${s.divisionRank}</span>
            <span class="standing-team">${s.team?.abbreviation||"?"}</span>
            <span class="standing-record">${s.wins}-${s.losses}</span>
            <span class="standing-pct">${s.winningPercentage||".000"}</span>
          </div>`).join("")}catch{e.innerHTML='<p class="error">Could not load standings.</p>'}}M();
