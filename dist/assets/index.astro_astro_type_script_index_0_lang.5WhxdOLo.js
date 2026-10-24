import{S as e,T as t,l as n,s as r}from"./utils.DnOkClm6.js";import{t as i}from"./teamPicker.DkDTilHf.js";var a=document.getElementById(`athStoryGrid`),o=document.getElementById(`athPageTitle`),s=document.getElementById(`athPageSubtitle`),c=`fb_ath_bundles`,l=new URLSearchParams(window.location.search).get(`topic`)||``;function u(i){let a=n(i.link),o=(i.description||``).slice(0,180);return`<article class="ath-story-card">
        <div class="ath-story-meta">
          ${a?`<img class="source-ico" src="${r(a)}" alt="" onerror="this.style.display='none'">`:``}
          <span class="source-name">${r(i.source?.name||`Source`)}</span>
          <span class="article-date">${r(e(i.pubDate))}</span>
        </div>
        <h2 class="ath-story-title"><a href="${r(t(i.link)||`#`)}" target="_blank" rel="noopener noreferrer">${r(i.title||`Untitled`)}</a></h2>
        ${o?`<p class="ath-story-desc">${r(o)}</p>`:``}
      </article>`}var d={};try{d=JSON.parse(sessionStorage.getItem(c)||`{}`)}catch{d={}}var f=d[l];i()&&(f?(o.textContent=f.label||`Around the Horn`,s.textContent=`${f.sourceCount||0} sources • ${(f.articles||[]).length} related articles`,a.innerHTML=(f.articles||[]).map(u).join(``)||`<div class="feed-msg">No related articles found.</div>`):(o.textContent=`Story bundle unavailable`,s.textContent=`Open an Around the Horn card from the homepage first so this page can load the saved related-coverage bundle.`,a.innerHTML=`<div class="feed-msg">No saved Around the Horn bundle was found for this story yet.</div>`));