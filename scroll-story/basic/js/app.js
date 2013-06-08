

function isScrolledIntoView(elem)
{
    var focusPixel = 240;
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();
    // console.log(elemTop, docViewTop)
    // if((elemTop >= docViewTop) && (elemTop -docViewTop <= focusPixel)){
    //   console.log(docViewTop, viz.currentlayer)
    // }
    return ((elemTop >= docViewTop) && (elemTop -docViewTop <= focusPixel));
    // return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

var storyelements = new Array();
$('.story_element').each(function(e, d){
  storyelements.push(d)
});

$('.sidepanel').scroll(function(){
  for (i in storyelements){
    if (isScrolledIntoView(storyelements[i])){
      if (i != currentViz) {
        updateViz(i);
      }
    }
  }
})

function resetMap(){
    for(i in viz.layers){
      if($.inArray(i ,viz.currentlayer) != -1){
          viz.layers[i].show();
        // }
      } else {
        viz.layers[i].hide()
        viz.layers[i].hide();
        
      }
    }
}

var mapLayers = [];
var position = new L.LatLng(40.716086427192394, -73.99330615997314);
var zoom = 15; 
var map = new L.Map('map').setView(position, zoom);


cartodb.createLayer(map, {
  type: 'cartodb',
  options: {
      table_name: 'building_comments_1854',
      user_name: 'osm2',
      interaction: false,
      query: "SELECT the_geom_webmercator FROM buildings_1854",
      interaction: false,
      tile_style: "#{{table_name}}{ polygon-fill:white;polygon-opacity: 0.2;line-width: 0;}"
      }
  })
 .on('done', function(layer) {
    map.setView(position, zoom)
      .addLayer(layer);
    layer.hide();
    mapLayers.push(layer)

    cartodb.createLayer(map, 'http://osm2.cartodb.com/api/v1/viz/building_comments_1854/viz.json', {
        query: "SELECT *, 1 as layer FROM buildings_1854 WHERE cartodb_id IN (SELECT building_id from directory_1854 WHERE building_id IS NOT NULL) AND  cartodb_id IN (SELECT building_id from directory_1839 WHERE building_id IS NOT NULL) union all SELECT *, 2 as layer FROM buildings_1854 WHERE cartodb_id IN (SELECT building_id from directory_1854 WHERE building_id IS NOT NULL) AND cartodb_id NOT IN (SELECT building_id from directory_1839 WHERE building_id IS NOT NULL) UNION ALL SELECT *, 3 as layer FROM buildings_1854 WHERE cartodb_id IN (SELECT building_id from directory_1839 WHERE building_id IS NOT NULL) AND cartodb_id NOT IN (SELECT building_id from directory_1854 WHERE building_id IS NOT NULL) UNION ALL SELECT *, 4 as layer FROM buildings_1854 WHERE cartodb_id NOT IN (SELECT building_id from directory_1854 WHERE building_id IS NOT NULL) AND  cartodb_id NOT IN (SELECT building_id from directory_1839 WHERE building_id IS NOT NULL)",
        interaction: false,
        tile_style: "#{{table_name}}{polygon-fill: white;  polygon-opacity: 0.2;  line-width: 0;  line-color: #FFF;  line-opacity: 1;  [layer = 1] {   polygon-fill: violet;  polygon-opacity: 1;  }  [layer = 2] {   polygon-fill: red;  polygon-opacity: 0.7;  }  [layer = 3] {   polygon-fill: yellow;  polygon-opacity: 0.7;  }}"})
     .on('done', function(layer2) {
      map.addLayer(layer2);
      mapLayers.push(layer2);
updateViz(currentViz);
    layer.hide();
    }).on('error', function() {
      cartodb.log.log("some error occurred");
    });
  }).on('error', function() {
    cartodb.log.log("some error occurred");
  });

var viz = {
  currentlayer: null,
  0: function(){
    var id = 'population';

    var position = new L.LatLng(40.716086427192394, -73.99330615997314);
    var zoom = 19; 
    map.setView(position, zoom);
    setTimeout(function(){
      mapLayers[0].hide();
      mapLayers[1].setOptions({
            query: "SELECT *, 1 as layer FROM buildings_1854 WHERE cartodb_id IN (SELECT building_id from directory_1854 WHERE building_id IS NOT NULL) AND  cartodb_id IN (SELECT building_id from directory_1839 WHERE building_id IS NOT NULL) union all SELECT *, 2 as layer FROM buildings_1854 WHERE cartodb_id IN (SELECT building_id from directory_1854 WHERE building_id IS NOT NULL) AND cartodb_id NOT IN (SELECT building_id from directory_1839 WHERE building_id IS NOT NULL) UNION ALL SELECT *, 3 as layer FROM buildings_1854 WHERE cartodb_id IN (SELECT building_id from directory_1839 WHERE building_id IS NOT NULL) AND cartodb_id NOT IN (SELECT building_id from directory_1854 WHERE building_id IS NOT NULL) UNION ALL SELECT *, 4 as layer FROM buildings_1854 WHERE cartodb_id NOT IN (SELECT building_id from directory_1854 WHERE building_id IS NOT NULL) AND  cartodb_id NOT IN (SELECT building_id from directory_1839 WHERE building_id IS NOT NULL)",
            interaction: false,
            tile_style: "#{{table_name}}{polygon-fill: white;  polygon-opacity: 0.2;  line-width: 0;  line-color: #FFF;  line-opacity: 1;  [layer = 1] {   polygon-fill: violet;  polygon-opacity: 1;  }  [layer = 2] {   polygon-fill: red;  polygon-opacity: 0.7;  }  [layer = 3] {   polygon-fill: yellow;  polygon-opacity: 0.7;  }}"
      });
    }, 500)
  },
  1: function(){
    var id = 'building_type';

    var position = new L.LatLng(40.7182, -73.9952);
    var zoom = 15; 
    map.setView(position, zoom);
    setTimeout(function(){
      mapLayers[0].hide();
      mapLayers[1].setOptions({
            query: "SELECT * FROM buildings_1854",
            interaction: false,
            tile_style: "#{{table_name}}{  polygon-fill: white;  polygon-opacity: 0.2;  line-width: 0;  line-color: #FFF;  line-opacity: 0.6;  [type='shingle roof']{   polygon-fill: #fc0b82;    polygon-opacity: 0.7;  }  [type='slate or metal']{  polygon-fill: #4a8dcb;    polygon-opacity: 0.7;  }  [type='wood or framed'], [type='framed dwelling']{  polygon-fill: #f2b357;    polygon-opacity: 0.7;  }  [type='brick or stone']{  polygon-fill: #92d42d;    polygon-opacity: 0.7;  }  [hazardous=true]{   line-width: 0.4;    line-color: #FF0000;  }}"
      });
    }, 500)
  },
  2: function(){
    var id = 'building_type';
    viz.currentlayer = [];
    viz.currentlayer.push(id);
    // viz.resetmap();

    var position = new L.LatLng(40.708694, -74.000833);
    var zoom = 22; 
    map.setView(position, zoom);
    setTimeout(function(){

      mapLayers[0].hide();
      mapLayers[1].setOptions({
            query: "SELECT * FROM buildings_1854",
            interaction: false,
            tile_style: "#{{table_name}}{  polygon-fill: white;  polygon-opacity: 0.2;  line-width: 0;  line-color: #FFF;  line-opacity: 0.6;  [type='shingle roof']{   polygon-fill: #fc0b82;    polygon-opacity: 0.7;  }  [type='slate or metal']{  polygon-fill: #4a8dcb;    polygon-opacity: 0.7;  }  [type='wood or framed'], [type='framed dwelling']{  polygon-fill: #f2b357;    polygon-opacity: 0.7;  }  [type='brick or stone']{  polygon-fill: #92d42d;    polygon-opacity: 0.7;  }  [hazardous=true]{   line-width: 0.4;    line-color: #FF0000;  }}"
          });
    },500);
  },
  3: function(){
    var id = 'professions';
    var idy = 'basemap';

    var position = new L.LatLng(40.7182, -73.9952);
    var zoom = 14; 
    map.setView(position, zoom);
    setTimeout(function(){
      mapLayers[0].show();
      mapLayers[1].setOptions({
                  query: "WITH nms AS (SELECT name FROM (SELECT count(distinct directory) d, count(distinct building_id) b, name, profession FROM directory_names WHERE profession != '' group by name, profession) a WHERE d = 2 AND b = 2), f AS (SELECT name_id, building_id, lower(trim(both ' ' from profession)) as profession FROM directory_1854 WHERE name_id in (SELECT name FROM nms)) SELECT ST_Transform((SELECT ST_Centroid(the_geom) FROM buildings_1854 WHERE cartodb_id = f.building_id),3857) as the_geom_webmercator, f.name_id, f.profession FROM f",
                  interaction: false,
                  tile_style: "Map{buffer-size: 150;} #{{table_name}}{text-name: [profession];text-face-name: 'DejaVu Sans Book'; text-size: 6; text-fill: #8cc640; text-allow-overlap: false; text-halo-fill: #FFF; text-halo-radius: 0.3; [zoom>13]{text-size: 8;[zoom>14]{text-size: 10;[zoom>15]{text-size: 14;}}}}"
              });
    },500);
  },
  4: function(){

    var idx = 'relocation';
    var idy = 'basemap3';

    var position = new L.LatLng(40.7182, -73.9952);
    var zoom = 14; 
    map.setView(position, zoom);
    setTimeout(function(){
      mapLayers[0].show();
      mapLayers[1].setOptions({
                query: "WITH  nms AS (SELECT name FROM (SELECT count(distinct directory) d, count(distinct building_id) b, name, profession FROM directory_names WHERE profession != '' group by name, profession) a WHERE d = 2 AND b = 2), f AS (SELECT name_id, building_id, lower(trim(both ' ' from occupation)) as profession FROM directory_1839 WHERE name_id in (SELECT name FROM nms)), m AS (SELECT name_id, building_id, lower(trim(both ' ' from profession)) as profession FROM directory_1854 WHERE name_id in (SELECT name FROM nms)), t AS (SELECT (SELECT st_centroid(the_geom_webmercator) FROM buildings_1854 WHERE cartodb_id = f.building_id) the_geom_webmercator, 'source' as layer, f.name_id, f.profession FROM f UNION ALL SELECT (SELECT st_centroid(the_geom_webmercator) FROM buildings_1854 WHERE cartodb_id = m.building_id) the_geom_webmercator, 'dest' as layer, m.name_id, m.profession FROM m) SELECT * FROM t UNION ALL SELECT ST_MakeLine(the_geom_webmercator) the_geom_webmercator, 'line' as layer, name_id, profession FROM t GROUP BY name_id, profession",
                tile_style: "#{{table_name}}{[layer='line'] {line-color: white; line-width: 0.8; line-opacity: 0.3;}[layer!='line']::top {marker-fill:blue;marker-width: 4; marker-allow-overlap: true;marker-opacity: 0.7; line-opacity:1; line-width: 0; line-color: #FFFFFF; [layer = 'source']{ marker-opacity: 0.7; marker-fill:red;}}}"
              })
    },500);
  },
  5: function(){

    var idx = 'stokel';
    var idy = 'basemapy';

      var position = new L.LatLng(40.71, -74.005);
      var zoom = 15; 
    map.setView(position, zoom);
    setTimeout(function(){
      mapLayers[0].show();
      mapLayers[1].setOptions({
                  interaction: false,
                  query: "WITH  nms AS (SELECT name FROM (SELECT count(distinct directory) d, count(distinct building_id) b, name, profession FROM directory_names WHERE profession != '' group by name, profession) a WHERE d = 2 AND b = 2), f AS (SELECT name_id, building_id, lower(trim(both ' ' from occupation)) as profession FROM directory_1839 WHERE name_id = 'stokell john' AND name_id in (SELECT name FROM nms)), m AS (SELECT name_id, building_id, lower(trim(both ' ' from profession)) as profession FROM directory_1854 WHERE name_id = 'stokell john' AND name_id in (SELECT name FROM nms)), t AS (SELECT (SELECT st_centroid(the_geom_webmercator) FROM buildings_1854 WHERE cartodb_id = f.building_id) the_geom_webmercator, 'source' as layer, f.name_id, f.profession FROM f UNION ALL SELECT (SELECT st_centroid(the_geom_webmercator) FROM buildings_1854 WHERE cartodb_id = m.building_id) the_geom_webmercator, 'dest' as layer, m.name_id, m.profession FROM m) SELECT * FROM t UNION ALL SELECT ST_MakeLine(the_geom_webmercator) the_geom_webmercator, 'line' as layer, name_id, profession FROM t GROUP BY name_id, profession",
                  tile_style: "#{{table_name}}{[layer='line'] {line-color: white; line-width: 0.8; line-opacity: 0.3;}[layer!='line']::top {marker-fill:blue;marker-width: 10;marker-allow-overlap: true;marker-opacity: 0.7; line-opacity:1; line-width: 0; line-color: #FFFFFF; [layer = 'source']{ marker-opacity: 0.7; marker-fill:red;}}}"
                })
    },500);
  },
  6: function(){
    var id = 'hazardous';
      var position = new L.LatLng(40.7352, -73.9952);
      var zoom = 14; 
    map.setView(position, zoom);
    setTimeout(function(){
        mapLayers[0].hide();
        mapLayers[1].setOptions({
                query: "SELECT * FROM buildings_1854",
                interaction: false,
                tile_style: "#{{table_name}}{polygon-fill:white; polygon-opacity: 0.2; line-opacity:1; line-width: 0; line-color: #FFFFFF; [hazardous = true]{ polygon-opacity: 0.7; polygon-fill:red;}}"
            })
      },500);
  }
}


    $('#zoom_to_2').click(function(){
      var position = new L.LatLng(40.708694, -74.000833);
      var zoom = 22; 
      map.setView(position, zoom)
    })
    $('#zoom_to_trinity').click(function(){
      var position = new L.LatLng(40.7079, -74.0120);
      var zoom = 20; 
      map.setView(position, zoom)
    })

// function setLayer(){
//   viz[currentViz]();
// }

function updateViz(layer){
  if (layer in viz){
    currentViz = layer;
    clearTimeout($.data(this, "scrollTimer"));
    $.data(this, "scrollTimer", setTimeout(viz[currentViz], 350));

    // viz[layer]();
  }
}

var currentViz = 0;