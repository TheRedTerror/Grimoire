"use client";

interface FacilityMapGuideProps {
  hasZones: boolean;
}

const STEPS = [
  {
    n: "01",
    title: "Add zones with buttons",
    body: 'Click "+ Add to Map" on any zone type (left panel or the overlay when the map is empty). Each click places one zone on the floor plan. You cannot drag zones from the palette.',
  },
  {
    n: "02",
    title: "Move & resize zones",
    body: "Drag a zone card to reposition it. Click a zone to select it, then drag the corner/edge handles to resize the area on the floor plan. You can also set exact pixel dimensions in the Zone Editor.",
  },
  {
    n: "03",
    title: "Edit or remove zones",
    body: "Click a zone to select it and edit in the right panel. Press Delete or Backspace (when not typing in a field) to remove the selected zone from the map. Connected movement paths are removed automatically.",
  },
  {
    n: "04",
    title: "Draw movement paths",
    body: "Hover a zone until connector dots appear on its edges. Drag from a dot on one zone to a dot on another to define a movement route.",
  },
  {
    n: "05",
    title: "Navigate the canvas",
    body: "Scroll to zoom. Middle-click or right-click drag to pan. Use the +/− controls (bottom-left) and minimap (bottom-right) on large sites.",
  },
  {
    n: "06",
    title: "Compile the plan",
    body: "When the layout is complete, click Compile Physical Plan. Output merges into Operation Plan (SEC-06).",
  },
];

export default function FacilityMapGuide({ hasZones }: FacilityMapGuideProps) {
  void hasZones;

  return (
    <div>
        <div className="px-3 pb-3 pt-2">
          <div className="mb-3 p-2.5 border border-grimoire-accent/20 bg-grimoire-accent/5 text-[10px] text-grimoire-text leading-relaxed">
            <strong className="text-grimoire-accent">Important:</strong> Zones are added with{" "}
            <strong>+ Add to Map</strong> buttons, not by dragging from the sidebar. Dragging only
            applies to zones already on the canvas.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="p-2.5 border border-grimoire-border/25 bg-grimoire-bg/40 flex gap-2.5"
              >
                <span className="text-[10px] font-mono text-grimoire-accent/80 shrink-0 pt-0.5">
                  {step.n}
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-grimoire-text mb-1">
                    {step.title}
                  </div>
                  <p className="text-[10px] text-grimoire-muted leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
