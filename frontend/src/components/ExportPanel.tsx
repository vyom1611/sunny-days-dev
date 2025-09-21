import React from "react";
import { ActivityOut, RowState, StudentOut } from "../libs/types";

export default function ExportPanel({ students, activities, grid }: { students: StudentOut[]; activities: ActivityOut[]; grid: Map<number, RowState>; }) {
  function buildPayload(): string {
    const entries = Array.from(grid.entries()).map(([student_id, r]) => ({ student_id, ...r }));
    return JSON.stringify({ students, activities, selection: entries }, null, 2);
  }

  function downloadJson(): void {
    const payload = buildPayload();
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participation_export.json";
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent("click"));
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openJsonInNewTab(): void {
    const payload = buildPayload();
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) alert("Popup blocked. Enable popups for this site or use Download.");
  }

  async function copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(buildPayload());
      alert("Copied JSON to clipboard.");
    } catch {
      alert("Clipboard not available.");
    }
  }

  async function exportJsonSaveAs(): Promise<void> {
    const payload = buildPayload();
    const canSave = typeof (window as any).showSaveFilePicker === "function" && window.isSecureContext && window.self === window.top;
    if (!canSave) {
      alert("Save As not available here. Opening in a new tab instead.");
      openJsonInNewTab();
      return;
    }
    try {
      // @ts-ignore - File System Access API types may not be present
      const handle = await window.showSaveFilePicker({
        suggestedName: "participation_export.json",
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(new Blob([payload], { type: "application/json" }));
      await writable.close();
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.warn("Save As failed; opening tab fallback:", e);
        openJsonInNewTab();
      }
    }
  }

  const saveAsSupported = typeof (window as any).showSaveFilePicker === "function" && window.isSecureContext && window.self === window.top;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={downloadJson} className="px-3 py-2 rounded-xl bg-orange-600 text-white">Download JSON Backup</button>
      <button onClick={exportJsonSaveAs} disabled={!saveAsSupported} title={saveAsSupported ? "" : "Not available when embedded/insecure; use Download or Open in new tab."} className={`px-3 py-2 rounded-xl text-white ${saveAsSupported ? "bg-orange-500" : "bg-orange-300 cursor-not-allowed"}`}>Save JSON (Save As…)</button>
      <button onClick={openJsonInNewTab} className="px-3 py-2 rounded-xl bg-gray-800 text-white">Open JSON in new tab</button>
      <button onClick={copyToClipboard} className="px-3 py-2 rounded-xl bg-gray-200">Copy JSON</button>
    </div>
  );
}
