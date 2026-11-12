// Strict indexed-access narrowing; the reference loops guarantee these indices.
function item<T>(values: ArrayLike<T>, index: number): T {
  const value = values[index];
  if (value === undefined) throw new RangeError('Invalid palette array index');
  return value;
}
type HSL = [number, number, number];
function colorHSL(hex: string): HSL {
  const value = hex.replace(/^#/, '');
  const expanded = value.length === 3 ? value.split('').map(char => char + char).join('') : value;
  const rgb = [0, 2, 4].map(index => parseInt(expanded.slice(index, index + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = rgb;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const lightness = (max + min) / 2;
  if (!delta) return [0, 0, lightness];
  const hue = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return [hue * 60, delta / (1 - Math.abs(2 * lightness - 1)), lightness];
}

export function colorName(hex: string): string {
  const [hue, saturation, lightness] = colorHSL(hex);
  if (saturation < .1) return lightness > .9 ? 'White' : lightness < .1 ? 'Black' : 'Gray';
  const ranges: [number, string][] = [[15, 'Red'], [40, 'Orange'], [70, 'Yellow'], [95, 'Lime'], [160, 'Green'], [175, 'Teal'], [195, 'Cyan'], [250, 'Blue'], [275, 'Indigo'], [300, 'Purple'], [335, 'Pink'], [350, 'Rose'], [360, 'Red']];
  const base = hue >= 15 && hue < 45 && lightness < .4 && saturation < .65 ? 'Brown' : ranges.find(([end]) => hue < end)?.[1] ?? 'Red';
  return lightness > .75 ? `Light ${base.toLowerCase()}` : lightness < .3 ? `Dark ${base.toLowerCase()}` : base;
}

export function paintColorNames(palette: readonly string[]): string[] {
  const names = palette.map(colorName);
  const lightnesses = palette.map(hex => colorHSL(hex)[2]);
  const distinguished = names.map((name, index) => {
    const peers = names.flatMap((other, i) => other === name ? [lightnesses[i] ?? 0] : []);
    const lightness = lightnesses[index] ?? 0;
    if (peers.length > 1 && Math.max(...peers) - Math.min(...peers) >= .08 && !/^(Light|Dark|White|Black)/.test(name)) {
      if (lightness === Math.max(...peers)) return `Light ${name.toLowerCase()}`;
    }
    return name;
  });
  const used = new Set<string>();
  return distinguished.map(name => {
    const base = `${name} paint`;
    let label = base, number = 2;
    while (used.has(label)) label = `${base} ${number++}`;
    used.add(label);
    return label;
  });
}
// Dabble palette helpers (reference implementation, plain JS).

function hslToHex(h: number,s: number,l: number){var a=s*Math.min(l,1-l),f=function(n: number){var k=(n+h/30)%12,c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return('0'+Math.round(c*255).toString(16)).slice(-2);};return'#'+f(0)+f(8)+f(4);}

// data = RGBA bytes from getImageData on a small copy of a video frame (64 x 36 is enough).
// Returns 6 vivid hex colors, strongest first.
export function paletteFromPixels(data: ArrayLike<number>){
  var B: {w:number;x:number;y:number;s:number;l:number}[]=[],i;for(i=0;i<12;i++)B.push({w:0,x:0,y:0,s:0,l:0});
  for(i=0;i<data.length;i+=4){
    var r=item(data,i)/255,g=item(data,i+1)/255,b=item(data,i+2)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;
    if(d<.08||mx<.15)continue;                      // skip grays and near-black
    var s=d/(1-Math.abs(2*l-1)||1),h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;
    var w=s*mx,k=item(B,Math.floor(h/30)%12);           // 12 hue buckets, weighted by how colorful the pixel is
    k.w+=w;k.x+=Math.cos(h*Math.PI/180)*w;k.y+=Math.sin(h*Math.PI/180)*w;k.s+=s*w;k.l+=l*w;
  }
  var top=B.filter(function(k){return k.w>2;}).sort(function(a,b){return b.w-a.w;}).slice(0,6).map(function(k): HSL {
    var h=(Math.atan2(k.y,k.x)*180/Math.PI+360)%360;
    return[h,Math.max(.78,Math.min(1,k.s/k.w)),Math.max(.42,Math.min(.58,k.l/k.w))];   // push toward vivid, mid lightness
  });
  var base=top.length?item(top,0)[0]:215,add=[40,180,-40,140,220,90],j=0;
  while(top.length<6)top.push([(base+item(add,j++)+360)%360,.85,.52]);                        // fill gaps with related hues
  return top.map(function(c){return hslToHex(item(c,0),item(c,1),item(c,2));});
}

export function luminance(hex: string){var c=[1,3,5].map(function(i){var v=parseInt(hex.substr(i,2),16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*item(c,0)+.7152*item(c,1)+.0722*item(c,2);}
export function contrast(a: string,b: string){var x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}

// Lighten a color step by step until dark ink (#1b1b1a) on top of it reaches the target contrast.
export function tintForInk(hex: string,target?: number){
  target=target||4.5;var p=[1,3,5].map(function(i){return parseInt(hex.substr(i,2),16);}),t=0,out=hex;
  while(contrast(out,'#1b1b1a')<target&&t<1){t+=.05;out='#'+p.map(function(v){return('0'+Math.round(v+(255-v)*t).toString(16)).slice(-2);}).join('');}
  return out;
}
