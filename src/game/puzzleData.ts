/**
 * PROJECT: LAST SIGNAL - Sci-Fi Mathematics & Circuit Routing Puzzle System
 */

export interface CircuitNode {
  id: string;
  label: string;
  symbol: string;
  x: number; // percentage in viewBox [0..100]
  y: number;
  value: number; // numerical mathematical component
  type: 'source' | 'relay' | 'ground' | 'resonator';
}

export interface CircuitEdge {
  from: string;
  to: string;
  resistance?: number;
}

export interface CircuitPuzzleConfig {
  nodeId: 'DELTA' | 'SIGMA' | 'OMEGA';
  name: string;
  symbol: string;
  title: string;
  mathSubtitle: string;
  theoryExplanation: string;
  targetObjective: string;
  targetValue: number;
  nodes: CircuitNode[];
  validPaths: string[][]; // list of acceptable path sequences or connection sets
  formulaText: string;
}

export const CIRCUIT_PUZZLES: Record<'DELTA' | 'SIGMA' | 'OMEGA', CircuitPuzzleConfig> = {
  DELTA: {
    nodeId: 'DELTA',
    name: 'Node Alpha (Δ)',
    symbol: 'Δ',
    title: 'TRI-PHASE DELTA HARMONIC BALANCER',
    mathSubtitle: 'Three-Vertex Closed Cyclic Graph: Σ(V_k) = 120 V',
    theoryExplanation: 'To stabilize the primary reactor core, power must circulate through all three delta vertices (A, B, C) in a continuous closed triangle. Each segment adds phase voltage. Close the triangle loop to reach exactly 120V resonant potential.',
    targetObjective: 'Form a closed 3-node triangular loop connecting A → B → C → A to achieve Σ = 120V resonance.',
    targetValue: 120,
    formulaText: 'V_res = V(A→B) + V(B→C) + V(C→A) = 35 + 45 + 40 = 120 V',
    nodes: [
      { id: 'A', label: 'Vertex A', symbol: 'Δ₁', x: 50, y: 18, value: 35, type: 'source' },
      { id: 'B', label: 'Vertex B', symbol: 'Δ₂', x: 22, y: 75, value: 45, type: 'relay' },
      { id: 'C', label: 'Vertex C', symbol: 'Δ₃', x: 78, y: 75, value: 40, type: 'resonator' },
    ],
    // The player must select edges to form the closed triangle A-B-C-A
    validPaths: [
      ['A', 'B', 'C', 'A'],
      ['A', 'C', 'B', 'A'],
      ['B', 'C', 'A', 'B'],
      ['C', 'A', 'B', 'C'],
    ]
  },

  SIGMA: {
    nodeId: 'SIGMA',
    name: 'Node Beta (Σ)',
    symbol: 'Σ',
    title: 'QUAD-BRIDGE IMPEDANCE ROUTER',
    mathSubtitle: 'Planar Graph Vector Flux: Σ(Z_in) = Σ(Z_out) = 100 Ω',
    theoryExplanation: 'Auxiliary power feeds through a 4-node diamond lattice. Power enters from Source (S) and must be routed through dual parallel relays (R₁, R₂) to Ground (G) such that both branches sum to balanced 100Ω impedance.',
    targetObjective: 'Route parallel power paths from Source (S) through Relays (R₁ & R₂) down to Ground (G).',
    targetValue: 100,
    formulaText: 'Z_total = [R₁(40Ω) + R₂(60Ω)] ∥ Balanced Bridge = 100 Ω',
    nodes: [
      { id: 'S', label: 'Source [S]', symbol: 'Σ₀', x: 50, y: 15, value: 0, type: 'source' },
      { id: 'R1', label: 'Flux Relay 1', symbol: 'R₁', x: 25, y: 50, value: 40, type: 'relay' },
      { id: 'R2', label: 'Flux Relay 2', symbol: 'R₂', x: 75, y: 50, value: 60, type: 'relay' },
      { id: 'G', label: 'Ground [G]', symbol: 'Σ₁', x: 50, y: 85, value: 0, type: 'ground' },
    ],
    validPaths: [
      // Needs both branches or through relays to complete bridge
      ['S', 'R1', 'G', 'R2', 'S'],
      ['S', 'R1', 'G'],
      ['S', 'R2', 'G'],
    ]
  },

  OMEGA: {
    nodeId: 'OMEGA',
    name: 'Node Gamma (Ω)',
    symbol: 'Ω',
    title: 'PENTAGONAL TOROIDAL PHASE MATRIX',
    mathSubtitle: 'Cyclic Hamiltonian Cycle: ∮ Φ · dl = 5 Harmonic Steps',
    theoryExplanation: 'Life support power requires a 5-node cyclic toroidal induction field. Connect the 5 orbital nodes (P₁ through P₅) around the perimeter in harmonic clockwise or counter-clockwise order to establish continuous field containment.',
    targetObjective: 'Connect all 5 orbital nodes in sequence around the cyclic ring to close the induction field.',
    targetValue: 5,
    formulaText: 'Cycle(P₁→P₂→P₃→P₄→P₅→P₁) = Phase Balance Locked',
    nodes: [
      { id: 'P1', label: 'Phase 1', symbol: 'Ω₁', x: 50, y: 15, value: 1, type: 'source' },
      { id: 'P2', label: 'Phase 2', symbol: 'Ω₂', x: 83, y: 39, value: 2, type: 'relay' },
      { id: 'P3', label: 'Phase 3', symbol: 'Ω₃', x: 71, y: 80, value: 3, type: 'resonator' },
      { id: 'P4', label: 'Phase 4', symbol: 'Ω₄', x: 29, y: 80, value: 4, type: 'relay' },
      { id: 'P5', label: 'Phase 5', symbol: 'Ω₅', x: 17, y: 39, value: 5, type: 'ground' },
    ],
    validPaths: [
      ['P1', 'P2', 'P3', 'P4', 'P5', 'P1'],
      ['P1', 'P5', 'P4', 'P3', 'P2', 'P1'],
    ]
  }
};
