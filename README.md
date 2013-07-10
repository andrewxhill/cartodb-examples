## CartoDB Examples

Contact [@andrewxhill](http://twitter.com/andrewxhill)

#### Scrolling stories with CartoDB templates and multiple maps

A summary of work I did at the NYPL historical map data hackathon. I just used a scrolling story layout to talk about the maps I created over an afternoon.

 - [demo](http://andrewxhill.github.io/cartodb-examples/scroll-story/basic/index.html)

#### Sun position plus street orientation

Demo I put together of the VECNIK vector rendering with current sunposition to find streets getting a lot of sun exposure

 - [demo](http://andrewxhill.github.io/cartodb-examples/manhattanhenge/today.html)

or taking a look at places where Manhattanhenge happens for any day of the year,

 - [demo](http://andrewxhill.github.io/cartodb-examples/manhattanhenge/year.html)

see a couple of other cities,

 - [demo](http://andrewxhill.github.io/cartodb-examples/manhattanhenge/index.html)

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



