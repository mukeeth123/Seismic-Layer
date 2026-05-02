import { useState, useEffect, useRef } from 'react';
import { generateSeismicCube, extractInline, extractXline, extractTimeSlice, generateAttributes } from '../mock/seismicEngine';

const CUBE_CONFIG = { inlines: 100, xlines: 100, samples: 200, dt: 4 };

let _cachedCube = null;
let _cachedAttrs = null;

function getCube() {
  if (!_cachedCube) {
    _cachedCube = generateSeismicCube(CUBE_CONFIG);
    _cachedAttrs = generateAttributes(_cachedCube);
  }
  return { cube: _cachedCube, attrs: _cachedAttrs };
}

export function useSeismicData() {
  const [ready, setReady] = useState(false);
  const dataRef = useRef(null);

  useEffect(() => {
    // Generate in a timeout to not block render
    const t = setTimeout(() => {
      dataRef.current = getCube();
      setReady(true);
    }, 50);
    return () => clearTimeout(t);
  }, []);

  function getInline(il) {
    if (!dataRef.current) return null;
    return extractInline(dataRef.current.cube, Math.max(0, Math.min(CUBE_CONFIG.inlines - 1, il)));
  }

  function getXline(xl) {
    if (!dataRef.current) return null;
    return extractXline(dataRef.current.cube, Math.max(0, Math.min(CUBE_CONFIG.xlines - 1, xl)));
  }

  function getTimeSlice(t) {
    if (!dataRef.current) return null;
    return extractTimeSlice(dataRef.current.cube, Math.max(0, Math.min(CUBE_CONFIG.samples - 1, t)));
  }

  return { ready, getInline, getXline, getTimeSlice, config: CUBE_CONFIG, attrs: dataRef.current?.attrs };
}
