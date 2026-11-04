(function(){
  // splash
  window.addEventListener('load',function(){setTimeout(function(){var s=document.getElementById('splash');if(s)s.classList.add('hide');},900);});
  // flag wipe on page change
  var wipe=document.getElementById('wipe');
  if(typeof window.navigate==='function'){
    var _n=window.navigate;
    window.navigate=function(){wipe.classList.remove('go');void wipe.offsetWidth;wipe.classList.add('go');var a=arguments,t=this;setTimeout(function(){_n.apply(t,a);},320);};
  }
  // ripple on buttons
  document.addEventListener('click',function(e){var b=e.target.closest('.btn');if(!b)return;var r=document.createElement('span'),d=Math.max(b.offsetWidth,b.offsetHeight),p=b.getBoundingClientRect();r.className='ripple';r.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-p.left-d/2)+'px;top:'+(e.clientY-p.top-d/2)+'px';b.appendChild(r);setTimeout(function(){r.remove();},600);});
  // floating shapla / stars / leaves in hero
  var icons=['🌸','✦','🍃','🕊️'];
  function floats(){var h=document.querySelector('.hero');if(!h||h.querySelector('.bd-float'))return;for(var i=0;i<12;i++){var s=document.createElement('span');s.className='bd-float';s.textContent=icons[i%4];s.style.cssText='left:'+(Math.random()*95)+'%;bottom:'+(Math.random()*30)+'%;animation-duration:'+(9+Math.random()*10)+'s;animation-delay:'+(-Math.random()*12)+'s;font-size:'+(.9+Math.random()*1.2)+'rem';h.appendChild(s);}}
  setInterval(floats,500);
  // hero parallax
  window.addEventListener('scroll',function(){var h=document.querySelector('.hero');if(h)h.style.backgroundPositionY=(scrollY*.3)+'px';},{passive:true});
})();
