import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer } from 'react-leaflet';
import VectorGrid from '../../src';

const data = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: { name: 'Browser test polygon' },
			geometry: {
				type: 'Polygon',
				coordinates: [[
					[-20, -10],
					[20, -10],
					[20, 10],
					[-20, 10],
					[-20, -10]
				]]
			}
		}
	]
};

window.fixtureMouseovers = 0;

const fixturePopup = (layer) => {
	const properties = layer?.properties || layer?.feature?.properties;
	return `<strong>${properties?.name || 'Unknown feature'}</strong>`;
};

function Fixture() {
	const [selectedFeature, setSelectedFeature] = useState('No feature selected');
	const [, setHoverUpdates] = useState(0);
	const params = new URLSearchParams(window.location.search);
	const interactive = params.get('interactive') !== 'false';
	const testHover = params.get('hover') === 'true';

	return (
		<main>
			<h1>VectorGrid fixture</h1>
			<MapContainer
				center={[0, 0]}
				zoom={3}
				minZoom={1}
				maxZoom={8}
				ref={(map) => {
					if (map) window.fixtureMap = map;
				}}
			>
				<VectorGrid
					data={data}
					idField="name"
					interactive={interactive}
					zIndex={testHover ? 401 : undefined}
					style={{
						color: '#222222',
						fillColor: '#336699',
						fillOpacity: 0.6,
						fill: true,
						stroke: true
					}}
					hoverStyle={testHover ? { fillOpacity: 0.9 } : undefined}
					tooltip={testHover ? 'name' : null}
					popup={testHover ? fixturePopup : null}
					onMouseover={() => {
						window.fixtureMouseovers += 1;
						if (testHover) setHoverUpdates((count) => count + 1);
					}}
					onClick={(event) => {
						setSelectedFeature(`Selected: ${event.feature.properties.name}`);
					}}
				/>
			</MapContainer>
			<p id="selected-feature" data-testid="selected-feature" aria-live="polite">
				{selectedFeature}
			</p>
			<p data-testid="map-center">0.00,0.00</p>
		</main>
	);
}

const app = new URLSearchParams(window.location.search).get('strict') === 'true' ?
	<React.StrictMode><Fixture /></React.StrictMode> :
	<Fixture />;

createRoot(document.getElementById('root')).render(app);
