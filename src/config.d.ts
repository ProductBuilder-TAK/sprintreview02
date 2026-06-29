/**
 * Déclarations de types pour config.js (fichier JS legacy non typé).
 * Permet d'importer `@/config.js` depuis du TypeScript sans erreur TS7016,
 * sans activer allowJs globalement.
 */

/** Palette de couleurs utilisée par les graphiques (valeurs hex). */
export const CHART_COLORS: Record<string, string>

declare const config: Record<string, unknown>
export default config
