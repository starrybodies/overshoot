'use client';
import {Component,type ReactNode} from 'react';
/** A failed graphics driver or lazy chunk must leave the geographic fallback usable. */
export default class GlobeBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(){this.props.onFailure()}
 render(){return this.state.failed?null:this.props.children}
}
