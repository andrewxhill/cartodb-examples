
var originShift = 2 * Math.PI * 6378137 / 2.0;
var initialResolution = 2 * Math.PI * 6378137 / 256.0;
function meterToPixels(mx, my, zoom) {
    var res = initialResolution / (1 << zoom);
    var px = (mx + originShift) / res;
    var py = (my + originShift) / res;
    return [px, py];
}


var StreetLayer = L.CanvasLayer.extend({

  options: {
    user: "osm2",
    table: "table_1950_2012_t",
    column: "to_date(date,'DD/Mn/YYYY')",
    countby: "max(damage)",
    resolution: 1,
    step: 8000000,
    steps: 720,
    start_date: -631155600, //'2013-03-22 00:00:00+00:00',
    end_date: 1327964400 //'2013-03-22 23:59:57+00:00'
  },

  initialize: function() {
    L.CanvasLayer.prototype.initialize.call(this);
    this.on('tileAdded', function(t) {
      this.getProbsData(t, t.zoom);
    }, this);
    this.MAX_UNITS = this.options.steps + 2;
    this.force_map = {};
    this.time = 0;
    this.sprites = []
    this.render_options = {
      part_min_size: 5,
      part_inc: 10,
      part_color: [255, 255, 255, 1.0],
      min_alpha: 0.01,
      alpha_inc: 0.2,
      exp_decay: 9,
      post_process: true,
      post_size: 512,
      post_alpha: 0.3,
      post_decay: 0.07,
      filtered: false
    }
    this.precache_sprites = this.precache_sprites.bind(this)
    this.init_post_process = this.init_post_process.bind(this);

    this.precache_sprites();
  },

  precache_sprites: function() {
    this.sprites = []
    var ro = this.render_options;
    var sprite_size = function(size, alpha) {
     size = size >> 0;
     return Sprites.render_to_canvas(function(ctx, w, h) {
        var c = ro.part_color;
        Sprites.draw_circle_glow(ctx, size, [c[0], c[1], c[2], alpha*255], ro.exp_decay)
        //Sprites.circle(ctx, size, 'rgba(255, 255, 255, 0.4)')
      }, size, size);
    }
    for(var i = 0; i < 7; ++i) {
      this.sprites.push(sprite_size(ro.part_min_size + i*ro.part_inc, ro.min_alpha + ro.alpha_inc*i));
    }
  },

  set_time: function(t) {
    this.time = t;
  },


  onAdd: function (map) {
    L.CanvasLayer.prototype.onAdd.call(this, map);
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this.init_post_process();
    this._ctx.translate(-origin.x, -origin.y);
    this._backCtx.translate(-origin.x, -origin.y);
  },

  init_post_process: function() {
    var canvasPost = document.createElement('canvas');
    var ctxPost = canvasPost.getContext('2d');
    canvasPost.height = canvasPost.width = this.render_options.post_size;
    this.canvasPost = canvasPost;
    this.ctxPost = ctxPost;
  },

  _do_post_process: function(origin) {
    var post_size = this.render_options.post_size;
    var ctxPost = this.ctxPost;
    var ctx = this._ctx;

    ctxPost.fillStyle = 'rgba(0, 0, 0, ' + this.render_options.post_decay + ')';
    ctxPost.fillRect(0, 0, post_size, post_size);
    ctxPost.drawImage(this._canvas, 0, 0, post_size, post_size);

    ctx.globalAlpha = this.render_options.post_alpha;
    //ctx.globalCompositeOperation = 'ligthen'
    ctx.drawImage(this.canvasPost,origin.x, origin.y, this._canvas.width, this._canvas.height);
    //ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1;
  },

  _render: function(delta) {
    this._canvas.width = this._canvas.width;
    var origin = this._map._getNewTopLeftPoint(this._map.getCenter(), this._map.getZoom());
    this._ctx.translate(-origin.x, -origin.y);
    this._ctx.globalCompositeOperation = 'lighter';

    var ctx = this._ctx;
    var time = this.time;
    var s = 2
    for(var tile in this._tiles) {
      var tt = this._tiles[tile]
      var x = tt.x
      var y = tt.y;
      var count = this.render_options.filtered? tt.count_filtered:tt.count;
      var len = tt.len
      for(var i = 0; i < len; ++i) {
        var base_time = this.MAX_UNITS * i + time
        var c = count[base_time];
        if(c) {
          var sp = this.sprites[c]
          ctx.drawImage(
            sp,
            x[i] - (sp.width>> 1),
            y[i] - (sp.height>>1))
        }
      }
    }

    if(this.render_options.post_process) {
      this._do_post_process(origin);
    }


  },

  tile: function(sql, callback) {
    var base_url = 'http://osm2.cartodb.com/'
    $.getJSON(base_url + "api/v2/sql?q=" + encodeURIComponent(sql), function (data) {
      callback(data);
    });
  },

  pre_cache_data: function(rows, coord, zoom) {
    var row;
    var count;
    var xcoords;
    var ycoords;
    var values;
    var key;

    x = new Int32Array(rows.length);
    y = new Int32Array(rows.length);
    speeds = new Uint8Array(rows.length * this.MAX_UNITS);// 256 months
    count = new Uint8Array(rows.length * this.MAX_UNITS);// 256 monthsrr
    count_filtered = new Uint8Array(rows.length * this.MAX_UNITS);// 256 monthsrr

    // base tile x, y
    var total_pixels = 256 << zoom;
    var max_val = 0;

    for (var i in rows) {
      row = rows[i];
      pixels = meterToPixels(row.x, row.y, zoom); 
      key = '' + (pixels[0] >> 0) + "_" + ((total_pixels - pixels[1])>>0)
      x[i] = pixels[0] >> 0;
      y[i] = (total_pixels - pixels[1])>>0;
      var base_idx = i * this.MAX_UNITS;
      //def[row.sd[0]] = row.se[0];
      for (var j = 0; j < row.dates.length; ++j) {
        //var dir = row.heads[j] + 90;
        //var s = row.speeds[j]
        //dx[base_idx + row.dates[j]] = Math.cos(dir*Math.PI/180);
        //dy[base_idx + row.dates[j]] = Math.sin(dir*Math.PI/180);
        //speeds[base_idx + row.dates[j]] = row.speeds[j];

        count_filtered[base_idx + row.dates[j]] =   
        count[base_idx + row.dates[j]] = Math.min(6, Math.ceil(row.vals[j]/10)) >> 0 ;
      }

      var passes = 2;
      while(passes--) {
        for (var j = 1; j < this.MAX_UNITS; ++j) {
          count_filtered[base_idx + j] += count_filtered[base_idx + j - 1]/2.0
        }
      }
        for (var j = 1; j < this.MAX_UNITS; ++j) {
          count_filtered[base_idx + j] = Math.min(6, count_filtered[base_idx + j]) >> 0 ;
        }
    }

    //this.force_keys = Object.keys(this.force_map);

    return {
      count: count,
      count_filtered: count_filtered,
      x: x,
      y: y,
      len: rows.length
      /*length: rows.length,
      xcoords: xcoords,
      ycoords: ycoords,
      speeds: speeds,
      heads: heads,
      size: 1 << (this.resolution * 2)
      */
    };
  },

  getProbsData: function(coord, zoom) {
    var self = this;
    sql = "WITH hgrid AS ( " +
    "    SELECT CDB_RectangleGrid( " +
    "       CDB_XYZ_Extent({0}, {1}, {2}), ".format(coord.x, coord.y, zoom) +
    "       CDB_XYZ_Resolution({0}) * {1}, ".format(zoom, this.options.resolution) +
    "       CDB_XYZ_Resolution({0}) * {1} ".format(zoom, this.options.resolution) +
    "    ) as cell " +
    " ) " +
    " SELECT  " +
    "    x, y, array_agg(c) vals, array_agg(d) dates " +
    " FROM ( " +
    "    SELECT " +
    "      round(CAST (st_xmax(hgrid.cell) AS numeric),4) x, round(CAST (st_ymax(hgrid.cell) AS numeric),4) y, " +
    "      {0} c, floor((date_part('EPOCH',{1})::int - {2})/{3}) d ".format(this.options.countby, this.options.column, this.options.start_date, this.options.step) +
    "    FROM " +
    "        hgrid, {0} i ".format(this.options.table) +
    "    WHERE " +
    "        i.the_geom_webmercator && CDB_XYZ_Extent({0}, {1}, {2}) ".format(coord.x, coord.y, zoom) +
    "        AND  ST_Intersects(i.the_geom_webmercator, hgrid.cell) " +
    "    GROUP BY " +
    "        hgrid.cell, floor((date_part('EPOCH',{0})::int - {1})/{2})".format(this.options.column, this.options.start_date, this.options.step) +
    " ) f GROUP BY x, y";

    this.tile(sql, function (data) {
      var time_data = self.pre_cache_data(data.rows, coord, zoom);
      self._tileLoaded(coord, time_data);
    });
  }

});

