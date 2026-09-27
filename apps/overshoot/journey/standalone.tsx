import React from 'react';
import {createRoot} from 'react-dom/client';
import WasteJourney from './WasteJourney';
import {readJourney} from '@/packages/overshoot-data/release7/types';
createRoot(document.getElementById('root')!).render(<React.StrictMode><WasteJourney offline initialState={readJourney(location.hash.slice(1))}/></React.StrictMode>);
