import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer } from 'react-leaflet';

const defaultOptions = {
	stroke: '#ffffff',
	fillColor: '#390870',
	weight: 0.5,
	opacity: 1,
	fillOpacity: 0.6,
	hoverFillOpacity: 0.9,
	activeFillOpacity: 1,
	zIndex: 401,
	interactive: true,
	showTooltip: true,
	showPopup: true
};

const countryPopup = (layer) => {
	const properties = layer?.properties || layer?.feature?.properties;
	return `<strong>${properties?.name || 'Unknown feature'}</strong>`;
};

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
	const [options, setOptions] = useState(defaultOptions);
	const [appliedOptions, setAppliedOptions] = useState(defaultOptions);
	const [events, setEvents] = useState([]);

	useEffect(() => {
		import('react-leaflet-vectorgrid')
			.then((module) => setVectorGrid(() => module.default))
			.catch((error) => {
				console.error('Failed to load react-leaflet-vectorgrid.', error);
				setVectorGridLoadError(error.message || String(error));
			});
	}, []);

	const updateOption = (event) => {
		const { name, type, value, checked } = event.target;
		const nextValue = type === 'checkbox'
			? checked
			: type === 'number' || type === 'range'
				? Number(value)
				: value;
		setOptions((current) => ({ ...current, [name]: nextValue }));
	};

	const applyOptions = (event) => {
		event.preventDefault();
		setAppliedOptions({ ...options });
	};

	const resetOptions = () => {
		setOptions(defaultOptions);
		setAppliedOptions(defaultOptions);
		setEvents([]);
	};

	const logEvent = (name, event) => {
		const properties = event.feature?.properties || event.layer?.properties || null;
		setEvents((current) => [{
			time: new Date().toLocaleTimeString(),
			name,
			detail: {
				latlng: event.latlng ? {
					lat: event.latlng.lat,
					lng: event.latlng.lng
				} : undefined,
				properties
			}
		}, ...current]);
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
									{VectorGrid && (
										<VectorGrid
											key={JSON.stringify(appliedOptions)}
											type="slicer"
											data={window.data}
											idField="name"
											zIndex={appliedOptions.zIndex}
											interactive={appliedOptions.interactive}
											tooltip={appliedOptions.showTooltip ? 'name' : null}
											popup={appliedOptions.showPopup ? countryPopup : null}
											style={{
												weight: appliedOptions.weight,
												opacity: appliedOptions.opacity,
												color: appliedOptions.stroke,
												fillColor: appliedOptions.fillColor,
												fillOpacity: appliedOptions.fillOpacity,
												fill: true,
												stroke: true
											}}
											hoverStyle={{ fillOpacity: appliedOptions.hoverFillOpacity }}
											activeStyle={{ fillOpacity: appliedOptions.activeFillOpacity }}
											onMouseover={(event) => logEvent('mouseover', event)}
											onMouseout={(event) => logEvent('mouseout', event)}
											onClick={(event) => logEvent('click', event)}
											onDblclick={(event) => logEvent('dblclick', event)}
											onContextmenu={(event) => logEvent('contextmenu', event)}
										/>
									)}
								</MapContainer>
							</div>
							<p className="small text-muted mt-3 mb-0">
								Hover, click, double-click, or right-click a country to see layer event details.
							</p>
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
							<form onSubmit={applyOptions}>
								<div className="form-row">
									<div className="form-group col">
										<label htmlFor="stroke">Stroke color</label>
										<input className="form-control" id="stroke" name="stroke" type="color" value={options.stroke} onChange={updateOption} />
									</div>
									<div className="form-group col">
										<label htmlFor="fillColor">Fill color</label>
										<input className="form-control" id="fillColor" name="fillColor" type="color" value={options.fillColor} onChange={updateOption} />
									</div>
								</div>
								<div className="form-row">
									<div className="form-group col">
										<label htmlFor="weight">Stroke width</label>
										<input className="form-control" id="weight" name="weight" type="number" min="0" max="10" step="0.5" value={options.weight} onChange={updateOption} />
									</div>
									<div className="form-group col">
										<label htmlFor="opacity">Stroke opacity</label>
										<input className="form-control" id="opacity" name="opacity" type="number" min="0" max="1" step="0.1" value={options.opacity} onChange={updateOption} />
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="fillOpacity">Fill opacity: <span>{options.fillOpacity}</span></label>
									<input className="form-control" id="fillOpacity" name="fillOpacity" type="range" min="0" max="1" step="0.1" value={options.fillOpacity} onChange={updateOption} />
								</div>
								<div className="form-group">
									<label htmlFor="hoverFillOpacity">Hover fill opacity</label>
									<input className="form-control" id="hoverFillOpacity" name="hoverFillOpacity" type="number" min="0" max="1" step="0.1" value={options.hoverFillOpacity} onChange={updateOption} />
								</div>
								<div className="form-group">
									<label htmlFor="activeFillOpacity">Active fill opacity</label>
									<input className="form-control" id="activeFillOpacity" name="activeFillOpacity" type="number" min="0" max="1" step="0.1" value={options.activeFillOpacity} onChange={updateOption} />
								</div>
								<div className="form-group">
									<label htmlFor="zIndex">Z-index</label>
									<input className="form-control" id="zIndex" name="zIndex" type="number" min="0" step="1" value={options.zIndex} onChange={updateOption} />
								</div>
								<div className="form-group form-check">
									<input className="form-check-input" id="interactive" name="interactive" type="checkbox" checked={options.interactive} onChange={updateOption} />
									<label className="form-check-label" htmlFor="interactive">Interactive</label>
								</div>
								<div className="form-group form-check">
									<input className="form-check-input" id="showTooltip" name="showTooltip" type="checkbox" checked={options.showTooltip} onChange={updateOption} />
									<label className="form-check-label" htmlFor="showTooltip">Show country tooltips</label>
								</div>
								<div className="form-group form-check">
									<input className="form-check-input" id="showPopup" name="showPopup" type="checkbox" checked={options.showPopup} onChange={updateOption} />
									<label className="form-check-label" htmlFor="showPopup">Show country popups</label>
								</div>
								<button type="submit" className="btn btn-primary btn-block">Apply options</button>
								<p className="small text-muted mt-2 mb-0">
									Applying options recreates the layer and clears existing event highlights.
								</p>
							</form>
						</div>
					</div>
				</div>
			</div>

			<div className="row">
				<div className="col-md-12 mb-4">
					<div className="card">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<h4 className="mb-0">Event log</h4>
								<button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEvents([])}>
									Clear
								</button>
							</div>
							<p className="small text-muted mt-2">VectorGrid events appear here as JSON.</p>
							<ol className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }} aria-live="polite">
								{events.map((entry, index) => (
									<li className="list-group-item small" key={`${entry.time}-${index}`}>
										{entry.time} - {entry.name}: {JSON.stringify(entry.detail)}
									</li>
								))}
							</ol>
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
								<iframe height="300" style={{ width: '100%' }} scrolling="no" title="react-leaflet-vectorgrid for react-leaflet V5 example" src="https://codepen.io/editor/m_hasbie/embed/01a20662-b67f-77b3-8ce7-137c30ba183d?default-tab=html%2Cresult" frameBorder="no" loading="lazy" allowTransparency="true">
								See the Pen <a href="https://codepen.io/editor/m_hasbie/pen/01a20662-b67f-77b3-8ce7-137c30ba183d">
								react-leaflet-vectorgrid for react-leaflet V5 example</a> by M. Hasbie (<a href="https://codepen.io/m_hasbie">@m_hasbie</a>)
								on <a href="https://codepen.io">CodePen</a>.
								</iframe>
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
