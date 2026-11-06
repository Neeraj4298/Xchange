"use client";

import React from "react";

interface Props {
  activeCode: "A" | "B" | "C";
  onSelectNode: (code: "A" | "B" | "C") => void;
  liveScore: number;
}

/**
 * Xchange Pure — Clean 2D Vector-Style Exchange Chain Diagram (Screen 06 Spec)
 * Rules:
 * - Three participant nodes with clear directional arrows
 * - Item labels & compatibility score
 * - Strictly NO glowing connections, glass panels, or 3D effects
 */
export function CycleSvgGraph({ activeCode, onSelectNode, liveScore }: Props) {
  return (
    <svg
      viewBox="0 0 420 310"
      role="img"
      aria-label="2D vector three-way exchange chain diagram: A gives to B, B gives to C, C gives to A"
      className="w-full max-w-md select-none"
    >
      <defs>
        <marker
          id="pureArrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#7167E8" />
        </marker>
      </defs>

      {/* Clean 2D Directional Vectors (A -> B, B -> C, C -> A) */}
      <line
        x1="238"
        y1="76"
        x2="322"
        y2="215"
        stroke="#7167E8"
        strokeWidth="2"
        markerEnd="url(#pureArrow)"
      />
      <line
        x1="305"
        y1="252"
        x2="115"
        y2="252"
        stroke="#7167E8"
        strokeWidth="2"
        markerEnd="url(#pureArrow)"
      />
      <line
        x1="98"
        y1="215"
        x2="182"
        y2="76"
        stroke="#7167E8"
        strokeWidth="2"
        markerEnd="url(#pureArrow)"
      />

      {/* Center Compatibility Badge */}
      <rect
        x="156"
        y="152"
        width="108"
        height="48"
        rx="12"
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <text
        x="210"
        y="174"
        textAnchor="middle"
        fill="var(--brand-primary)"
        fontSize="15"
        fontWeight="700"
      >
        {liveScore}% Match
      </text>
      <text x="210" y="190" textAnchor="middle" fill="var(--muted)" fontSize="9" fontWeight="500">
        3-WAY EXCHANGE
      </text>

      {/* Participant A Card (Top) */}
      <g onClick={() => onSelectNode("A")} className="cursor-pointer">
        <rect
          x="135"
          y="16"
          width="150"
          height="54"
          rx="12"
          fill="var(--elevated)"
          stroke={activeCode === "A" ? "#7167E8" : "var(--border)"}
          strokeWidth={activeCode === "A" ? "2.5" : "1.5"}
        />
        <text x="210" y="38" textAnchor="middle" fill="var(--foreground)" fontSize="12" fontWeight="700">
          A · Rohan K.
        </text>
        <text x="210" y="55" textAnchor="middle" fill="var(--muted)" fontSize="10" fontWeight="500">
          Fujifilm X-T30 II · ₹65,000
        </text>
      </g>

      {/* Participant B Card (Bottom Right) */}
      <g onClick={() => onSelectNode("B")} className="cursor-pointer">
        <rect
          x="262"
          y="224"
          width="148"
          height="54"
          rx="12"
          fill="var(--elevated)"
          stroke={activeCode === "B" ? "#7167E8" : "var(--border)"}
          strokeWidth={activeCode === "B" ? "2.5" : "1.5"}
        />
        <text x="336" y="246" textAnchor="middle" fill="var(--foreground)" fontSize="12" fontWeight="700">
          B · Meera S.
        </text>
        <text x="336" y="263" textAnchor="middle" fill="var(--muted)" fontSize="10" fontWeight="500">
          Fender Strat · ₹57,000
        </text>
      </g>

      {/* Participant C Card (Bottom Left) */}
      <g onClick={() => onSelectNode("C")} className="cursor-pointer">
        <rect
          x="10"
          y="224"
          width="148"
          height="54"
          rx="12"
          fill="var(--elevated)"
          stroke={activeCode === "C" ? "#7167E8" : "var(--border)"}
          strokeWidth={activeCode === "C" ? "2.5" : "1.5"}
        />
        <text x="84" y="246" textAnchor="middle" fill="var(--foreground)" fontSize="12" fontWeight="700">
          C · Aarav V.
        </text>
        <text x="84" y="263" textAnchor="middle" fill="var(--muted)" fontSize="10" fontWeight="500">
          iPad Pro M2 · ₹61,000
        </text>
      </g>
    </svg>
  );
}

