import { transformers } from "./transformers";
import { FormatType, Edge, Transformer } from "./types";

interface GraphNode {
  format: FormatType;
  edges: Edge[];
}

interface PathStep {
  from: FormatType;
  to: FormatType;
  transformerId: string;
}

export interface ConversionPath {
  steps: PathStep[];
  transformers: Transformer[];
  distance: number;
}

class ConversionGraph {
  private nodes: Map<FormatType, GraphNode> = new Map();
  private edges: Edge[] = [];

  constructor() {
    this.buildGraph();
  }

  private buildGraph(): void {
    transformers.forEach(transformer => {
      const edge: Edge = {
        from: transformer.from,
        to: transformer.to,
        transformerId: transformer.id
      };
      this.edges.push(edge);

      if (!this.nodes.has(transformer.from)) {
        this.nodes.set(transformer.from, {
          format: transformer.from,
          edges: []
        });
      }
      if (!this.nodes.has(transformer.to)) {
        this.nodes.set(transformer.to, {
          format: transformer.to,
          edges: []
        });
      }

      const fromNode = this.nodes.get(transformer.from)!;
      fromNode.edges.push(edge);
    });
  }

  getFormats(): FormatType[] {
    return Array.from(this.nodes.keys());
  }

  getEdges(): Edge[] {
    return [...this.edges];
  }

  findShortestPath(start: FormatType, end: FormatType): ConversionPath | null {
    if (start === end) {
      return {
        steps: [],
        transformers: [],
        distance: 0
      };
    }

    const visited = new Set<FormatType>();
    const queue: { format: FormatType; path: PathStep[] }[] = [
      { format: start, path: [] }
    ];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentNode = this.nodes.get(current.format);

      if (!currentNode) continue;

      for (const edge of currentNode.edges) {
        if (visited.has(edge.to)) continue;

        const newPath = [
          ...current.path,
          {
            from: edge.from,
            to: edge.to,
            transformerId: edge.transformerId
          }
        ];

        if (edge.to === end) {
          return {
            steps: newPath,
            transformers: newPath.map(
              step => transformers.find(t => t.id === step.transformerId)!
            ),
            distance: newPath.length
          };
        }

        visited.add(edge.to);
        queue.push({ format: edge.to, path: newPath });
      }
    }

    return null;
  }

  findAllPaths(
    start: FormatType,
    end: FormatType,
    maxDepth: number = 5
  ): ConversionPath[] {
    const paths: ConversionPath[] = [];
    const visited = new Set<FormatType>();

    const dfs = (
      current: FormatType,
      path: PathStep[],
      depth: number
    ): void => {
      if (depth > maxDepth) return;

      if (current === end && path.length > 0) {
        paths.push({
          steps: [...path],
          transformers: path.map(
            step => transformers.find(t => t.id === step.transformerId)!
          ),
          distance: path.length
        });
        return;
      }

      const currentNode = this.nodes.get(current);
      if (!currentNode) return;

      for (const edge of currentNode.edges) {
        if (visited.has(edge.to)) continue;

        visited.add(edge.to);
        path.push({
          from: edge.from,
          to: edge.to,
          transformerId: edge.transformerId
        });

        dfs(edge.to, path, depth + 1);

        path.pop();
        visited.delete(edge.to);
      }
    };

    dfs(start, [], 0);
    return paths.sort((a, b) => a.distance - b.distance);
  }

  getAvailableTransformersFrom(format: FormatType): Transformer[] {
    return transformers.filter(t => t.from === format);
  }

  getReachableFormats(
    start: FormatType,
    maxDepth: number = 3
  ): Set<FormatType> {
    const reachable = new Set<FormatType>();
    const visited = new Set<FormatType>();
    const queue: { format: FormatType; depth: number }[] = [
      { format: start, depth: 0 }
    ];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth > 0) {
        reachable.add(current.format);
      }

      if (current.depth >= maxDepth) continue;

      const currentNode = this.nodes.get(current.format);
      if (!currentNode) continue;

      for (const edge of currentNode.edges) {
        if (visited.has(edge.to)) continue;
        visited.add(edge.to);
        queue.push({ format: edge.to, depth: current.depth + 1 });
      }
    }

    return reachable;
  }
}

export const conversionGraph = new ConversionGraph();

export function findPath(
  start: FormatType,
  end: FormatType
): ConversionPath | null {
  return conversionGraph.findShortestPath(start, end);
}

export function getFormats(): FormatType[] {
  return conversionGraph.getFormats();
}

export function getAvailableTransformers(format: FormatType): Transformer[] {
  return conversionGraph.getAvailableTransformersFrom(format);
}
