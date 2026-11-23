react-leaflet-vectorgrid Changelog
=========================

## 3.0.0 (2026-11-23)

* Add React-Leaflet v3, v4, and v5 compatibility using hooks and `MapContainer` (#16).
* Add React 17, 18, and 19 support (#16).
* Add a configurable slicer `tolerance` option with a default of `0.000001` to preserve detailed polyline and polygon rendering (#11).
* Prevent unnecessary VectorGrid recreation and redraws by comparing layer configuration separately from event callback props (#15).
* Improve map dragging and non-interactive behavior by disabling pointer events on VectorGrid features when `interactive` is `false` (#13).
* Report a clear initialization error when the Leaflet VectorGrid protobuf plugin is not registered (#14).
* Update Leaflet to 1.9.4 and modernize the build and test tooling.
* Replace legacy Enzyme tests with React Testing Library coverage.

## 2.2.0 (2019-02-01)

* Update dependencies
* Update README
* Add example
* Add unit test
* Fix bugs
