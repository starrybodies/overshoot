'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
const ThemeContext=createContext({dark:false,toggle:()=>{}});
export const useAppTheme=()=>useContext(ThemeContext);
export function AppTheme({children}:{children:React.ReactNode}){
 const [dark,setDark]=useState(false);
 function apply(value:boolean){setDark(value);document.documentElement.classList.toggle('dark',value);document.documentElement.style.colorScheme=value?'dark':'light'}
 useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const sync=()=>{let choice:string|null=null;try{choice=localStorage.getItem('overshoot-theme')}catch{}apply(choice?choice==='dark':media.matches)};sync();media.addEventListener('change',sync);window.addEventListener('storage',sync);return()=>{media.removeEventListener('change',sync);window.removeEventListener('storage',sync)}},[]);
 function toggle(){const value=!dark;apply(value);try{localStorage.setItem('overshoot-theme',value?'dark':'light')}catch{}}
 return <ThemeContext.Provider value={{dark,toggle}}>{children}</ThemeContext.Provider>
}
export function ThemeToggle(){const {dark,toggle}=useAppTheme();return <button className="oa-theme-toggle" aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Light mode':'Dark mode'} onClick={toggle}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>}
