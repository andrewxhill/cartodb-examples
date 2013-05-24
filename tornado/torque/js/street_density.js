
var StreetLayerDensity = L.CanvasLayer.extend({
  initialize: function() {
    L.CanvasLayer.prototype.initialize.call(this);
    this.getDensityData();
    this.entities = new Entities(13000);
    this.time = 0;
    this.density_data = null;
  },

  getDensityData: function() {
    var self = this;
    $.getJSON("twomonths_london_14_96_count.json", function(data) {
      overall_activity = [];
      var max_activity = 0;
      var simplify = d3.simplify();
      for (var i = 0, len = data.length; i < len; ++i) {
        var r = data[i];
        var coords = r.vertex;
        var activity = r.activity;
        var grouped_activity = []
        for(var a = 0; a < activity[0].length; ++a) {
          grouped_activity[a] = 0.0;
          for(var aa = 0; aa < activity.length; ++aa) {
            var v = activity[aa][a];
            max_activity = Math.max(max_activity, v);
            grouped_activity[a] += v;
          }
          overall_activity[a] = overall_activity[a] || 0;
          overall_activity[a] += grouped_activity[a];
        }
        var coords = r.vertex;
        r.activity = grouped_activity;
        //r.vertex = simplify(coords);
      }
      //normalize activity
      var m = 0;
      for(var i = 0; i < overall_activity.length; ++i) {
        m = Math.max(overall_activity[i], m);
      }
      for(var i = 0; i < overall_activity.length; ++i) {
        overall_activity[i] /= m;
      }

      console.log("overall_activity", overall_activity);
      self.density_data = data;
      self.density_data.overall_activity = overall_activity;
    });
  },

  onAdd: function (map) {
    L.CanvasLayer.prototype.onAdd.call(this, map);
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
  },

  set_time: function(t) {
    this.time = t;
  },

  _render2: function(delta) {
    this._canvas.width = this._canvas.width;
    var w2 = this._canvas.width/2;
    var h2 = this._canvas.height/2;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
    if(!this.density_data) return;
    for(var i = 0; i < this.density_data.length; ++i) {
      var vertex = this.density_data[i].vertex;
      var zoom = this._map.getZoom()
      for(var v = 0; v < vertex.length; ++v) {
        var p0 = this._map.project(vertex[v], zoom);
        this._ctx.fillRect(p0.x, p0.y, 2, 2);
      }
    }
  },

  _render: function(delta) {
    this._canvas.width = this._canvas.width;
    var w2 = this._canvas.width/2;
    var h2 = this._canvas.height/2;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
    //this._ctx.fillStyle =  'rgba(52, 111, 190, 0.01)';//rgba(0, 0, 0, 0.03)';//'rgba(255, 255,255, 0.3)';
    //this._ctx.globalCompositeOperation = 'source-over';
    //this._ctx.fillRect(origin.x, origin.y, this._canvas.width, this._canvas.height);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.2);' 
    if(this.time  >50) {
    }
    this._ctx.fillStyle = 'rgba(30, 60, 100, 0.7)';
    //this._ctx.fillStyle= 'rgba(200, 35, 0, 0.2)';
    //this._ctx.strokeStyle= 'rgba(200, 35, 0, 0.2)';
    //this._ctx.globalCompositeOperation = 'lighter';
    this.entities.update(delta);
    this.entities.render(this._ctx);

    
    if(!this.density_data) return;
    var O_KE_ASE = this.density_data.overall_activity[this.time]*200;
    O_KE_ASE = O_KE_ASE>>0;
    var tries = O_KE_ASE*5;
    while(O_KE_ASE && tries--) {
      var street = this.density_data[(Math.random()*this.density_data.length)>>0];
      var activity = street.activity[this.time];
      if(activity > 0 ) {
        activity /= 3;
        while(activity-- > 0) {
          var vertex = street.vertex;
          var p = (Math.random()*(vertex.length - 1))>>0;
          var zoom = this._map.getZoom()
          var p0 = this._map.project(vertex[p], zoom);
          var p1 = this._map.project(vertex[p + 1], zoom);
          var dx = p1.x - p0.x;
          var dy = p1.y - p0.y;
            this.entities.add(
              p0.x + rand(),
              p0.y + rand(),
              6*dx + rand(),
              6*dy + rand(),
              0.1 + 10*Math.random(),
              0
              //activity/30
            );
            O_KE_ASE--;
        }
      }
    }

    this._backCtx.globalAlpha = 1;
    this._backCtx.globalCompositeOperation = 'source-over';
    //this._backCtx.fillStyle = 'rgba(52, 111, 190, 0.1)';
    //this._backCtx.fillRect(0, 0, this._backCanvas.width, this._backCanvas.height);
    //this._backCtx.fillRect(0, 0, this._backCanvas.width, this._backCanvas.height);
    this._backCtx.globalAlpha = 0.01;
    this._backCtx.globalCompositeOperation = 'lighter';
    this._backCtx.drawImage(this._canvas, 0, 0);

  },
});
