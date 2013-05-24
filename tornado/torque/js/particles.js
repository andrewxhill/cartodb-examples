
var Entities = function(size, remove_callback) {
    this.x = new Float32Array(size);
    this.y = new Float32Array(size);
    this.life = new Float32Array(size);
    this.current_life = new Float32Array(size);
    this.remove = new Int32Array(size);
    this.type = new Int8Array(size);
    this.last = 0;
    this.size = size;
    this.sprites = []

    this.sprites.push(this.pre_cache_sprites('rgba(255, 255, 255, 0.8)'))
}

Entities.prototype.pre_cache_sprites = function(color) {
  var sprites = []
  for(var i = 0; i < 30; ++i) {
    var pixel_size = i*2 + 2;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.width = canvas.width = pixel_size *2 ;
    ctx.height = canvas.height = pixel_size * 2 ;
    ctx.fillStyle = color;//'rgba(0, 255,255, 0.12)';
    ctx.beginPath();
    ctx.arc(pixel_size, pixel_size, pixel_size, 0, Math.PI*2, true, true);
    ctx.closePath();
    ctx.fill();
    sprites.push(canvas);
  }
  return sprites;
}

Entities.prototype.add = function(x, y, life, type) {
  if(this.last < this.size) {
    this.x[this.last] = x;
    this.y[this.last] = y;
    this.life[this.last] = Math.min(life, 29);
    this.current_life[this.last] = 0;
    this.type[this.last] = type;
    this.last++;
  }
}

Entities.prototype.dead = function(i) {
  return false;
}

Entities.prototype.render= function(ctx) {
  var s, t;
  for(var i = 0; i < this.last ; ++i) {
    s = (this.current_life[i])>>0;
    t = this.type[i];
    //ctx.arc(this.x[i], this.y[i] ,3*this.life[i], 0, 2*Math.PI, true, true);
    ctx.drawImage(this.sprites[t][s], (this.x[i] - s*2)>>0, (this.y[i] - s*2)>>0);
  }
}

Entities.prototype.update = function(dt) {
    var len = this.last;
    var removed = 0;
    var _remove = this.remove;

    for(var i = len - 1; i >= 0; --i) {
        //var c = (this.life[i] -= this.life[i]*0.15);
        var diff = this.life[i] - this.current_life[i];
        this.current_life[i] += diff*dt*3
        if(diff <= 0.05) {
          _remove[removed++] = i;
        }
    }

    for(var ri = 0; ri < removed; ++ri) {
      var r = _remove[ri];
      var last = this.last - 1;
      // move last to the removed one and remove it
      this.x[r] = this.x[last];
      this.y[r] = this.y[last];
      this.life[r] = this.life[last];
      this.current_life[r] = this.current_life[last]
      this.type[r] = this.type[last];

      this.last--;
    }
};


