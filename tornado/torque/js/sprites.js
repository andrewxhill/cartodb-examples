
/**
 * generate sprites in small canvas to speedup rendering
 */

var Sprites = {

  render_to_canvas: function(fn, w, h) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h
    fn(ctx, w, h);
    return canvas;
  },

  draw_circle_glow: function(ctx, pixel_size, color, exp) {
    var p;
    var I = ctx.getImageData(0, 0, pixel_size, pixel_size);
    var pixels = I.data;
    var cx = pixel_size >> 1;
    var cy = pixel_size >> 1;
    for(var x = 0; x < pixel_size; ++x) {
      for(var y = 0; y < pixel_size; ++y) {
         p = (y*pixel_size + x) * 4;
         var dx = x - cx;
         var dy = y - cy;
         var r = Math.sqrt(dx * dx + dy * dy)/pixel_size;
         pixels[p + 0] = color[0];
         pixels[p + 1] = color[1];
         pixels[p + 2] = color[2];
         pixels[p + 3] = color[3]*Math.cos(r*Math.PI)
         //var a = Math.cos(r*Math.PI) 
         //pixels[p + 3] = color[3]*a*a*a*a*a;
         pixels[p + 3] = color[3]*Math.exp(-r*exp)
      }
    }
    ctx.putImageData(I, 0, 0)
  },

  circle: function(ctx, size, color) {
    var pixel_size = size >> 1;
    var tau = Math.PI * 2;
    ctx.fillStyle = color
    ctx.beginPath();
    ctx.arc(pixel_size, pixel_size, pixel_size, 0, tau, true, true);
    ctx.closePath();
    ctx.fill();
  }

}; // Sprites



