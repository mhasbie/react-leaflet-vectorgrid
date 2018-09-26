# react-leaflet-vectorgrid

[![travis build](https://img.shields.io/travis/mhasbie/react-leaflet-vectorgrid.svg?style=plastic)](https://travis-ci.org/mhasbie/react-leaflet-vectorgrid)
[![version](https://img.shields.io/npm/v/react-leaflet-vectorgrid.svg?style=plastic)](http://npm.im/react-leaflet-vectorgrid)
[![MIT License](https://img.shields.io/npm/l/react-leaflet-vectorgrid.svg?style=plastic)](http://opensource.org/licenses/MIT)
[![dependencies](https://img.shields.io/david/mhasbie/react-leaflet-vectorgrid.svg?style=plastic)](https://david-dm.org/mhasbie/react-leaflet-vectorgrid)
[![peer dependencies](https://img.shields.io/david/peer/mhasbie/react-leaflet-vectorgrid.svg?style=plastic)](https://david-dm.org/mhasbie/react-leaflet-vectorgrid?type=peer)
[![downloads](https://img.shields.io/npm/dt/react-leaflet-vectorgrid.svg?style=plastic)](http://npm-stat.com/charts.html?package=react-leaflet-vectorgrid&from=2018-01-01)
[![issues](https://img.shields.io/github/issues/mhasbie/react-leaflet-vectorgrid.svg?style=plastic)](https://github.com/mhasbie/react-leaflet-vectorgrid/issues)

React wrapper of [Leaflet.VectorGrid](https://github.com/Leaflet/Leaflet.VectorGrid)
for [react-leaflet](https://github.com/PaulLeCam/react-leaflet).

Display gridded vector data (sliced [GeoJSON](http://geojson.org/), [TopoJSON](https://github.com/mbostock/topojson/wiki) or [protobuf vector tiles](https://github.com/mapbox/vector-tile-spec)) in [Leaflet](http://www.leafletjs.com) 1.0.0

*Tested with Leaflet 1.3.4 and React-Leaflet 1.9.1, React-Leaflet 2.0.1*

## Demos

| Version	| Demo	| Description			|
| ---		| ---	| ---					|
| react-leaflet@1.9.1| [`JSFiddle`](https://jsfiddle.net/m_hasbie/rnx44us3/), [`CodePen`](https://codepen.io/m_hasbie/full/jzpbwj/) | Sliced GeoJSON |
| react-leaflet@2.0.1| [`CodePen`](https://codepen.io/m_hasbie/full/jvgyPq/) | Sliced GeoJSON |



## Installation

### Install via NPM

```bash
npm install --save react-leaflet-vectorgrid
```

`react-leaflet-vectorgrid` requires `lodash` as [`peerDependency`](https://docs.npmjs.com/files/package.json#peerdependencies)

(React, PropTypes, Leaflet, react-leaflet also should be installed)
```bash
npm install --save lodash
```

## Usage example

### Slicer

```javascript
import { Map, TileLayer } from 'react-leaflet';
import VectorGrid from 'react-leaflet-vectorgrid';

const options = {
	type: 'slicer',
	data: {geojson},
	idField: 'OBJECTID',
	tooltip: 'NAME',
	popup: (layer) => `<div>${layer.properties.NAME}</div>`,
	style: {
		weight: 0.5,
		opacity: 1,
		color: '#ccc',
		fillColor: '#390870',
		fillOpacity: 0.6,
		fill: true,
		stroke: true
	},
	hoverStyle: {
		fillColor: '#390870',
		fillOpacity: 1
	},
	activeStyle: {
		fillColor: '#390870',
		fillOpacity: 1
	},
	zIndex: 401
};

<Map center={[2.935403, 101.448205]} zoom={4}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  />

  <VectorGrid {...options} onClick={this.onClick} />
</Map>
```

#### Options

Option          | Type      | Default | Description
--------------- | --------- | ------- | -------------
`data`          | `Object`  | `{}`    | Required when using type `slicer`. A valid [GeoJSON FeatureCollection object](http://geojson.org/geojson-spec.html).
`type`          | `String`  | `'slicer'`| Decides between using [VectoGrid.Slicer](http://leaflet.github.io/Leaflet.VectorGrid/vectorgrid-api-docs.html#vectorgrid-slicer) and [VectorGrid.Protobuf](http://leaflet.github.io/Leaflet.VectorGrid/vectorgrid-api-docs.html#vectorgrid-protobuf). Available options: `slicer`, `protobuf`.
`idField`       | `String`   | `''`   | A unique identifier field in the vector feature.
`tooltip`       | `String` | `function`     | `undefined`   | Show tooltip on vector features. Set to feature properties name to use that properties value as tooltip. Or pass a function that will return a string. e.g. `function(feature) { return feature.properties.NAME; }`
`popup`   | `Function`   | `undefined`    | Similar to `tooltip`, this props will be passed to leaflet `bindPopup` function to create popup for vector features.
`style`   | `Object`  	 | `undefined`    | Apply default style to all vector features. Use this props when not using `vectorTileLayerStyles`
`hoverStyle`   | `Object`  	 | `undefined`    | Style to apply to features on `mouseover` event.
`activeStyle`   | `Object`  	 | `undefined`    | Style to apply to features on `click` event. Can be use to show user selection when feature is clicked. Double click to clear selection.
`zIndex`   | `Integer`   | `undefined`    | Sets the `VectorGrid` z-index.
`interactive`   | `Boolean`   | `true`    | Whether `VectorGrid` fires `Interactive` Layer events.
`onClick` |  `Function`     | `undefined`    | Listens to `VectorGrid` `click` events. `interactive` option must be set to `true`.
`onMouseover` |  `Function`     | `undefined`    | Listens to `VectorGrid` `mouseover` events. `interactive` option must be set to `true`.
`onMouseout` |  `Function`     | `undefined`    | Listens to `VectorGrid` `mouseout` events. `interactive` option must be set to `true`.
`onDblclick` |  `Function`     | `undefined`    | Listens to `VectorGrid` `dblclick` events. `interactive` option must be set to `true`.

### Protobuf

```javascript
import { Map, TileLayer } from 'react-leaflet';
import VectorGrid from 'react-leaflet-vectorgrid';

const options = {
	type: 'protobuf',
	url: 'https://free-{s}.tilehosting.com/data/v3/{z}/{x}/{y}.pbf.pict?key={key}'
	vectorTileLayerStyles: { ... },
    subdomains: 'abcd',
    key: 'abcdefghi01234567890'
};

<Map center={[2.935403, 101.448205]} zoom={4}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  />

  <VectorGrid {...options} />
</Map>
```

#### Options

Option          | Type      | Default | Description
--------------- | --------- | ------- | -------------
`type`          | `String`  | `'slicer'`| Decides between using [VectoGrid.Slicer](http://leaflet.github.io/Leaflet.VectorGrid/vectorgrid-api-docs.html#vectorgrid-slicer) and [VectorGrid.Protobuf](http://leaflet.github.io/Leaflet.VectorGrid/vectorgrid-api-docs.html#vectorgrid-protobuf). Available options: `slicer`, `protobuf`.
`url`           | `String`  | `''`    | Required when using type `protobuf`. Pass a url template that points to vector tiles (usually `.pbf` or `.mvt`).
`subdomains`    | `String`  | `'abc'` | Akin to the `subdomains` option to `L.TileLayer`.
`key`  			| `String`  | `''`    | Tile server access key.
`token`  		| `String`  | `''`    | Tile server access token.
`vectorTileLayerStyles`   | `Object`  	 | `undefined`    | A data structure holding initial symbolizer definitions for the vector features. Refer [Leaflet.VectorGrid doc](http://leaflet.github.io/Leaflet.VectorGrid/vectorgrid-api-docs.html#styling-vectorgrids) for more info.

### Usage with React-Leaflet v2

This is compatible with version 2 of React-Leaflet, but you have to wrap the `VectorGrid` using the [`withLeaflet` higher-order component](https://react-leaflet.js.org/docs/en/context.html) to give it access to the new context mechanism. For example:

```javascript
import { Map, withLeaflet } from 'react-leaflet';
import VectorGrid from 'react-leaflet-vectorgrid';

const WrappedVectorGrid = withLeaflet(VectorGrid);

// Use <WrappedVectorGrid> where you would have used <VectorGrid>.
```

# Credits
Credits goes to all the [contributors](https://github.com/Leaflet/Leaflet.VectorGrid/graphs/contributors) for the original work.

# License

MIT License
