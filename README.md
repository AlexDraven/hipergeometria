# Calculadora Hipergeométrica

Calculadora de probabilidades para juegos de cartas (TCG): modela el robo sin
reemplazo con la distribución hipergeométrica.

## Funcionalidades

- Cálculo de P(X = k), P(X ≤ k) y P(X ≥ k) para un mazo (N), copias de la carta
  (K), cartas robadas (n) y objetivo (k).
- Presets para Magic, Commander, Yu-Gi-Oh!, Pokémon y LairenTCG.
- Distribución completa con gráfico interactivo y tabla de probabilidades.
- Herramientas: probabilidad de combos (varias cartas juntas) y curva por turnos.
- Modo LairenTCG con curva de mulligan.
- Persistencia en localStorage y enlace de compartir con el estado codificado en el hash.
- UI en español, accesible y responsive.

## Desarrollo

```sh
npm install
npm run dev      # servidor de desarrollo
npm run test     # tests (vitest)
npm run lint     # oxlint
npm run build    # typecheck (tsc -b) + build de producción
```

## Despliegue

Se publica en GitHub Pages desde la rama `main` vía GitHub Actions
(`.github/workflows/deploy-pages.yml`). El `base` de Vite está fijado a
`/calculadora-TCG/` para coincidir con la subruta del sitio.

## Estructura

- `src/lib/` — lógica pura (hipergeométrica, Lairen, persistencia, compartir) con tests colocalizados.
- `src/components/` — componentes React; los gráficos son SVG hechos a mano.
- `src/index.css` — configuración de Tailwind v4 (tokens de tema).
