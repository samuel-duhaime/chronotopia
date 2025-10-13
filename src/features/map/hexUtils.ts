// Utility functions for hexagonal grid calculations

/**
 * Calculate rotation angle for fleet movement in odd-q vertical layout
 * @param fromX - Source hex x coordinate
 * @param fromY - Source hex y coordinate
 * @param toX - Destination hex x coordinate
 * @param toY - Destination hex y coordinate
 * @returns Rotation angle in degrees (0-360)
 */
export const calculateHexRotation = ({
    fromX,
    fromY,
    toX,
    toY
}: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}): number => {
    // Calculate movement delta
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const isEvenColumn = fromX % 2 === 0;
    let rotation = 0;

    // For odd-q vertical layout, calculate angle based on columns
    if (isEvenColumn) {
        // Even column directions
        if (deltaX === 0 && deltaY === -1) rotation = 0; // North
        if (deltaX === 1 && deltaY === -1) rotation = 60; // North-East
        if (deltaX === 1 && deltaY === 0) rotation = 120; // South-East
        if (deltaX === 0 && deltaY === 1) rotation = 180; // South
        if (deltaX === -1 && deltaY === 0) rotation = 240; // South-West
        if (deltaX === -1 && deltaY === -1) rotation = 300; // North-West
    } else {
        // Odd column directions
        if (deltaX === 0 && deltaY === -1) rotation = 0; // North
        if (deltaX === 1 && deltaY === 0) rotation = 60; // North-East
        if (deltaX === 1 && deltaY === 1) rotation = 120; // South-East
        if (deltaX === 0 && deltaY === 1) rotation = 180; // South
        if (deltaX === -1 && deltaY === 1) rotation = 240; // South-West
        if (deltaX === -1 && deltaY === 0) rotation = 300; // North-West
    }

    return rotation;
};

/**
 * Calculate the shortest rotation path between two angles
 * @param currentRotationRad - Current rotation in radians
 * @param targetRotationRad - Target rotation in radians
 * @returns Final rotation in radians taking the shortest path
 */
export const calculateShortestRotation = ({
    currentRotationRad,
    targetRotationRad
}: {
    currentRotationRad: number;
    targetRotationRad: number;
}): number => {
    // Calculate rotation difference
    let rotationDiff = targetRotationRad - currentRotationRad;

    // Normalize to shortest path (-π to π)
    while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
    while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

    // Return final rotation
    return currentRotationRad + rotationDiff;
};
