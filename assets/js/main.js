/* 183333.com — Residency Day Lab | site script (no dependencies) */
(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  /* ---------- Private inbox routing (address is never written in the page) ---------- */
  var _k=[106, 104, 100, 41, 107, 110, 102, 106, 96, 71, 54, 102, 116, 108, 117, 104, 112, 101, 98, 112];
  function inbox(){return String.fromCharCode.apply(null,_k.map(function(c){return c^7})).split('').reverse().join('')}
  var ENDPOINT=function(){return 'https://formsubmit.co/ajax/'+inbox()};
  $$('[data-mail]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      var s=a.getAttribute('data-mail')||'Inquiry from 183333.com';
      window.location.href='mailto:'+inbox()+'?subject='+encodeURIComponent(s);
    });
  });

  /* ---------- Theme ---------- */
  var root=document.documentElement,saved=store('r183-theme');
  if(saved)root.setAttribute('data-theme',saved);
  var tbtn=$('#themeBtn');
  if(tbtn)tbtn.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',cur);store('r183-theme',cur);
  });

  /* ---------- Nav ---------- */
  var file=(location.pathname.split('/').pop()||'index.html');
  var inGuides=/\/guides\//.test(location.pathname);
  $$('#menu a').forEach(function(a){
    var h=(a.getAttribute('href')||'').split('/').pop();
    if((h===file&&!inGuides)||(inGuides&&/guides\/index\.html$|^index\.html$/.test(a.getAttribute('href'))&&/guides/.test(a.getAttribute('href')))){a.classList.add('active');a.setAttribute('aria-current','page')}
  });
  var bg=$('#burger'),menu=$('#menu');
  if(bg&&menu)bg.addEventListener('click',function(){var o=menu.classList.toggle('open');bg.setAttribute('aria-expanded',o)});

  /* ---------- Reveal ---------- */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.1});
    $$('.reveal').forEach(function(el){io.observe(el)});
  }else $$('.reveal').forEach(function(el){el.classList.add('in')});

  /* ---------- Cookie notice ---------- */
  var ck=$('#cookie');
  if(ck&&!store('r183-cookie'))ck.classList.add('show');
  $$('[data-cookie]').forEach(function(b){b.addEventListener('click',function(){store('r183-cookie',b.getAttribute('data-cookie'));ck.classList.remove('show')})});
  $$('.year').forEach(function(el){el.textContent=new Date().getFullYear()});

  /* ---------- Date helpers (UTC day numbers) ---------- */
  function dn(s){if(!s)return NaN;var p=s.split('-');return Date.UTC(+p[0],+p[1]-1,+p[2])/864e5}
  function ds(n){return new Date(n*864e5).toISOString().slice(0,10)}
  function todayDN(){var d=new Date();return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5}
  function nice(n){return new Date(n*864e5).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'})}
  var DATA=window.R183||{countries:[],visas:[],schengen:[]};
  var SCH={};DATA.schengen.forEach(function(c){SCH[c.toLowerCase()]=1});
  function rule(c){c=(c||'').toLowerCase();for(var i=0;i<DATA.countries.length;i++)if(DATA.countries[i].c.toLowerCase()===c)return DATA.countries[i];return null}

  /* ---------- Hero: day-of-year ring ---------- */
  var ring=$('#ringFg');
  if(ring){
    var C=2*Math.PI*88;ring.setAttribute('stroke-dasharray',C);
    var t=new Date(),y=t.getFullYear(),doy=Math.floor((Date.UTC(y,t.getMonth(),t.getDate())-Date.UTC(y,0,1))/864e5)+1;
    var d183=new Date(Date.UTC(y,0,183));
    function paint(n,label){
      var pct=Math.min(1,n/183);ring.setAttribute('stroke-dashoffset',C*(1-pct));
      ring.setAttribute('stroke',n>=183?'var(--red)':n>=150?'var(--amber)':'var(--teal)');
      $('#ringNum').textContent=n;$('#ringLbl').textContent=label;
    }
    paint(Math.min(doy,183),'day of '+y+(doy>183?' (past 183)':''));
    $('#ringNote').innerHTML=doy>=183?'Day 183 of '+y+' was <b>'+d183.toLocaleDateString(undefined,{month:'long',day:'numeric',timeZone:'UTC'})+'</b>. Anyone who spent every day of this year in one country has already crossed it.':'Day 183 of '+y+' lands on <b>'+d183.toLocaleDateString(undefined,{month:'long',day:'numeric',timeZone:'UTC'})+'</b> — '+(183-doy)+' days from today.';
    var qi=$('#quickDays');
    if(qi)qi.addEventListener('input',function(){
      var n=Math.max(0,Math.min(366,parseInt(qi.value,10)||0));
      paint(n,'days in one country');
      var left=183-n;
      $('#ringNote').innerHTML=n>=183?'<b class="bad-c">At or over 183.</b> Many countries would treat you as tax resident — check that country’s full rules.':n>=150?'<b class="warn-c">'+left+' days of headroom.</b> You are in the danger zone; start logging every day.':'<b class="ok-c">'+left+' days of headroom</b> under a simple 183-day test.';
    });
  }

  /* ---------- Forms ---------- */
  $$('form.js-form').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var msg=$('.form-msg',f);
      if(f._honey&&f._honey.value)return;
      if(!f.checkValidity()){f.reportValidity();return}
      var btn=$('button[type=submit]',f),old=btn?btn.textContent:'';
      if(btn){btn.disabled=true;btn.textContent='Sending…'}
      var data={};
      new FormData(f).forEach(function(v,k){if(k!=='_honey')data[k]=data[k]?data[k]+', '+v:v});
      data._subject=(f.getAttribute('data-subject')||'183333.com form')+' — '+(data.name||data.email||'');
      data._template='table';data._captcha='false';data.page=location.pathname;
      fetch(ENDPOINT(),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().catch(function(){return {}})})
        .then(function(){
          if(msg){msg.className='form-msg ok';msg.textContent=f.getAttribute('data-ok')||'Received — we reply within 2 business days.'}
          f.reset();resetSteps(f);
        })
        .catch(function(){if(msg){msg.className='form-msg err';msg.textContent='Network error — please try again in a minute.'}})
        .then(function(){if(btn){btn.disabled=false;btn.textContent=old}});
    });
  });
  function resetSteps(f){
    var st=$$('.step',f);if(!st.length)return;
    st.forEach(function(s,i){s.classList.toggle('active',i===0)});
    $$('.steps-ind span',f).forEach(function(s,i){s.classList.toggle('on',i===0)});
    f._go&&f._go(0,true);
  }
  $$('form.multistep').forEach(function(f){
    var steps=$$('.step',f),ind=$$('.steps-ind span',f),i=0;
    function go(n,force){
      if(!force&&n>i){var bad=$$('input,select,textarea',steps[i]).filter(function(x){return !x.checkValidity()});if(bad.length){bad[0].reportValidity();return}}
      i=Math.max(0,Math.min(steps.length-1,n));
      steps.forEach(function(s,k){s.classList.toggle('active',k===i)});
      ind.forEach(function(s,k){s.classList.toggle('on',k<=i)});
    }
    f._go=function(n,force){i=0;go(n,force)};
    $$('[data-next]',f).forEach(function(b){b.addEventListener('click',function(){go(i+1)})});
    $$('[data-prev]',f).forEach(function(b){b.addEventListener('click',function(){go(i-1)})});
  });
  // donation tier preselect
  $$('[data-tier]').forEach(function(b){b.addEventListener('click',function(){
    var s=$('#pledgeAmount');if(s){s.value=b.getAttribute('data-tier');}
    var t=$('#pledge');if(t)t.scrollIntoView({behavior:'smooth'});
  })});

  /* ---------- YouTube facades ---------- */
  $$('.video[data-yt]').forEach(function(v){
    var id=v.getAttribute('data-yt');
    v.innerHTML='<img loading="lazy" alt="" src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg"><div class="play"><span>▶</span></div>';
    v.addEventListener('click',function(){
      v.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" title="YouTube video" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>';
    },{once:true});
  });

  /* ---------- Tabs (calculators) ---------- */
  $$('.tool-tabs button').forEach(function(b){
    b.addEventListener('click',function(){
      $$('.tool-tabs button').forEach(function(x){x.classList.toggle('on',x===b)});
      $$('.tool').forEach(function(t){t.classList.toggle('on',t.id===b.getAttribute('data-tool'))});
      history.replaceState(null,'','#'+b.getAttribute('data-tool'));
    });
  });
  if(location.hash){var hb=$('.tool-tabs button[data-tool="'+location.hash.slice(1)+'"]');if(hb)hb.click()}
  function num(id){var el=document.getElementById(id);return el?parseFloat(el.value)||0:0}
  function bind(ids,fn){ids.forEach(function(id){var el=document.getElementById(id);if(el){el.addEventListener('input',fn);el.addEventListener('change',fn)}});fn()}

  /* US Substantial Presence Test */
  if($('#t-spt')){
    bind(['spt-y0','spt-y1','spt-y2','spt-ex'],function(){
      var y0=Math.max(0,num('spt-y0')-num('spt-ex')),y1=num('spt-y1'),y2=num('spt-y2');
      var w=y0+Math.floor(y1/3)+Math.floor(y2/6);
      var exact=y0+y1/3+y2/6;
      var meets=y0>=31&&exact>=183;
      $('#spt-total').textContent=exact.toFixed(1);
      $('#spt-parts').textContent=y0+' + '+(y1/3).toFixed(1)+' + '+(y2/6).toFixed(1);
      var v=$('#spt-verdict');
      if(meets){v.className='verdict bad-c';v.textContent='Meets the Substantial Presence Test'}
      else if(y0<31){v.className='verdict ok-c';v.textContent='Does not meet the test (under 31 days this year)'}
      else{v.className='verdict ok-c';v.textContent='Does not meet the test'}
      var head=Math.ceil(183-(y1/3+y2/6))-y0;
      $('#spt-left').textContent=meets?'Over by '+(exact-183).toFixed(1)+' weighted days. Ask an adviser about the closer-connection exception (Form 8840) or treaty tie-breaker.':'You could spend about '+Math.max(0,head-1)+' more day(s) this year before reaching 183 weighted days (and you need 31+ days this year).';
    });
  }

  /* Schengen 90/180 */
  if($('#t-sch')){
    var box=$('#sch-rows');
    function addRow(a,b){
      var r=document.createElement('div');r.className='trip-row';r.style.gridTemplateColumns='1fr 1fr auto';
      r.innerHTML='<div><label>Entry</label><input type="date" class="s-in" value="'+(a||'')+'"></div><div><label>Exit</label><input type="date" class="s-out" value="'+(b||'')+'"></div><div class="x"><button type="button" class="btn btn-ghost btn-sm" aria-label="Remove stay">✕</button></div>';
      $('button',r).addEventListener('click',function(){r.remove();calcSch()});
      $$('input',r).forEach(function(i){i.addEventListener('change',calcSch)});
      box.appendChild(r);
    }
    function calcSch(){
      var days={};
      $$('.trip-row',box).forEach(function(r){var a=dn($('.s-in',r).value),b=dn($('.s-out',r).value);if(isNaN(a))return;if(isNaN(b))b=a;if(b<a){var t=a;a=b;b=t}for(var d=a;d<=b;d++)days[d]=1});
      var ctrl=dn($('#sch-date').value);if(isNaN(ctrl))ctrl=todayDN();
      function used(d){var n=0;for(var k=d-179;k<=d;k++)if(days[k])n++;return n}
      var u=used(ctrl-1);
      var u2=used(ctrl);
      // max stay starting on ctrl
      var sim={},stay=0;for(var k in days)sim[k]=1;
      for(var d=ctrl;d<ctrl+400;d++){var had=sim[d];sim[d]=1;var n=0;for(var q=d-179;q<=d;q++)if(sim[q])n++;if(n>90){if(!had)delete sim[d];break}stay++}
      $('#sch-used').textContent=u;
      $('#sch-left').textContent=Math.max(0,90-u);
      $('#sch-max').textContent=stay;
      $('#sch-exit').textContent=stay>0?nice(ctrl+stay-1):'—';
      var v=$('#sch-verdict');
      if(u2>90){v.className='verdict bad-c';v.textContent='Overstay risk: '+u2+' days in the 180-day window ending '+nice(ctrl)}
      else if(stay===0){v.className='verdict bad-c';v.textContent='No days available on '+nice(ctrl)}
      else if(stay<15){v.className='verdict warn-c';v.textContent='Tight: only '+stay+' day(s) available from '+nice(ctrl)}
      else{v.className='verdict ok-c';v.textContent='You can enter on '+nice(ctrl)+' and stay up to '+stay+' days'}
    }
    $('#sch-add').addEventListener('click',function(){addRow();});
    $('#sch-date').addEventListener('change',calcSch);
    var td=todayDN();$('#sch-date').value=ds(td);
    addRow(ds(td-120),ds(td-91));addRow(ds(td-40),ds(td-21));
    calcSch();
  }

  /* India residential status (estimate) */
  if($('#t-ind')){
    bind(['in-days','in-prev4','in-cit','in-inc','in-elsewhere','in-nr9','in-prev7','in-leave'],function(){
      var d=num('in-days'),p4=num('in-prev4'),cit=$('#in-cit').checked,inc=$('#in-inc').checked,els=$('#in-elsewhere').checked,nr9=$('#in-nr9').checked,p7=num('in-prev7'),leave=$('#in-leave').checked;
      var status='Non-resident (NR)',why='Fewer than 182 days and the secondary test is not met.',rnorForced=false;
      var second=60;
      if(cit&&leave)second=182;
      else if(cit&&inc)second=120;
      else if(cit)second=182;
      var resident=d>=182||(d>=second&&second<182&&p4>=365);
      if(resident){
        status='Resident';why=d>=182?'182+ days in the financial year.':'Secondary test met ('+second+'+ days this year and 365+ days in the previous 4 years).';
        if(cit&&inc&&d>=120&&d<182)rnorForced=true;
      }else if(cit&&inc&&!els){status='Resident';why='Deemed resident: Indian citizen with Indian income above ₹15 lakh who is not liable to tax in any other country.';rnorForced=true}
      var v=$('#in-verdict');
      if(status==='Resident'){
        var rnor=rnorForced||nr9||p7<=729;
        v.className='verdict warn-c';v.textContent=rnor?'Resident but Not Ordinarily Resident (RNOR)':'Resident and Ordinarily Resident (ROR)';
        $('#in-why').textContent=why+(rnor?' RNOR: foreign income generally stays outside Indian tax unless derived from an Indian business/profession.':' ROR: worldwide income is taxable in India.');
      }else{v.className='verdict ok-c';v.textContent=status;$('#in-why').textContent=why+' Only Indian-source income is taxable.'}
    });
  }

  /* UK Statutory Residence Test (quick check) */
  if($('#t-uk')){
    bind(['uk-days','uk-prev','uk-ties','uk-ftwa'],function(){
      var d=num('uk-days'),leaver=$('#uk-prev').value==='yes',ties=num('uk-ties'),ftwa=$('#uk-ftwa').checked;
      var v=$('#uk-verdict'),w=$('#uk-why'),res,why;
      if(d>=183){res=true;why='Automatic UK test: 183 or more days in the UK tax year.'}
      else if(leaver&&d<16){res=false;why='Automatic overseas test: fewer than 16 days (you were UK resident in at least one of the previous 3 tax years).'}
      else if(!leaver&&d<46){res=false;why='Automatic overseas test: fewer than 46 days and not UK resident in any of the previous 3 tax years.'}
      else if(ftwa&&d<91){res=false;why='Automatic overseas test: full-time work abroad with fewer than 91 UK days (and fewer than 31 UK workdays of 3+ hours).'}
      else{
        var need;
        if(leaver){need=d<=45?4:d<=90?3:d<=120?2:1}
        else{need=d<=45?99:d<=90?4:d<=120?3:2}
        res=ties>=need;
        why=need===99?'Arriver with 16–45 days: not resident regardless of ties.':'Sufficient ties test: '+(leaver?'leaver':'arriver')+' with '+d+' days needs '+need+' tie(s); you have '+ties+'.';
      }
      v.className='verdict '+(res?'bad-c':'ok-c');v.textContent=res?'Likely UK resident':'Likely not UK resident';w.textContent=why+' This is a simplified check — split-year treatment and the "only home" test are not modelled.';
    });
  }

  /* Days-left planner */
  if($('#t-left')){
    bind(['dl-thr','dl-used','dl-date','dl-end'],function(){
      var thr=num('dl-thr')||183,used=num('dl-used'),start=dn($('#dl-date').value),end=dn($('#dl-end').value);
      if(isNaN(start))start=todayDN();
      var left=thr-1-used;
      $('#dl-left').textContent=Math.max(0,left);
      $('#dl-cross').textContent=left<0?'Already at or over':nice(start+left)+' (if you arrive on the planned date and stay continuously)';
      var v=$('#dl-verdict');
      if(!isNaN(end)){var stayDays=end-start+1;var tot=used+stayDays;v.className='verdict '+(tot>=thr?'bad-c':tot>=thr-14?'warn-c':'ok-c');v.textContent='Planned stay: '+stayDays+' days → total '+tot+' of '+thr+(tot>=thr?' — crosses the line':' — stays under')}
      else{v.className='verdict';v.textContent='Add a planned end date to test a trip'}
    });
  }

  /* ---------- Day tracker ---------- */
  var TR=$('#tracker');
  if(TR){
    var KEY='r183-trips',ST={trips:[],mode:'incl',period:'year',year:new Date().getFullYear(),asOf:ds(todayDN())};
    try{var raw=JSON.parse(store(KEY)||'null');if(raw&&raw.trips)ST=Object.assign(ST,raw)}catch(e){}
    function save(){store(KEY,JSON.stringify(ST))}
    var dl=$('#countryList');
    if(dl){var names={};DATA.countries.forEach(function(c){names[c.c]=1});DATA.schengen.forEach(function(c){names[c]=1});
      dl.innerHTML=Object.keys(names).sort().map(function(n){return '<option value="'+esc(n)+'">'}).join('')}
    $('#trMode').value=ST.mode;$('#trPeriod').value=ST.period;$('#trYear').value=ST.year;$('#trAsOf').value=ST.asOf;
    function tripDays(t){
      var a=dn(t.s),b=dn(t.e||t.s);if(isNaN(a))return[];if(isNaN(b))b=a;if(b<a){var x=a;a=b;b=x}
      if(ST.mode==='excl'&&b>a)b=b-1;
      var out=[];for(var d=a;d<=b;d++)out.push(d);return out;
    }
    function render(){
      // list
      var list=$('#trList');
      ST.trips.sort(function(a,b){return a.s<b.s?1:-1});
      list.innerHTML=ST.trips.length?ST.trips.map(function(t){
        var n=tripDays(t).length;
        return '<tr><td><b>'+esc(t.c)+'</b>'+(SCH[t.c.toLowerCase()]?' <span class="tag t">Schengen</span>':'')+(t.n?'<div class="small muted">'+esc(t.n)+'</div>':'')+'</td><td class="mono">'+esc(t.s)+'</td><td class="mono">'+esc(t.e||t.s)+'</td><td class="mono">'+n+'</td><td><button class="btn btn-ghost btn-sm" data-del="'+t.id+'" aria-label="Delete trip">✕</button></td></tr>';
      }).join(''):'<tr><td colspan="5" class="muted">No trips yet. Add your first stay above, or load the sample.</td></tr>';
      $$('[data-del]',list).forEach(function(b){b.addEventListener('click',function(){ST.trips=ST.trips.filter(function(t){return String(t.id)!==b.getAttribute('data-del')});save();render()})});
      // window
      var w0,w1,label;
      if(ST.period==='year'){w0=Date.UTC(+ST.year,0,1)/864e5;w1=Date.UTC(+ST.year,11,31)/864e5;label='Calendar year '+ST.year}
      else{w1=dn(ST.asOf);if(isNaN(w1))w1=todayDN();w0=w1-364;label='Rolling 365 days ending '+nice(w1)}
      $('#trWindow').textContent=label;
      var per={};
      ST.trips.forEach(function(t){tripDays(t).forEach(function(d){if(d<w0||d>w1)return;(per[t.c]=per[t.c]||{})[d]=1})});
      var rows=Object.keys(per).map(function(c){var n=Object.keys(per[c]).length;var r=rule(c);var thr=r&&r.d?r.d:183;return {c:c,n:n,thr:thr,r:r}}).sort(function(a,b){return b.n-a.n});
      var tot=rows.reduce(function(a,r){return a+r.n},0);
      $('#trSum').innerHTML=rows.length?rows.map(function(x){
        var pct=Math.min(100,x.n/x.thr*100),cls=x.n>=x.thr?'over':x.n>=x.thr*.82?'warn':'';
        var note=x.r?(x.r.d?'Threshold '+x.r.d+' days · '+esc(x.r.y):'No pure day-count test · '+esc(x.r.y)):'Default 183-day reference';
        return '<tr><td><b>'+esc(x.c)+'</b><div class="small muted">'+note+'</div></td><td class="mono" style="font-size:1.2rem">'+x.n+'</td><td style="min-width:160px"><div class="bar"><i class="'+cls+'" style="width:'+pct+'%"></i></div><div class="small muted">'+(x.n>=x.thr?'<span class="bad-c">At/over threshold</span>':(x.thr-x.n)+' days headroom')+'</div></td></tr>';
      }).join(''):'<tr><td colspan="3" class="muted">No days in this window.</td></tr>';
      $('#trTotal').textContent=tot;
      $('#trCountries').textContent=rows.length;
      // Schengen
      var asof=dn(ST.asOf);if(isNaN(asof))asof=todayDN();
      var sd={};ST.trips.forEach(function(t){if(SCH[t.c.toLowerCase()])tripDays(t).forEach(function(d){sd[d]=1})});
      var su=0;for(var k=asof-179;k<=asof;k++)if(sd[k])su++;
      $('#trSch').textContent=su+' / 90';
      $('#trSchNote').textContent=su>90?'Over the 90-day limit in the window ending '+nice(asof):(90-su)+' Schengen days left as of '+nice(asof);
      $('#trSch').className='big-num '+(su>90?'bad-c':su>75?'warn-c':'');
      // US SPT for selected year
      var yy=+ST.year,us={};ST.trips.forEach(function(t){if(/^(united states|usa|us)$/i.test(t.c))tripDays(t).forEach(function(d){us[d]=1})});
      function cnt(Y){var a=Date.UTC(Y,0,1)/864e5,b=Date.UTC(Y,11,31)/864e5,n=0;for(var k in us)if(k>=a&&k<=b)n++;return n}
      var c0=cnt(yy),c1=cnt(yy-1),c2=cnt(yy-2),spt=c0+c1/3+c2/6;
      $('#trSpt').textContent=spt.toFixed(1);
      $('#trSptNote').textContent=(c0>=31&&spt>=183)?'Meets the US Substantial Presence Test for '+yy:'US weighted days for '+yy+' ('+c0+' + '+c1+'/3 + '+c2+'/6)';
      $('#trSpt').className='big-num '+((c0>=31&&spt>=183)?'bad-c':spt>150?'warn-c':'');
      save();
    }
    $('#trAdd').addEventListener('submit',function(e){
      e.preventDefault();
      var c=$('#trC').value.trim(),s=$('#trS').value,en=$('#trE').value||s,n=$('#trN').value.trim();
      if(!c||!s){return}
      ST.trips.push({id:Date.now(),c:c,s:s,e:en,n:n});save();render();
      $('#trS').value='';$('#trE').value='';$('#trN').value='';$('#trC').focus();
    });
    ['trMode','trPeriod','trYear','trAsOf'].forEach(function(id){$('#'+id).addEventListener('change',function(){
      ST.mode=$('#trMode').value;ST.period=$('#trPeriod').value;ST.year=$('#trYear').value;ST.asOf=$('#trAsOf').value;render()})});
    $('#trSample').addEventListener('click',function(){
      var Y=new Date().getFullYear();
      ST.trips=[
        {id:1,c:'Portugal',s:Y+'-01-03',e:Y+'-03-28',n:'Lisbon base'},
        {id:2,c:'United Kingdom',s:Y+'-03-28',e:Y+'-04-12',n:'Family visit'},
        {id:3,c:'Spain',s:Y+'-04-12',e:Y+'-05-20',n:'Valencia'},
        {id:4,c:'United Arab Emirates',s:Y+'-05-20',e:Y+'-07-01',n:'Dubai project'},
        {id:5,c:'Thailand',s:Y+'-07-01',e:Y+'-09-15',n:'Chiang Mai'},
        {id:6,c:'United States',s:Y+'-09-15',e:Y+'-10-20',n:'Conference + clients'}
      ];save();render();
    });
    $('#trClear').addEventListener('click',function(){if(confirm('Delete all trips stored in this browser?')){ST.trips=[];save();render()}});
    $('#trCsv').addEventListener('click',function(){
      var csv='country,start,end,note\n'+ST.trips.map(function(t){return [t.c,t.s,t.e,(t.n||'').replace(/"/g,'""')].map(function(v){return '"'+v+'"'}).join(',')}).join('\n');
      var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='183333-day-log.csv';document.body.appendChild(a);a.click();a.remove();
    });
    $('#trImport').addEventListener('change',function(e){
      var f=e.target.files[0];if(!f)return;var rd=new FileReader();
      rd.onload=function(){
        var lines=String(rd.result).split(/\r?\n/).slice(1),added=0;
        lines.forEach(function(l,i){var m=l.match(/("([^"]|"")*"|[^,]*)/g).filter(function(x,j){return j%2===0}).map(function(x){return x.replace(/^"|"$/g,'').replace(/""/g,'"')});
          if(m[0]&&/^\d{4}-\d{2}-\d{2}$/.test(m[1])){ST.trips.push({id:Date.now()+i,c:m[0],s:m[1],e:m[2]||m[1],n:m[3]||''});added++}});
        save();render();alert(added+' trip(s) imported.');
      };rd.readAsText(f);
    });
    $('#trPrint').addEventListener('click',function(){window.print()});
    render();
  }

  /* ---------- Country database ---------- */
  var cdb=$('#countryTable');
  if(cdb){
    var q=$('#cq'),rg=$('#cr'),kd=$('#ck');
    function draw(){
      var s=(q.value||'').toLowerCase(),r=rg.value,k=kd.value;
      var rows=DATA.countries.filter(function(x){return (!r||x.r===r)&&(!k||(k==='day'?x.d:!x.d))&&(x.c+' '+x.t+' '+x.a).toLowerCase().indexOf(s)>-1});
      cdb.innerHTML=rows.map(function(x){
        return '<tr id="'+x.c.toLowerCase().replace(/[^a-z]+/g,'-')+'"><td><b>'+esc(x.c)+'</b><div class="small muted">'+esc(x.r)+'</div></td><td class="mono">'+(x.d?x.d+' days':'<span class="tag">No day test</span>')+'</td><td class="small">'+esc(x.y)+'</td><td class="small">'+esc(x.t)+'</td><td class="small"><a href="'+x.u+'" target="_blank" rel="noopener nofollow">'+esc(x.a)+' ↗</a></td></tr>';
      }).join('')||'<tr><td colspan="5" class="muted">No match.</td></tr>';
      $('#cCount').textContent=rows.length+' of '+DATA.countries.length+' jurisdictions';
    }
    [q,rg,kd].forEach(function(el){el.addEventListener('input',draw)});draw();
  }

  /* ---------- Visa directory ---------- */
  var vg=$('#visaGrid');
  if(vg){
    var vq=$('#vq'),vr=$('#vr');
    function vdraw(){
      var s=(vq.value||'').toLowerCase(),r=vr.value;
      var rows=DATA.visas.filter(function(v){return (!r||v.r===r)&&(v.c+' '+v.n).toLowerCase().indexOf(s)>-1});
      vg.innerHTML=rows.map(function(v){var rl=rule(v.c);
        return '<div class="card"><span class="tag a">'+esc(v.r)+'</span><h3 style="margin-top:10px">'+esc(v.c)+'</h3><p><b style="color:var(--text)">'+esc(v.n)+'</b><br>'+esc(v.len)+'</p>'+(rl?'<p class="small">Tax residency: '+(rl.d?rl.d+'-day test':'no pure day test')+' · '+esc(rl.y)+'</p>':'')+'<a class="small" href="'+v.u+'" target="_blank" rel="noopener nofollow">Official source ↗</a></div>';
      }).join('')||'<p class="muted">No match.</p>';
    }
    [vq,vr].forEach(function(el){el.addEventListener('input',vdraw)});vdraw();
  }

  /* ---------- Guide filter ---------- */
  var gs=$('#guideSearch');
  if(gs)gs.addEventListener('input',function(){var s=gs.value.toLowerCase();$$('[data-guide]').forEach(function(c){c.style.display=c.textContent.toLowerCase().indexOf(s)>-1?'':'none'})});

  /* ---------- Contest countdown (last day of month 23:59 UTC) ---------- */
  var cd=$('#contestCount');
  if(cd){
    function target(){var d=new Date();return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0,23,59,59))}
    var T=target();$('#contestEnd').textContent=T.toUTCString().replace('GMT','UTC');
    (function tick(){var ms=Math.max(0,T-new Date());
      var p=[Math.floor(ms/864e5),Math.floor(ms%864e5/36e5),Math.floor(ms%36e5/6e4),Math.floor(ms%6e4/1e3)];
      $$('b',cd).forEach(function(b,i){b.textContent=(p[i]<10&&i?'0':'')+p[i]});
      setTimeout(tick,1000)})();
  }
})();
