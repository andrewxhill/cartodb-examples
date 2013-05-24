L.CanvasLayer = L.Class.extend({

  includes: [L.Mixin.Events, L.Mixin.TileLoader],

  options: {
      minZoom: 0,
      maxZoom: 28,
      tileSize: 256,
      subdomains: 'abc',
      errorTileUrl: '',
      attribution: '',
      zoomOffset: 0,
      opacity: 1,
      unloadInvisibleTiles: L.Browser.mobile,
      updateWhenIdle: L.Browser.mobile
  },

  initialize: function (options) { 
    var self = this;
    this.project = this._project.bind(this);
    L.Util.setOptions(this, options);
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
  },


  onAdd: function (map) {
    this._map = map;

    this._backCanvas = document.createElement('canvas');
    this._canvas = document.createElement('canvas');
    this._staticPane = map._createPane('leaflet-tile-pane', map._container);

    this._backCanvas.style.position = this._canvas.style.position = 'absolute';
    this._staticPane.appendChild(this._backCanvas);
    this._staticPane.appendChild(this._canvas);

    this._backCtx = this._backCanvas.getContext('2d');
    this._ctx = this._canvas.getContext('2d');

    map.on({
        'viewreset': this._reset,
        'move': this._update
    }, this);

    //if (map.options.zoomAnimation && L.Browser.any3d) {
      //map.on('zoomanim', this._animateZoom, this);
    //}
    //
    this._initTileLoader();

    this._reset();
  },

  draw: function() {
    return this._reset();
  },

  onRemove: function (map) {
    map._container.removeChild(this._staticPane);
    map.off({
        'viewreset': this._reset,
        'move': this._update
    }, this);

    //if (map.options.zoomAnimation) {
      //map.off('zoomanim', this._animateZoom, this);
    //}
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  setOpacity: function (opacity) {
    this.options.opacity = opacity;
    this._updateOpacity();
    return this;
  },

  // TODO remove bringToFront/bringToBack duplication from TileLayer/Path
  bringToFront: function () {
    return this;
  },

  bringToBack: function () {
    return this;
  },

  _reset: function () {
    var size = this._map.getSize()
    this._backCanvas.width = this._canvas.width = size.x;
    this._backCanvas.height = this._canvas.height = size.y;
  },


  _project: function(x) {
    var point = this._map.latLngToLayerPoint(new L.LatLng(x[0], x[1]));
    return [point.x, point.y];
  },

  _updateOpacity: function () { },

  _update: function() {
    //requestAnimationFrame(this._render);
  },

  _render: function() {
  }

});
