import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer } from 'react-leaflet';

const usageExample = `import { MapContainer, TileLayer } from 'react-leaflet';
import VectorGrid from 'react-leaflet-vectorgrid';

const options = {
  type: 'slicer',
  data: geojson,
  idField: 'name',
  tooltip: 'name',
  style: {
    weight: 0.5,
    color: '#390870',
    fillOpacity: 0.6
  }
};

<MapContainer center={[20, 0]} zoom={2}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="&copy; OpenStreetMap contributors"
  />
  <VectorGrid {...options} />
</MapContainer>`;

function App() {
	const [VectorGrid, setVectorGrid] = useState(null);
	const [vectorGridLoadError, setVectorGridLoadError] = useState('');
	const [fillColor, setFillColor] = useState('#390870');
	const [fillOpacity, setFillOpacity] = useState(0.6);
	const [showTooltips, setShowTooltips] = useState(true);
	const [selectedFeature, setSelectedFeature] = useState('Click a country to see its name.');

	useEffect(() => {
		import('react-leaflet-vectorgrid')
			.then((module) => setVectorGrid(() => module.default))
			.catch((error) => {
				console.error('Failed to load react-leaflet-vectorgrid.', error);
				setVectorGridLoadError(error.message || String(error));
			});
	}, []);

	const resetOptions = () => {
		setFillColor('#390870');
		setFillOpacity(0.6);
		setShowTooltips(true);
		setSelectedFeature('Click a country to see its name.');
	};

	return (
		<>
			<div className="row d-flex">
				<div className="col-md-8 mb-4">
					<div className="card h-100">
						<div className="card-body">
							{vectorGridLoadError && (
								<div className="alert alert-warning" role="alert">
									Unable to load the VectorGrid component. Check that the package version in the import map is published and available. {vectorGridLoadError}
								</div>
							)}
							<div className="map-frame">
								<MapContainer center={[20, 0]} zoom={2} minZoom={2} maxZoom={8}>
									<TileLayer
										attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
										url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									/>
									{VectorGrid && <VectorGrid
										type="slicer"
										data={window.data}
										idField="name"
										tooltip={showTooltips ? 'name' : null}
										popup={(layer) => `<strong>${layer.properties.name}</strong>`}
										style={{
											weight: 0.5,
											opacity: 1,
											color: '#ffffff',
											fillColor,
											fillOpacity,
											fill: true,
											stroke: true
										}}
										hoverStyle={{ fillOpacity: 0.9 }}
										activeStyle={{ fillOpacity: 1 }}
										onClick={(event) => {
											const name = event.feature && event.feature.properties
												? event.feature.properties.name
												: 'Unknown feature';
											setSelectedFeature(`Selected: ${name}`);
										}}
									/>}
								</MapContainer>
							</div>
							<p className="mb-0 mt-3" aria-live="polite">{selectedFeature}</p>
						</div>
					</div>
				</div>
				<div className="col-md-4 mb-4">
					<div className="card h-100">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<h5 className="mb-0"><i className="fas fa-cogs"></i> Options</h5>
								<button type="button" className="btn btn-sm btn-outline-info" onClick={resetOptions}>
									<i className="fas fa-undo-alt"></i> Reset
								</button>
							</div>
							<hr />
							<div className="form-group">
								<label htmlFor="fillColor">Fill color</label>
								<input
									className="form-control"
									id="fillColor"
									type="color"
									value={fillColor}
									onChange={(event) => setFillColor(event.target.value)}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="fillOpacity">Fill opacity: {Number(fillOpacity).toFixed(1)}</label>
								<input
									className="form-control"
									id="fillOpacity"
									type="range"
									min="0.1"
									max="1"
									step="0.1"
									value={fillOpacity}
									onChange={(event) => setFillOpacity(Number(event.target.value))}
								/>
							</div>
							<div className="form-group form-check">
								<input
									className="form-check-input"
									id="showTooltips"
									type="checkbox"
									checked={showTooltips}
									onChange={(event) => setShowTooltips(event.target.checked)}
								/>
								<label className="form-check-label" htmlFor="showTooltips">Show country tooltips</label>
							</div>
							<p className="text-muted mb-0">Click a country to select it; hover to preview the highlight style.</p>
						</div>
					</div>
				</div>
			</div>

			<div className="row">
				<div className="col-md-12 mb-4">
					<div className="card">
						<div className="card-body">
							<h4>Demos</h4>
							<hr />
							<section className="mb-4">
								<h5>react-leaflet-v5</h5>
								<iframe
									title="react-leaflet-vectorgrid for react-leaflet v5"
									height="420"
									style={{ width: '100%' }}
									scrolling="no"
									src="https://codepen.io/m_hasbie/embed/GgmMPGx?default-tab=html%2Cresult"
									frameBorder="no"
									loading="lazy"
									allowFullScreen
								/>
							</section>
							<section className="mb-4">
								<h5>react-leaflet-v2</h5>
								<iframe
									title="react-leaflet-vectorgrid for react-leaflet v2"
									height="420"
									style={{ width: '100%' }}
									scrolling="no"
									src="https://codepen.io/m_hasbie/embed/jvgyPq?default-tab=html%2Cresult"
									frameBorder="no"
									loading="lazy"
									allowFullScreen
								/>
							</section>
							<section>
								<h5>react-leaflet-v1</h5>
								<iframe
									title="react-leaflet-vectorgrid for react-leaflet v1"
									height="420"
									style={{ width: '100%' }}
									scrolling="no"
									src="https://codepen.io/m_hasbie/embed/jzpbwj?default-tab=html%2Cresult"
									frameBorder="no"
									loading="lazy"
									allowFullScreen
								/>
							</section>
						</div>
					</div>
				</div>
				<div className="col-md-12 mb-4">
					<div className="card">
						<div className="card-body">
							<h4>Installation</h4>
							<hr />
							<p>Install the package and its React-Leaflet peer dependencies:</p>
							<div className="card bg-dark text-white">
								<div className="card-body">
									<code className="text-white">npm install react-leaflet-vectorgrid leaflet react react-dom react-leaflet</code>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-12 mb-4">
					<div className="card">
						<div className="card-body">
							<h4>Usage</h4>
							<hr />
							<pre className="card bg-dark text-white p-3 mb-0"><code className="text-white">{usageExample}</code></pre>
						</div>
					</div>
				</div>
				<div className="col-md-12 mb-4">
					<div className="card">
						<div className="card-body">
							<h4>Options</h4>
							<hr />
							<div className="table-responsive">
								<table className="table table-hover table-striped table-bordered mb-0">
									<thead className="thead-dark">
										<tr><th>Option</th><th>Type</th><th>Description</th></tr>
									</thead>
									<tbody>
										<tr><td><code>type</code></td><td>string</td><td><code>slicer</code> for GeoJSON data or <code>protobuf</code> for vector tiles.</td></tr>
										<tr><td><code>data</code></td><td>object</td><td>GeoJSON FeatureCollection to slice into vector tiles.</td></tr>
										<tr><td><code>url</code></td><td>string</td><td>Vector tile URL template when using <code>protobuf</code>.</td></tr>
										<tr><td><code>idField</code></td><td>string or function</td><td>Unique feature property used for styling and events.</td></tr>
										<tr><td><code>style</code></td><td>object or function</td><td>Default style for vector features.</td></tr>
										<tr><td><code>tolerance</code></td><td>number</td><td>Slicer simplification tolerance (default <code>0.000001</code>). Lower values retain more GeoJSON/TopoJSON detail.</td></tr>
										<tr><td><code>hoverStyle</code>, <code>activeStyle</code></td><td>object or function</td><td>Styles applied while hovering or after selecting a feature.</td></tr>
										<tr><td><code>tooltip</code>, <code>popup</code></td><td>string or function</td><td>Feature tooltip property or popup content.</td></tr>
										<tr><td><code>onClick</code>, <code>onMouseover</code>, <code>onMouseout</code></td><td>function</td><td>Handlers for interactive vector feature events.</td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

createRoot(document.getElementById('container')).render(<App />);
