# GEMINI.md - WUAICOT-RULETA

## Novedades y Ajustes Recientes
- **Flujo Financiero (Wallet):** Se ha corregido la desincronización del saldo en el componente de apuestas. `gameStore.setBalance` ahora calcula el balance jugable restando el total de apuestas pendientes, asegurando que la apertura de la ventana de "Mi Wallet" no contamine el estado de la sesión actual del juego.
- **Solicitud de Créditos:** Estandarizado el proceso de solicitud de fichas a través del panel de Wallet, garantizando que el `baseBalance` y el `balance` jugable se mantengan sincronizados con las actualizaciones del servidor tras la aprobación administrativa.

## Arquitectura y Estándares
Este repositorio sigue una arquitectura de cliente/servidor (React + Python/Node).
- **Core de Animación (SAGRADO):** La lógica de renderizado 3D (BabylonJS) es inmutable. No tocar `MainScene.tsx`, `RouletteAnimate.tsx`, `RouletteMesh.tsx`, `Barrier.tsx`, `BallMesh.tsx`, `Ground.tsx`, `gameStore.tsx`, `utils.tsx` ni el `backend/`.
- **Estilos:** Se utiliza CSS puro con variables globales en `index.css`.

## Componentes y Flujo Financiero
- **Header:** El `Header` es independiente del ciclo de juego principal. Cualquier cambio en su UI o lógica NO debe sincronizarse ni restringirse por los estados de fase (`PLACE_BET`, `SPIN_WHEEL`, etc.) del `GameStage`.
- **FinancialToggle:** El botón "$" y su panel de información deben ser siempre accesibles. El panel debe aparecer en la parte superior derecha de la pantalla (fijo) con un margen de 12px, ser semi-translúcido y desvanecerse tras 3 segundos o al cerrar manualmente.
- **Wallet / Saldo Jugable:** El estado del saldo jugable debe reflejar: `SaldoServidor - TotalApuestasActivas`. Cualquier recarga desde el servidor debe respetar esta fórmula.

## Responsividad y Diseño
El juego debe ser 100% responsivo manteniendo la integridad del motor 3D.

### Regla de Orientación (Mobile)
Debido a la naturaleza inmersiva del juego:
- **Dispositivos Móviles (Vertical):** El sistema debe detectar la orientación. En modo vertical, mostrar un mensaje de "Gira tu pantalla a modo horizontal para jugar". El juego se reducirá a un "modo espectador" donde solo se renderiza la ruleta sin interacción de apuestas.
- **Dispositivos Móviles (Horizontal):** Se habilita el juego completo.

### Breakpoints
- **Mobile S:** ≤ 480px
- **Mobile L:** 481px – 767px
- **Tablet:** 768px – 984px
- **Laptop:** 985px – 1624px
- **Desktop:** 1625px+

### Directrices de Implementación
1. **Layout raíz:** `index.css` debe permitir scroll en móvil (`overflow-y: auto`) y restringir en desktop (`overflow: hidden`).
2. **Dashboard:** Usar flexbox/grid para apilar componentes en móvil (Babylon superior, Tabla inferior).
3. **Tablero:** Implementar `.board-scroll-wrapper` para permitir scroll horizontal en pantallas pequeñas, asegurando legibilidad (min-width 520px).
4. **Audio:** Corregir el selector global `img` en `Audio.css` por clases específicas (`.audio-icon`).
5. **Chips Bar:** Pasar de `fixed` a `relative` en móvil para evitar superposición con el tablero.
6. **Bloqueo de Puntero:** El contenedor del juego (`.App`) gestiona la lógica de `pointer-events: none` basada en el ciclo de juego. El `Header` debe permanecer SIEMPRE fuera de cualquier contenedor que aplique esta restricción.

## Flujo de Trabajo
- Siempre verificar antes de editar.
- Validar cambios con build/lint si corresponde.
- No alterar lógica de negocio ni dependencias.
