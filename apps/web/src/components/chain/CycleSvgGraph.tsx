"use client";

import React from "react";

interface Props {
  activeCode: "A" | "B" | "C";
  onSelectNode: (code: "A" | "B" | "C") => void;
  liveScore: number;
}

export function CycleSvgGraph({ activeCode, onSelectNode, liveScore }: Props) {
  return (
    <svg
      viewBox="0 0 420 320"
      role="img"
      aria-label="Three-way exchange cycle between Trader A, Trader B, and Trader C"
      className="w-full max-w-md select-none"
    >
      <defs>
        <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      <path
        d="M 210 54 L 348 258 L 72 258 Z"
        fill="none"
        stroke="url(#edgeGrad)"
        strokeWidth="3"
        strokeOpacity="0.26"
      />
      <path
        d="M 210 54 L 348 258 L 72 258 Z"
        fill="none"
        stroke="url(#edgeGrad)"
        strokeWidth="3.5"
        className="xc-svg-flow"
      />

      <circle
        cx="210"
        cy="188"
        r="42"
        fill="rgba(16, 185, 129, 0.12)"
        stroke="#10B981"
        strokeWidth="1.5"
      />
      <text x="210" y="184" textAnchor="middle" fill="#10B981" fontSize="16" fontWeight="bold">
        {liveScore}%
      </text>
      <text x="210" y="201" textAnchor="middle" fill="#9BB8AE" fontSize="9">
        CYCLE SCORE
      </text>

      <g onClick={() => onSelectNode("A")} className="cursor-pointer">
        <circle
          cx="210"
          cy="54"
          r={activeCode === "A" ? "33" : "28"}
          fill="#0C1513"
          stroke="#10B981"
          strokeWidth={activeCode === "A" ? "4" : "2"}
        />
        <text x="210" y="51" textAnchor="middle" fill="#F2FBF7" fontSize="12" fontWeight="bold">
          A · Rohan
        </text>
        <text x="210" y="65" textAnchor="middle" fill="#34D399" fontSize="9">
          Fujifilm X-T30
        </text>
      </g>

      <g onClick={() => onSelectNode("B")} className="cursor-pointer">
        <circle
          cx="348"
          cy="258"
          r={activeCode === "B" ? "33" : "28"}
          fill="#0C1513"
          stroke="#06B6D4"
          strokeWidth={activeCode === "B" ? "4" : "2"}
        />
        <text x="348" y="255" textAnchor="middle" fill="#F2FBF7" fontSize="12" fontWeight="bold">
          B · Meera
        </text>
        <text x="348" y="269" textAnchor="middle" fill="#22D3EE" fontSize="9">
          Fender Strat
        </text>
      </g>

      <g onClick={() => onSelectNode("C")} className="cursor-pointer">
        <circle
          cx="72"
          cy="258"
          r={activeCode === "C" ? "33" : "28"}
          fill="#0C1513"
          stroke="#F59E0B"
          strokeWidth={activeCode === "C" ? "4" : "2"}
        />
        <text x="72" y="255" textAnchor="middle" fill="#F2FBF7" fontSize="12" fontWeight="bold">
          C · Aarav
        </text>
        <text x="72" y="269" textAnchor="middle" fill="#FBBF24" fontSize="9">
          iPad Pro M2
        </text>
      </g>
    </svg>
  );
}
