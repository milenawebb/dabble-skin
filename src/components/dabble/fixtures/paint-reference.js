// Dabble paint engine (reference implementation, plain JS).
// geo = { W, H, vx, vy, vw, vh }: canvas size in CSS px, and the video rectangle inside it.
// A stroke = { type, seed, pal, color?, size?, pts? }
//   type: 'imp' | 'cub' | 'drip' | 'rib'  (hand strokes: need color, size, pts)
//         'auto-imp' | 'auto-cub' | 'auto-drip' | 'auto-rib'  ("Paint it for me": need only seed and pal)
//   seed: integer. The same seed always draws the same marks, so the painting survives a resize.
//   pal:  array of 6 hex colors (the palette at the time of the stroke)
//   color: hex color of the chosen pot
//   size: brush size divided by the canvas width W (so it scales)
//   pts:  array of [x / W, y / H] points (normalized, so they scale)
var PAPER = '#FDFDFB', INK = '#1b1b1a';

function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function h2r(h){return[parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)];}
function mix(a,b,t){var p=h2r(a),q=h2r(b);return'rgb('+p.map(function(x,i){return Math.round(x+(q[i]-x)*t);}).join(',')+')';}
function dot(c,a,b,r){c.beginPath();c.arc(a,b,r,0,6.3);c.fill();}

// random point on the frame (anywhere on the canvas that is not under the video)
function fpt(r,g){var top=g.W*g.vy,bot=g.W*(g.H-g.vy-g.vh),lef=g.vx*g.vh,rig=(g.W-g.vx-g.vw)*g.vh,t=r()*(top+bot+lef+rig);
  if(t<top)return[r()*g.W,r()*g.vy];t-=top;
  if(t<bot)return[r()*g.W,g.vy+g.vh+r()*(g.H-g.vy-g.vh)];t-=bot;
  if(t<lef)return[r()*g.vx,g.vy+r()*g.vh];
  return[g.vx+g.vw+r()*(g.W-g.vx-g.vw),g.vy+r()*g.vh];}

// Impressionist: one dab = a cluster of curved bristle lines in broken color
function dab(c,r,a,b,ang,l,w,col){var n=Math.max(3,Math.round(w/1.6)),i,ca=Math.cos(ang),sa=Math.sin(ang),nx=-sa,ny=ca,bend=(r()-.5)*l*.4;c.lineCap='round';c.globalAlpha=.9;c.lineWidth=w/n*1.5;
  for(i=0;i<n;i++){var o=(i/(n-1)-.5)*w,q=r(),ll=l*(.7+r()*.4)/2,mx=a+nx*o,my=b+ny*o;c.strokeStyle=q<.3?mix(col,'#ffffff',.25+r()*.3):q<.45?mix(col,'#101030',.18):col;c.beginPath();c.moveTo(mx-ca*ll,my-sa*ll);c.quadraticCurveTo(mx+nx*bend,my+ny*bend,mx+ca*ll,my+sa*ll);c.stroke();}c.globalAlpha=1;}

// Cubist: one shaded triangular facet with ink edges and occasional hatching
function tri(c,r,a,b,d,col,k){var mx=(b[0]+d[0])/2,my=(b[1]+d[1])/2,i;
  var pth=function(){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1]);c.closePath();};pth();
  if(col===PAPER){c.globalAlpha=1;c.fillStyle=PAPER;c.fill();}else{var g2=c.createLinearGradient(a[0],a[1],mx,my);g2.addColorStop(0,r()<.5?mix(col,INK,.5):mix(col,'#ffffff',.6));g2.addColorStop(1,col);c.globalAlpha=.97;c.fillStyle=g2;c.fill();}
  if(r()<.14){c.save();c.clip();c.strokeStyle=INK;c.lineWidth=.7*k;c.globalAlpha=.55;var cx=(a[0]+b[0]+d[0])/3,cy=(a[1]+b[1]+d[1])/3;for(i=-14;i<15;i++){c.beginPath();c.moveTo(cx+i*3.4*k-50*k,cy-50*k);c.lineTo(cx+i*3.4*k+50*k,cy+50*k);c.stroke();}c.restore();pth();}
  c.globalAlpha=1;c.strokeStyle=INK;c.lineJoin='round';c.lineWidth=(r()<.2?1.8:.9)*k;c.stroke();}

// Drip: one splash = an uneven blob plus flung droplets and short streaks
function splat(c,r,a,b,rad,col,dir){c.fillStyle=col;c.strokeStyle=col;c.globalAlpha=.95;c.lineCap='round';var i,t,d,rr,n=6+Math.floor(r()*8);
  for(i=0;i<5;i++){t=r()*6.3;dot(c,a+Math.cos(t)*rad*.35,b+Math.sin(t)*rad*.35,rad*(.55+r()*.35));}
  for(i=0;i<n;i++){t=dir==null?r()*6.3:dir+(r()-.5)*1.6;d=rad*(1.3+r()*r()*3.5);rr=Math.max(.6,rad*(.06+r()*.2));
    if(r()<.4){c.lineWidth=rr*1.2;c.beginPath();c.moveTo(a+Math.cos(t)*rad*.7,b+Math.sin(t)*rad*.7);c.lineTo(a+Math.cos(t)*d,b+Math.sin(t)*d);c.stroke();}
    dot(c,a+Math.cos(t)*d,b+Math.sin(t)*d,rr);}c.globalAlpha=1;}

// Ribbon: six see-through bands side by side, with darker edges
function bands(r){var n=6,b=[],i;for(i=0;i<n;i++)b.push(.15+r()*.45);b[Math.floor(r()*n)]=.05;return b;}
function off(p,o){return p.map(function(q,i){var j=p[Math.max(i-1,0)],k=p[Math.min(i+1,p.length-1)],dx=k[0]-j[0],dy=k[1]-j[1],l=Math.hypot(dx,dy)||1;return[q[0]-dy/l*o,q[1]+dx/l*o];});}
function curve(c,p){c.beginPath();c.moveTo(p[0][0],p[0][1]);for(var i=1;i<p.length-1;i++)c.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);c.lineTo(p[p.length-1][0],p[p.length-1][1]);c.stroke();}
function ribbon(c,p,col,w,B){if(p.length<2)return;var n=B.length,i;c.lineCap='butt';c.lineJoin='round';c.strokeStyle=col;
  for(i=0;i<n;i++){c.globalAlpha=B[i];c.lineWidth=w/n+.6;curve(c,off(p,-w/2+(i+.5)*w/n));}
  c.globalAlpha=.55;c.lineWidth=1.2;curve(c,off(p,-w/2));curve(c,off(p,w/2));c.globalAlpha=1;}

// Draw ONE stroke onto a 2D context whose transform is already scaled to CSS pixels.
function renderStroke(c,s,g){
  var W=g.W,H=g.H,r=rng(s.seed),k=W/680,P=s.pal,pk=function(){return P[Math.floor(r()*P.length)];},i,q;
  var dens=Math.max(.35,(W*H-g.vw*g.vh)/(70000*k*k));
  c.save();c.globalCompositeOperation=s.type==='rib'||s.type==='auto-rib'?'multiply':'source-over';
  if(s.type==='auto-imp'){for(i=0;i<760*dens;i++){q=fpt(r,g);var kk=Math.floor((q[0]/W)*3+(q[1]/H)*2+r()*1.3)%P.length;dab(c,r,q[0],q[1],Math.sin(q[0]/(110*k))*.5+Math.cos(q[1]/(85*k))*.4,(14+r()*7)*k,(5.5+r()*3)*k,P[kk]);}}
  else if(s.type==='auto-cub'){var cs=28*k,nx=Math.ceil(W/cs)+1,ny=Math.ceil(H/cs)+1,G=[],jj,ii;
    for(jj=0;jj<=ny;jj++){G.push([]);for(ii=0;ii<=nx;ii++)G[jj].push([ii*cs+(ii&&ii<nx?(r()-.5)*cs*.7:0),jj*cs+(jj&&jj<ny?(r()-.5)*cs*.7:0)]);}
    var sh=function(n){var t=r();return t<.1?PAPER:t<.72?P[n%P.length]:P[(n+1+Math.floor(r()*2))%P.length];};
    for(jj=0;jj<ny;jj++)for(ii=0;ii<nx;ii++){var A=G[jj][ii],Bq=G[jj][ii+1],Dq=G[jj+1][ii],E=G[jj+1][ii+1],mx=(A[0]+E[0])/2,my=(A[1]+E[1])/2;if(mx>g.vx+cs&&mx<g.vx+g.vw-cs&&my>g.vy+cs&&my<g.vy+g.vh-cs)continue;
      var nn=Math.floor((Math.sin(mx/(110*k)+1)+Math.cos(my/(90*k)+2)+2)/4*6)%6;if(r()<.5){tri(c,r,A,Bq,Dq,sh(nn),k);tri(c,r,E,Bq,Dq,sh(nn),k);}else{tri(c,r,Bq,A,E,sh(nn),k);tri(c,r,Dq,A,E,sh(nn),k);}}
    c.strokeStyle=INK;c.lineCap='butt';c.globalAlpha=1;for(i=0;i<7;i++){q=fpt(r,g);var a0c=r()*6.3;c.lineWidth=1.8*k;c.beginPath();c.arc(q[0],q[1],(14+r()*16)*k,a0c,a0c+3.14);c.stroke();}}
  else if(s.type==='auto-drip'){c.lineCap='round';for(i=0;i<3;i++){q=fpt(r,g);var a=q[0],b=q[1],ang=r()*6.3,st;c.strokeStyle=pk();c.lineWidth=(.8+r()*.8)*k;for(st=0;st<90;st++){ang+=(r()-.5)*.8;var na=a+Math.cos(ang)*7*k,nb=b+Math.sin(ang)*7*k;if(na<0||na>W||nb<0||nb>H){ang+=3.14;continue;}c.beginPath();c.moveTo(a,b);c.lineTo(na,nb);c.stroke();a=na;b=nb;}}
    for(i=0;i<46*dens;i++){q=fpt(r,g);splat(c,r,q[0],q[1],(2.6+r()*r()*14)*k,pk());}
    for(i=0;i<140*dens;i++){q=fpt(r,g);c.fillStyle=pk();dot(c,q[0],q[1],(.4+r()*1.2)*k);}}
  else if(s.type==='auto-rib'){c.lineCap='butt';for(i=0;i<8;i++){var cx=r()*W,cy=r()*H*1.3-.15*H,rad=(.16+r()*.42)*W,a0=r()*6.3,a1=a0+1.6+r()*3.2,w=(.05+r()*.04)*W,B=bands(r),n=B.length,j;c.strokeStyle=pk();
      for(j=0;j<n;j++){c.globalAlpha=B[j];c.lineWidth=w/n+.6;c.beginPath();c.arc(cx,cy,rad-w/2+(j+.5)*w/n,a0,a1);c.stroke();}
      c.globalAlpha=.55;c.lineWidth=1.2;c.beginPath();c.arc(cx,cy,rad-w/2,a0,a1);c.stroke();c.beginPath();c.arc(cx,cy,rad+w/2,a0,a1);c.stroke();}c.globalAlpha=1;}
  else{
    var sz=s.size*W,p=s.pts.map(function(t){return[t[0]*W,t[1]*H];}),ang2;
    if(s.type==='rib'){ribbon(c,p,s.color,sz*1.6,bands(r));}
    else if(s.type==='drip'){splat(c,r,p[0][0],p[0][1],sz*.3,s.color);for(i=1;i<p.length;i++){ang2=Math.atan2(p[i][1]-p[i-1][1],p[i][0]-p[i-1][0]);c.lineCap='round';c.strokeStyle=s.color;c.globalAlpha=.9;c.lineWidth=Math.max(.8,sz*.07);c.beginPath();c.moveTo(p[i-1][0],p[i-1][1]);c.lineTo(p[i][0],p[i][1]);c.stroke();c.globalAlpha=1;
        if(r()<.6)splat(c,r,p[i][0]+(r()-.5)*sz,p[i][1]+(r()-.5)*sz,sz*(.1+r()*.28),r()<.2?pk():s.color,ang2);}}
    else if(s.type==='cub'){var w2=sz*1.5,L=p[0],V0=null,V1=null,sd=1;for(i=1;i<p.length;i++){var dd=Math.hypot(p[i][0]-L[0],p[i][1]-L[1]);if(dd<w2*.55)continue;ang2=Math.atan2(p[i][1]-L[1],p[i][0]-L[0]);var ux=-Math.sin(ang2),uy=Math.cos(ang2);if(!V0){V0=[L[0]+ux*w2*.45,L[1]+uy*w2*.45];V1=[L[0]-ux*w2*.45,L[1]-uy*w2*.45];}var rr=w2*(.3+r()*.35)*sd,NV=[p[i][0]+ux*rr+(r()-.5)*w2*.2,p[i][1]+uy*rr+(r()-.5)*w2*.2],t2=r();tri(c,r,NV,V0,V1,t2<.08?PAPER:t2<.3?pk():s.color,k);V0=V1;V1=NV;sd=-sd;L=p[i];}}
    else{for(i=1;i<p.length;i++){ang2=Math.atan2(p[i][1]-p[i-1][1],p[i][0]-p[i-1][0]);for(q=0;q<2;q++)dab(c,r,p[i][0]+(r()-.5)*sz*.9,p[i][1]+(r()-.5)*sz*.9,ang2+(r()-.5)*.9,sz*.9,sz*.4,r()<.3?pk():s.color);}}
  }
  c.restore();
}
