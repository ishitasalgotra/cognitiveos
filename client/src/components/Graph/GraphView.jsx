import React, { useRef, useCallback, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { RefreshCw, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../hooks/useStore";
import { notesApi } from "../../api";
import toast from "react-hot-toast";

const TAG_COLORS = [
  "#00d4ff", "#00b894", "#ffb347", "#ff6b8a",
  "#a78bfa", "#74b9ff", "#fd79a8", "#55efc4",
];

export default function GraphView() {
  const { graphData, graphLoading, fetchGraph, setActiveNote, notes, setActivePanel } = useStore();
  const fgRef             = useRef();
  const [selected, setSelected]     = useState(null);
  const [hovered, setHovered]       = useState(null);
  const [linkMode, setLinkMode]     = useState(false);
  const [linkSource, setLinkSource] = useState(null);
  const [dims, setDims]             = useState({ w: 800, h: 500 });
  const containerRef = useRef();

  // Responsive dimensions
  useEffect(() => {
    const obs = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Zoom to fit on load
  useEffect(() => {
  if (!graphLoading && fgRef.current && graphData.nodes.length > 0) {
    setTimeout(() => {
      fgRef.current.zoomToFit(600, 120);
      fgRef.current.zoom(1.5, 400);
    }, 500);
  }
}, [graphLoading, graphData]);

  // Tag → color mapping
  const tagColorMap = useCallback((tags = []) => {
    if (!tags.length) return "#4a5a6a";
    const idx = tags[0].split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return TAG_COLORS[idx % TAG_COLORS.length];
  }, []);

  const handleNodeClick = useCallback(async (node) => {
    if (linkMode) {
      if (!linkSource) {
        setLinkSource(node);
        toast("Now click another node to link it", { icon: "🔗" });
        return;
      }
      if (linkSource.id === node.id) { setLinkSource(null); return; }
      try {
        await notesApi.updateLinks(linkSource.id, { add: [node.id] });
        toast.success(`Linked "${linkSource.title}" → "${node.title}"`);
        fetchGraph();
      } catch { toast.error("Failed to create link"); }
      setLinkSource(null);
      return;
    }
    setSelected(node);
  }, [linkMode, linkSource, fetchGraph]);

  const handleNodeHover = useCallback((node) => setHovered(node), []);

  const openNote = (node) => {
    const found = notes.find((n) => n._id === node.id);
    if (found) { setActiveNote(found); setActivePanel("notes"); }
  };

  const removeLink = async (sourceId, targetId) => {
    try {
      await notesApi.updateLinks(sourceId, { remove: [targetId] });
      toast.success("Link removed");
      fetchGraph();
      setSelected(null);
    } catch { toast.error("Failed to remove link"); }
  };

  const paintNode = useCallback((node, ctx, globalScale) => {
    const isSelected = selected?.id === node.id;
    const isHovered  = hovered?.id  === node.id;
    const isSource   = linkSource?.id === node.id;
    const color      = tagColorMap(node.tags);
    const radius = Math.max(4, Math.min(8, node.val || 5));
    const x = node.x, y = node.y;

    // Outer glow for selected/hovered
    if (isSelected || isHovered || isSource) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 8, 0, 2 * Math.PI);
      ctx.fillStyle = isSource ? "#ffb34733" : `${color}22`;
      ctx.fill();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected || isSource ? color + "55" : color + "22";
    ctx.strokeStyle = isSource ? "#ffb347" : isSelected ? color : color + "88";
    ctx.lineWidth = isSelected || isSource ? 2 : 1.2;
    ctx.fill();
    ctx.stroke();

    // Label
    const fontSize = 5;
ctx.font = `${fontSize}px 'JetBrains Mono'`;
ctx.fillStyle = isSelected ? "#e8f4ff" : "#c8d8e8bb";
ctx.textAlign = "center";
const label = node.title || "";
ctx.fillText(
  label.length > 15 ? label.slice(0, 13) + "…" : label,
  x, y + radius + fontSize + 3
);
  }, [selected, hovered, linkSource, tagColorMap]);

  const paintLink = useCallback((link, ctx) => {
    const start = link.source, end = link.target;
    if (!start.x || !end.x) return;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "#1e273088";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, []);

  // Find connected nodes for selected
  const connectedIds = selected
    ? graphData.links
        .filter((l) => (l.source?.id || l.source) === selected.id || (l.target?.id || l.target) === selected.id)
        .map((l) => ({
          id:    (l.source?.id || l.source) === selected.id ? (l.target?.id || l.target) : (l.source?.id || l.source),
          srcId: l.source?.id || l.source,
        }))
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div>
          <h2 className="font-display font-bold text-bright text-base">Knowledge Graph</h2>
          <p className="font-mono text-[11px] text-dim mt-0.5">
            {graphData.nodes.length} nodes · {graphData.links.length} edges
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Link mode toggle */}
          <button onClick={() => { setLinkMode((v) => !v); setLinkSource(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display
                        border transition-all
                        ${linkMode
                          ? "text-amber border-amber/40 bg-amber/10"
                          : "text-dim border-border hover:text-text hover:bg-muted/30"}`}>
            🔗 {linkMode ? "Linking…" : "Link Mode"}
          </button>
          <button onClick={fetchGraph}
            className="p-2 rounded-lg text-dim hover:text-teal hover:bg-teal/10 transition-colors">
            <RefreshCw size={14} className={graphLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Link mode banner */}
      <AnimatePresence>
        {linkMode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 py-2 bg-amber/10 border-b border-amber/20 flex items-center gap-2">
            <span className="text-xs text-amber font-mono">
              {linkSource ? `Source: "${linkSource.title}" → click target node` : "Click a node to start linking"}
            </span>
            {linkSource && (
              <button onClick={() => setLinkSource(null)}
                className="ml-auto text-amber/60 hover:text-amber"><X size={12} /></button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        {/* Graph */}
        {graphLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-dim">
              <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
              <span className="font-mono text-xs">Building graph…</span>
            </div>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-dim">
            <p className="font-display text-sm">Create notes to see the graph</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            width={dims.w}
            height={dims.h}
            graphData={graphData}
            nodeCanvasObject={paintNode}
            nodeCanvasObjectMode={() => "replace"}
            linkCanvasObject={paintLink}
            linkCanvasObjectMode={() => "replace"}
            backgroundColor="#080b0f"
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            nodeLabel=""
            linkDirectionalParticles={2}
            linkDirectionalParticleColor={() => "#00d4ff55"}
            linkDirectionalParticleWidth={1.5}
            linkDirectionalParticleSpeed={0.004}
            cooldownTicks={100}
            d3VelocityDecay={0.35}
            enableNodeDrag={!linkMode}
          />
        )}

        {/* Node detail panel */}
        <AnimatePresence>
          {selected && !linkMode && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="absolute top-4 right-4 w-64 glass rounded-xl border border-border p-4 z-10"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-bold text-bright text-sm line-clamp-2">{selected.title}</p>
                  {selected.tags?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {selected.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelected(null)}
                  className="text-dim hover:text-text transition-colors flex-shrink-0 ml-2">
                  <X size={14} />
                </button>
              </div>

              {/* Connected notes */}
              {connectedIds.length > 0 && (
                <div className="mb-3">
                  <p className="font-mono text-[10px] text-dim mb-1.5">Connected to:</p>
                  <div className="flex flex-col gap-1">
                    {connectedIds.map(({ id, srcId }) => {
                      const n = graphData.nodes.find((x) => x.id === id);
                      return n ? (
                        <div key={id} className="flex items-center justify-between
                                                  px-2 py-1.5 rounded-lg bg-panel border border-border">
                          <span className="font-body text-xs text-text truncate">{n.title}</span>
                          {srcId === selected.id && (
                            <button onClick={() => removeLink(selected.id, id)}
                              className="text-rose/50 hover:text-rose transition-colors ml-2 flex-shrink-0">
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <button onClick={() => openNote(selected)}
                className="w-full py-2 rounded-lg bg-cyan/10 text-cyan border border-cyan/20
                           text-xs font-display hover:bg-cyan/20 transition-colors">
                Open Note →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass px-3 py-2 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan/40 border border-cyan/60" />
              <span className="font-mono text-[10px] text-dim">Note</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px bg-cyan/30" />
              <span className="font-mono text-[10px] text-dim">Link</span>
            </div>
            <span className="font-mono text-[10px] text-muted">Click = inspect · Drag = move</span>
          </div>
        </div>
      </div>
    </div>
  );
}