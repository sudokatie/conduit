import { Direction, PipeType, PipeData } from './types';
import { PIPE_CONNECTIONS, PIPE_WEIGHTS, OPPOSITE_DIRECTION } from './constants';

// Get the connections for a pipe type
export function getPipeConnections(type: PipeType): Direction[] {
  return PIPE_CONNECTIONS[type];
}

// Check if water can flow through a pipe from a given direction
export function canFlowThrough(type: PipeType, fromDirection: Direction): boolean {
  const connections = PIPE_CONNECTIONS[type];
  // Water enters from the opposite side of where it's coming from
  const entryDirection = OPPOSITE_DIRECTION[fromDirection];
  return connections.includes(entryDirection);
}

// Get the exit direction(s) when water enters from a given direction
export function getExitDirections(type: PipeType, fromDirection: Direction): Direction[] {
  const connections = PIPE_CONNECTIONS[type];
  const entryDirection = OPPOSITE_DIRECTION[fromDirection];
  
  if (!connections.includes(entryDirection)) {
    return []; // Cannot enter from this direction
  }
  
  // Exit through all other connections
  return connections.filter(dir => dir !== entryDirection);
}

// Get the opposite direction
export function getOppositeDirection(dir: Direction): Direction {
  return OPPOSITE_DIRECTION[dir];
}

// Generate a random pipe type using weighted distribution
export function generateRandomPipe(): PipeType {
  const totalWeight = Object.values(PIPE_WEIGHTS).reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (const [type, weight] of Object.entries(PIPE_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return type as PipeType;
    }
  }
  
  // Fallback (shouldn't happen)
  return 'horizontal';
}

// Create a new pipe data object
export function createPipe(type: PipeType): PipeData {
  return {
    type,
    connections: getPipeConnections(type),
    waterLevel: 0,
    waterFrom: null,
  };
}

// Get all pipe types
export function getAllPipeTypes(): PipeType[] {
  return Object.keys(PIPE_CONNECTIONS) as PipeType[];
}

// Check if a pipe type is a cross (can be traversed twice)
export function isCrossPipe(type: PipeType): boolean {
  return type === 'cross';
}
