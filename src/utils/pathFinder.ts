import { LiquidityPool as PairData, Token } from "../entities";

/**
 * A unique identifier for the
 */
export type NodeId = string;
export interface Node {
  id: NodeId;
  priority: number;
  label: any;
}
class PriorityQueue {
  values: Node[];

  constructor() {
    this.values = [];
  }

  enqueue(id: NodeId, priority: number, label: any) {
    const newNode: Node = { id, priority, label };
    this.values.push(newNode);
    this.bubbleUp();
  }

  bubbleUp() {
    let idx = this.values.length - 1;
    const element = this.values[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.values[parentIdx];
      if (element.priority >= parent.priority) break;
      this.values[parentIdx] = element;
      this.values[idx] = parent;
      idx = parentIdx;
    }
  }

  dequeue() {
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0 && end) {
      this.values[0] = end;
      this.sinkDown();
    }
    return min;
  }

  sinkDown() {
    let idx = 0;
    const length = this.values.length;
    const element = this.values[0];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const leftChildIdx = 2 * idx + 1;
      const rightChildIdx = 2 * idx + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIdx < length) {
        leftChild = this.values[leftChildIdx];
        if (leftChild.priority < element.priority) {
          swap = leftChildIdx;
        }
      }
      if (rightChildIdx < length) {
        rightChild = this.values[rightChildIdx];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && leftChild && rightChild.priority < leftChild.priority)
        ) {
          swap = rightChildIdx;
        }
      }
      if (swap === null) break;
      this.values[idx] = this.values[swap];
      this.values[swap] = element;
      idx = swap;
    }
  }
}

export interface LinkedListItem {
  source: NodeId;
  target: NodeId;
  label: any;
}

export interface PathItem {
  id: string;
  label: any;
}

export interface RouterPathItem {
  symbol0: string;
  symbol1: string;
  hash: string;
}

export class DijkstraCalculator {
  adjacencyList: {
    [key: NodeId]: {
      id: NodeId;
      weight: number;
      label: any;
    }[];
  };

  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex: NodeId) {
    if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
  }

  addEdge(vertex1: NodeId, vertex2: NodeId, weight = 1, label = {}) {
    this.adjacencyList[vertex1].push({ id: vertex2, weight, label });
    this.adjacencyList[vertex2].push({ id: vertex1, weight, label });
  }

  /**
   * Given the provided weights of each edge
   * @param start The starting {@link NodeId} to begin traversal
   * @param finish The ending {@link NodeId} to complete traversal
   * @returns an {@type Array<string>} showing how to traverse the nodes. If traversal is impossible then it will return an empty array
   */
  calculateShortestPath(start: NodeId, finish: NodeId) {
    const nodes = new PriorityQueue();
    const distances: { [key: NodeId]: number } = {};
    const previous: { [key: NodeId]: PathItem } = {};
    const path: PathItem[] = []; //to return at end
    let smallest: PathItem | null = null;
    //build up initial state
    for (const vertex in this.adjacencyList) {
      if (vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(vertex, 0, "");
      } else {
        distances[vertex] = Infinity;
        nodes.enqueue(vertex, Infinity, "");
      }
      delete previous[vertex];
    }
    // as long as there is something to visit
    while (nodes.values.length) {
      smallest = nodes.dequeue();
      if (smallest.id === finish) {
        //WE ARE DONE
        //BUILD UP PATH TO RETURN AT END
        while (smallest.id && previous[smallest.id]) {
          path.push({ id: smallest.id, label: smallest.label });
          smallest = previous[smallest.id];
        }
        break;
      }
      if (smallest || distances[smallest.id] !== Infinity) {
        for (const neighbor in this.adjacencyList[smallest.id]) {
          //find neighboring node
          const nextNode = this.adjacencyList[smallest.id][neighbor];
          //calculate new distance to neighboring node
          const candidate = distances[smallest.id] + nextNode.weight;
          const nextNeighbor = nextNode.id;
          if (candidate < distances[nextNeighbor]) {
            //updating new smallest distance to neighbor
            distances[nextNeighbor] = candidate;
            //updating previous - How we got to neighbor
            previous[nextNeighbor] = smallest;
            //enqueue in priority queue with new priority
            nodes.enqueue(nextNeighbor, candidate, nextNode.label);
          }
        }
      }
    }

    let finalPath: PathItem[] = [];
    if (!smallest) {
      finalPath = path.reverse();
    } else {
      finalPath = path.concat(smallest).reverse();
    }

    if (finalPath.length <= 1) {
      // if the final path has only 1 or fewer elements, there was no traversal that was possible.
      return [];
    }

    return finalPath;
  }

  /**
   * Creates a linked list of the result with each element with a source and target property
   * @param start The starting {@link NodeId} to begin traversal
   * @param finish The ending {@link NodeId} to complete traversal
   * @returns Returns an array where each element is a {@link LinkedListItem}
   */
  calculateShortestPathAsLinkedListResult(start: NodeId, finish: NodeId): LinkedListItem[] {
    const array = this.calculateShortestPath(start, finish);
    const linkedListItems: LinkedListItem[] = [];
    for (let i = 0; i < array.length; i++) {
      if (i == array.length - 1) {
        break;
      }
      linkedListItems.push({
        source: array[i].id,
        target: array[i + 1].id,
        label: array[i].label,
      });
    }
    return linkedListItems;
  }
}

/**
 * Calculate a path through pairs
 *
 * @param token0Symbol token symbol to start (WCSPR, WETCH etc)
 * @param token1Symbol token symbol to end (WCSPR, WETCH etc)
 * @param tokenList list of tokens
 * @param pairList pair list
 * @returns the path through all edges or empty if not possible
 */
export const getPath = (
  token0Symbol: string,
  token1Symbol: string,
  tokenList: Token[],
  pairList: PairData[],
): PathItem[] => {
  const graph = new DijkstraCalculator();

  // Add every token as a vertex
  tokenList.forEach((v: Token) => {
    graph.addVertex(v.tokenSymbol);
  });

  // Add every pair as a edge
  pairList.forEach((v: PairData) => {
    graph.addEdge(v.token0Symbol, v.token1Symbol, 1, v);
  });

  return graph.calculateShortestPath(token0Symbol, token1Symbol);
};

export const getListPath = (
  token0Symbol: string,
  token1Symbol: string,
  tokenList: Token[],
  pairList: PairData[],
): RouterPathItem[] => {
  const pairs = getPath(token0Symbol, token1Symbol, tokenList, pairList);

  const nodes = [];
  for (let i = 0; i < pairs.length - 1; i++) {
    const n0 = pairs[i];
    const n1 = pairs[i + 1];
    nodes.push({ symbol0: n0.id, symbol1: n1.id, hash: n1.label.id });
  }

  return nodes;
};
