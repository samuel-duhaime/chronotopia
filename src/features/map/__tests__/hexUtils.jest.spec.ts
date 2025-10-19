import { calculateHexRotation, calculateShortestRotation } from '../hexUtils';

describe('hexUtils', () => {
    describe('calculateHexRotation', () => {
        it('should calculate rotation for North movement (even column)', () => {
            expect(calculateHexRotation({ fromX: 4, fromY: 5, toX: 4, toY: 4 })).toBe(0);
        });

        it('should calculate rotation for North-East movement (even column)', () => {
            expect(calculateHexRotation({ fromX: 4, fromY: 5, toX: 5, toY: 4 })).toBe(60);
        });

        it('should calculate rotation for South-East movement (even column)', () => {
            expect(calculateHexRotation({ fromX: 4, fromY: 5, toX: 5, toY: 5 })).toBe(120);
        });

        it('should calculate rotation for South movement', () => {
            expect(calculateHexRotation({ fromX: 4, fromY: 5, toX: 4, toY: 6 })).toBe(180);
            expect(calculateHexRotation({ fromX: 5, fromY: 5, toX: 5, toY: 6 })).toBe(180);
        });

        it('should calculate rotation for South-West movement (even column)', () => {
            expect(calculateHexRotation({ fromX: 4, fromY: 5, toX: 3, toY: 5 })).toBe(240);
        });

        it('should calculate rotation for North-West movement (even column)', () => {
            expect(calculateHexRotation({ fromX: 4, fromY: 5, toX: 3, toY: 4 })).toBe(300);
        });

        it('should calculate rotation for odd column movements', () => {
            expect(calculateHexRotation({ fromX: 5, fromY: 5, toX: 5, toY: 4 })).toBe(0); // North
            expect(calculateHexRotation({ fromX: 5, fromY: 5, toX: 6, toY: 5 })).toBe(60); // North-East
            expect(calculateHexRotation({ fromX: 5, fromY: 5, toX: 6, toY: 6 })).toBe(120); // South-East
            expect(calculateHexRotation({ fromX: 5, fromY: 5, toX: 4, toY: 6 })).toBe(240); // South-West
            expect(calculateHexRotation({ fromX: 5, fromY: 5, toX: 4, toY: 5 })).toBe(300); // North-West
        });

        it('should handle non-adjacent hex movements by throwing error', () => {
            expect(() => calculateHexRotation({ fromX: 0, fromY: 0, toX: 2, toY: 0 })).toThrow(); // Two hexes away
            expect(() => calculateHexRotation({ fromX: 5, fromY: 5, toX: 7, toY: 7 })).toThrow(); // Diagonal non-adjacent
            expect(() => calculateHexRotation({ fromX: 3, fromY: 3, toX: 6, toY: 3 })).toThrow(); // Three hexes horizontally
        });

        it('should handle edge cases with extreme coordinates', () => {
            expect(calculateHexRotation({ fromX: 0, fromY: 0, toX: 0, toY: 1 })).toBe(180); // South from origin
            expect(calculateHexRotation({ fromX: 10, fromY: 10, toX: 10, toY: 9 })).toBe(0); // North from corner
        });

        it('should calculate rotation for North-East movement (odd column)', () => {
            expect(calculateHexRotation({ fromX: 3, fromY: 5, toX: 4, toY: 5 })).toBe(60);
        });

        it('should calculate rotation for South-East movement (odd column)', () => {
            expect(calculateHexRotation({ fromX: 3, fromY: 5, toX: 4, toY: 6 })).toBe(120);
        });

        it('should calculate rotation for South-West movement (odd column)', () => {
            expect(calculateHexRotation({ fromX: 3, fromY: 5, toX: 2, toY: 6 })).toBe(240);
        });

        it('should calculate rotation for North-West movement (odd column)', () => {
            expect(calculateHexRotation({ fromX: 3, fromY: 5, toX: 2, toY: 5 })).toBe(300);
        });

        it('should handle boundary cases for hex grid', () => {
            // Test movements at grid boundaries
            expect(calculateHexRotation({ fromX: 0, fromY: 0, toX: 1, toY: 0 })).toBe(120); // South-East from (0,0)
            expect(calculateHexRotation({ fromX: 1, fromY: 1, toX: 0, toY: 1 })).toBe(300); // North-West to (0,1)
        });

        it('should calculate rotations for all valid adjacent movements from even column', () => {
            const fromX = 2,
                fromY = 3;

            // All 6 directions from even column
            expect(calculateHexRotation({ fromX, fromY, toX: fromX, toY: fromY - 1 })).toBe(0); // North
            expect(calculateHexRotation({ fromX, fromY, toX: fromX + 1, toY: fromY - 1 })).toBe(60); // North-East
            expect(calculateHexRotation({ fromX, fromY, toX: fromX + 1, toY: fromY })).toBe(120); // South-East
            expect(calculateHexRotation({ fromX, fromY, toX: fromX, toY: fromY + 1 })).toBe(180); // South
            expect(calculateHexRotation({ fromX, fromY, toX: fromX - 1, toY: fromY })).toBe(240); // South-West
            expect(calculateHexRotation({ fromX, fromY, toX: fromX - 1, toY: fromY - 1 })).toBe(300); // North-West
        });

        it('should calculate rotations for all valid adjacent movements from odd column', () => {
            const fromX = 3,
                fromY = 3;

            // All 6 directions from odd column
            expect(calculateHexRotation({ fromX, fromY, toX: fromX, toY: fromY - 1 })).toBe(0); // North
            expect(calculateHexRotation({ fromX, fromY, toX: fromX + 1, toY: fromY })).toBe(60); // North-East
            expect(calculateHexRotation({ fromX, fromY, toX: fromX + 1, toY: fromY + 1 })).toBe(120); // South-East
            expect(calculateHexRotation({ fromX, fromY, toX: fromX, toY: fromY + 1 })).toBe(180); // South
            expect(calculateHexRotation({ fromX, fromY, toX: fromX - 1, toY: fromY + 1 })).toBe(240); // South-West
            expect(calculateHexRotation({ fromX, fromY, toX: fromX - 1, toY: fromY })).toBe(300); // North-West
        });

        it('should throw error for invalid movements', () => {
            // Test that the function throws for truly invalid movements
            expect(() => calculateHexRotation({ fromX: 5, fromY: 5, toX: 5, toY: 5 })).toThrow(
                'Invalid hex movement from (5, 5) to (5, 5)'
            );
            expect(() => calculateHexRotation({ fromX: 5, fromY: 5, toX: 8, toY: 8 })).toThrow(
                'Invalid hex movement from (5, 5) to (8, 8)'
            );
            expect(() => calculateHexRotation({ fromX: 0, fromY: 0, toX: 2, toY: 0 })).toThrow(
                'Invalid hex movement from (0, 0) to (2, 0)'
            );
        });
    });

    describe('calculateShortestRotation', () => {
        it('should return the same angle when current and target are equal', () => {
            const angle = Math.PI / 4; // 45 degrees
            const result = calculateShortestRotation({
                currentRotationRad: angle,
                targetRotationRad: angle
            });
            expect(result).toBeCloseTo(angle);
        });

        it('should take the shorter clockwise path', () => {
            const current = 0; // 0 degrees
            const target = Math.PI / 2; // 90 degrees
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            expect(result).toBeCloseTo(Math.PI / 2);
        });

        it('should take the shorter counter-clockwise path', () => {
            const current = Math.PI / 2; // 90 degrees
            const target = 0; // 0 degrees
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            expect(result).toBeCloseTo(0);
        });

        it('should handle rotation greater than 180 degrees by going the other way', () => {
            const current = 0; // 0 degrees
            const target = (3 * Math.PI) / 2; // 270 degrees
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            // Should go counter-clockwise to -90 degrees instead of clockwise to 270
            expect(result).toBeCloseTo(-Math.PI / 2);
        });

        it('should handle negative rotations correctly', () => {
            const current = -Math.PI / 4; // -45 degrees
            const target = Math.PI / 4; // 45 degrees
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            expect(result).toBeCloseTo(Math.PI / 4);
        });

        it('should handle large positive rotation differences', () => {
            const current = 0;
            const target = 2 * Math.PI + Math.PI / 4; // 405 degrees (45 degrees after full rotation)
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            expect(result).toBeCloseTo(Math.PI / 4);
        });

        it('should handle large negative rotation differences', () => {
            const current = 0;
            const target = -2 * Math.PI - Math.PI / 4; // -405 degrees (-45 degrees after full rotation)
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            expect(result).toBeCloseTo(-Math.PI / 4);
        });

        it('should normalize rotations that differ by exactly PI', () => {
            const current = 0;
            const target = Math.PI; // 180 degrees
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            // Either direction is equally valid for 180 degrees
            expect(Math.abs(result)).toBeCloseTo(Math.PI);
        });

        it('should handle multiple full rotations in difference', () => {
            const current = Math.PI / 6; // 30 degrees
            const target = Math.PI / 6 + 4 * Math.PI; // 30 + 720 degrees
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            expect(result).toBeCloseTo(Math.PI / 6);
        });

        it('should handle edge case where difference is slightly over PI', () => {
            const current = 0;
            const target = Math.PI + 0.1; // Slightly over 180 degrees
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            // Should go the shorter way (counter-clockwise)
            expect(result).toBeCloseTo(-Math.PI + 0.1);
        });

        it('should handle edge case where difference is slightly under PI', () => {
            const current = 0;
            const target = Math.PI - 0.1; // Slightly under 180 degrees
            const result = calculateShortestRotation({
                currentRotationRad: current,
                targetRotationRad: target
            });
            // Should go clockwise
            expect(result).toBeCloseTo(Math.PI - 0.1);
        });
    });
});
