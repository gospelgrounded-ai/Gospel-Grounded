import { GraphicStyle, GraphicStyleName } from "./types";

export const STYLES: Record<GraphicStyleName, GraphicStyle> = {
  bold: {
    accent: "#e94560",
    accentGradient: "linear-gradient(90deg, #e94560 0%, #c0392b 100%)",
    accentRight: "#4ecdc4",
    panelBg: "rgba(8, 8, 20, 0.88)",
    overlayBg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    text: "#ffffff",
    subtext: "#aaaacc",
    font: "Poppins, 'Segoe UI', sans-serif",
    titleFont: "Poppins, 'Segoe UI', sans-serif",
  },
  gospel: {
    accent: "#d4af37",
    accentGradient: "linear-gradient(90deg, #d4af37 0%, #a8832b 100%)",
    accentRight: "#c4a882",
    panelBg: "rgba(15, 10, 5, 0.90)",
    overlayBg: "linear-gradient(135deg, #1a1205 0%, #0d0a02 100%)",
    text: "#f5e6c8",
    subtext: "#c4a882",
    font: "Georgia, 'Times New Roman', serif",
    titleFont: "Georgia, serif",
  },
  modern: {
    accent: "#00d4ff",
    accentGradient: "linear-gradient(90deg, #00d4ff 0%, #8b00ff 100%)",
    accentRight: "#c080ff",
    panelBg: "rgba(10, 2, 30, 0.92)",
    overlayBg: "linear-gradient(135deg, #0d0221 0%, #1a0040 100%)",
    text: "#ffffff",
    subtext: "#8888bb",
    font: "'Segoe UI', 'Helvetica Neue', sans-serif",
    titleFont: "'Segoe UI', sans-serif",
  },
  documentary: {
    accent: "#c9834a",
    accentGradient: "linear-gradient(90deg, #c9834a 0%, #8b5a32 100%)",
    accentRight: "#8dc4a3",
    panelBg: "rgba(20, 12, 5, 0.88)",
    overlayBg: "linear-gradient(135deg, #1a0e05 0%, #0d0702 100%)",
    text: "#f0e0c8",
    subtext: "#b8a090",
    font: "Georgia, 'Times New Roman', serif",
    titleFont: "Georgia, serif",
  },
  minimal: {
    accent: "rgba(255,255,255,0.92)",
    accentGradient: "linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(200,200,200,0.7) 100%)",
    accentRight: "rgba(200,220,255,0.8)",
    panelBg: "rgba(0, 0, 0, 0.55)",
    overlayBg: "rgba(0, 0, 0, 0.45)",
    text: "#ffffff",
    subtext: "rgba(255,255,255,0.72)",
    font: "'Helvetica Neue', Arial, sans-serif",
    titleFont: "'Helvetica Neue', Arial, sans-serif",
  },
  liquid_glass: {
    accent: "rgba(255, 255, 255, 0.95)",
    accentGradient: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(180,220,255,0.85) 100%)",
    accentRight: "rgba(160, 210, 255, 0.9)",
    panelBg: "rgba(255, 255, 255, 0.10)",
    overlayBg: "rgba(255, 255, 255, 0.07)",
    text: "#ffffff",
    subtext: "rgba(255,255,255,0.78)",
    font: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
    titleFont: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
    panelFilter: "blur(24px) saturate(1.6)",
    borderColor: "rgba(255, 255, 255, 0.38)",
  },
};

export const STYLE_META: Record<GraphicStyleName, { label: string; description: string; swatch: string }> = {
  bold:         { label: "Bold",         description: "High-energy red, modern sans-serif",       swatch: "#e94560" },
  gospel:       { label: "Gospel",       description: "Gold accents, warm serif, reverent",        swatch: "#d4af37" },
  modern:       { label: "Modern",       description: "Cyan-purple gradient, sleek YouTube look",  swatch: "#00d4ff" },
  documentary:  { label: "Documentary",  description: "Amber accents, warm serif, journalistic",   swatch: "#c9834a" },
  minimal:      { label: "Minimal",      description: "Clean white, transparent, no distraction",  swatch: "#ffffff" },
  liquid_glass: { label: "Liquid Glass", description: "Frosted glass blur, Apple-style panels",   swatch: "glass"   },
};

export function getStyle(name?: GraphicStyleName): GraphicStyle {
  return STYLES[name ?? "bold"];
}
