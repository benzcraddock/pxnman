import { DIRECTIONS, OBJECT_TYPE } from './setup'

// Random movement
export function randomMovement(position, direction, objectExist) {
  let dir = direction
  let nextMovePos = position + dir.movement

  // Create array from directions object keys
  // Obtain keys and put them in an array
  const keys = Object.keys(DIRECTIONS)

  while(
    objectExist(nextMovePos, OBJECT_TYPE.WALL) ||
    objectExist(nextMovePos, OBJECT_TYPE.PHANTOM)
  ) {
    // Obtain random key from key array
    const key = keys[Math.floor(Math.random() * keys.length)]
    // Set next move part 1
    dir = DIRECTIONS[key]
    // Set next move part 2
    nextMovePos = position + dir.movement
  }

  return { nextMovePos, direction: dir }
}
