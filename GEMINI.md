# GEMINI.md - WUAICOT-RULETA

## Arquitectura y Estándares
Este repositorio sigue una arquitectura de cliente/servidor (React + Python/Node).
- **Core de Animación (SAGRADO):** La lógica de renderizado 3D (BabylonJS) es inmutable. No tocar `MainScene.tsx`, `RouletteAnimate.tsx`, `RouletteMesh.tsx`, `Barrier.tsx`, `BallMesh.tsx`, `Ground.tsx`, `gameStore.tsx`, `utils.tsx` ni el `backend/`.
- **Estilos:** Se utiliza CSS puro con variables globales en `index.css`.

## Responsividad y Diseño
El juego debe ser 100% responsivo manteniendo la integridad del motor 3D.

### Regla de Orientación (Mobile)
Debido a la naturaleza inmersiva del juego:
- **Dispositivos Móviles (Vertical):** El sistema debe detectar la orientación. En modo vertical, mostrar un mensaje de "Gira tu pantalla a modo horizontal para jugar". El juego se reducirá a un "modo espectador" donde solo se renderiza la ruleta sin interacción de apuestas.
- **Dispositivos Móviles (Horizontal):** Se habilita el juego completo.

### Breakpoints
- **Mobile S:** ≤ 480px
- **Mobile L:** 481px – 767px
- **Tablet:** 768px – 1024px
- **Laptop:** 1025px – 1440px
- **Desktop:** 1625px+

### Directrices de Implementación
1. **Layout raíz:** `index.css` debe permitir scroll en móvil (`overflow-y: auto`) y restringir en desktop (`overflow: hidden`).
2. **Dashboard:** Usar flexbox/grid para apilar componentes en móvil (Babylon superior, Tabla inferior).
3. **Tablero:** Implementar `.board-scroll-wrapper` para permitir scroll horizontal en pantallas pequeñas, asegurando legibilidad (min-width 520px).
4. **Audio:** Corregir el selector global `img` en `Audio.css` por clases específicas (`.audio-icon`).
5. **Chips Bar:** Pasar de `fixed` a `relative` en móvil para evitar superposición con el tablero.

## Flujo de Trabajo
- Siempre verificar antes de editar.
- Validar cambios con build/lint si corresponde.
- No alterar lógica de negocio ni dependencias.
