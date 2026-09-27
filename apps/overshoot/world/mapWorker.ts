import {setWorkerUrl} from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// MapLibre 6 ships its worker separately. Let Vite bundle it and its imports,
// then use that same-origin asset instead of a path relative to the app chunk.
export function configureMapWorker() {
 setWorkerUrl(workerUrl);
}
