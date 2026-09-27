'use client';

import type {ComponentProps} from 'react';
import {Slider as Primitive} from 'radix-ui';

/** A single-value atlas control with the accessible name on its focusable thumb. */
export function Slider({className, 'aria-label': label, ...props}: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root {...props} className={`atlas-slider ${className ?? ''}`} data-slot="slider">
    <Primitive.Track data-slot="slider-track"><Primitive.Range data-slot="slider-range" /></Primitive.Track>
    <Primitive.Thumb data-slot="slider-thumb" aria-label={label} />
  </Primitive.Root>;
}
