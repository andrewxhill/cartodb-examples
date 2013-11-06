## CartoDB Examples

Contact [@andrewxhill](http://twitter.com/andrewxhill)

#### CartoDB maps with slide layout

These are maps I created to highlight the PLUTO data shortly after its release by the NYC government. It ended up being the first of my experiments to get a ton of press: [Gizmodo](http://gizmodo.com/see-nyc-from-a-new-angle-with-these-awesomely-nerdy-map-1093545954), [Visual.ly Blog](http://blog.visual.ly/visualizing-nycs-mappluto-database/), [AnimalNewYork](http://animalnewyork.com/2013/this-nyc-open-data-map-is-mind-bogglingly-comprehensive/), [Gothamist](http://gothamist.com/2013/08/10/geek_out_with_awesome_digital_maps.php), [Wired Maps Lab](http://www.wired.com/wiredscience/2013/08/nyc-pluto-data-map-party/), [Curbed](http://ny.curbed.com/archives/2013/08/09/boring_new_york_city_tax_data_makes_for_nonboring_maps.php), [Brokelyn](http://brokelyn.com/new-project-takes-boring-tax-data-and-turns-it-into-cool-maps-about-nyc/), and [Atlantic Cities](http://www.theatlanticcities.com/technology/2013/08/visual-proof-geographic-data-really-should-be-free/6529/)

 - [demo](http://andrewxhill.github.io/cartodb-examples/scroll-story/pluto/index.html)

#### Scrolling stories with CartoDB templates and multiple maps

A summary of work I did at the NYPL historical map data hackathon. I just used a scrolling story layout to talk about the maps I created over an afternoon.

 - [demo](http://andrewxhill.github.io/cartodb-examples/scroll-story/basic/index.html)
 - Yea! This got a little love from [Wired](http://www.wired.com/wiredscience/2013/10/phone-map-game-new-york-city/

#### Sun position plus street orientation

Demo I put together of the VECNIK vector rendering with current sunposition to find streets getting a lot of sun exposure

 - [demo](http://andrewxhill.github.io/cartodb-examples/manhattanhenge/today.html)

or taking a look at places where Manhattanhenge happens for any day of the year,

 - [demo](http://andrewxhill.github.io/cartodb-examples/manhattanhenge/year.html)

see a couple of other cities,

 - [demo](http://andrewxhill.github.io/cartodb-examples/manhattanhenge/index.html)

This was built into a full [fledged project](http://nychenge.com) that was run by [WNYC](http://www.wnyc.org/articles/wnyc-news/2013/jul/12/yes-manhattanhenge-also-park-slopehenge/)

#### Share your private maps

For when you have collaborators that you trust, a lot, but don't trust them enough not to mess up tables in your CartoDB account. Using this page, you can give them your account name, api_key (and trust them not to share it or leave it laying around!), table and they can view the maps you made. I'm improving the example to add support for the basemaps you select, infowindows, etc., but it will take a couple of weeks to update.

 - [demo](http://andrewxhill.github.io/cartodb-examples/private-maps/index.html)

#### Two maps, one center

This is a really quick mod of the CartoDB double map template. In the [orignal template](http://cartodb.github.io/cartodb-publishing-templates/doublemap/), both maps have the same center, and moving one map moves the other. A question on our forum from [Michael Keller](https://twitter.com/mhkeller) prompted me to make this version, where there is only a single center, so one map bleeds into the other. Hacky hacky

 - [demo](http://andrewxhill.github.io/cartodb-examples/double-map-alt/index.html)

#### Smart markers

Often times users will want to create a marker layer where the markers come from CartoDB. If you have a large dataset, this can get annoying, dealing with overlaps and not loading too much data at once. In this example, I create a leaflet marker layer limited to the current zoom and bounding box. Within the view, I limit it to one marker per ever 40px square. With every pan and zoom I query new points to fill the space. 

 - [demo](http://andrewxhill.github.io/cartodb-examples/smart-markers/index.html)

#### Writable Polygon

This example uses PostgreSQL to turn CartoDB into a form submit endpoint without any proxy layer.

 - [code](http://github.com/andrewxhill/cartodb-examples/blob/master/writable)
 - [demo](http://andrewxhill.github.io/cartodb-examples/writable/index.html)

#### Changing polygon intensity over time [D3]

This example uses the CartoDB SQL API and D3 to show a changing intensity in state polygons over time.

 - [code](http://github.com/andrewxhill/cartodb-examples/blob/master/intensity-time)
 - [demo](http://andrewxhill.github.io/cartodb-examples/intensity-time/index.html)

#### Experiments with Videos, CartoDB, and Leaflet

This example makes a video's playing timestamp into a control for a map

 - [demo](http://andrewxhill.github.io/cartodb-examples/videomap/html5/index.html)

Quick test to create a Leaflet plugin for a VideoOVerlay object

with canvas,

 - [demo](http://andrewxhill.github.io/cartodb-examples/videomap/inset/index.html)

or with Vimeo,

 - [demo](http://andrewxhill.github.io/cartodb-examples/videomap/video-inset/index.html)



