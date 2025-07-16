/**
 * @fileoverview Ranking engine for sorting and filtering rider data
 * Handles getting top performers from different categories
 */

/**
 * Engine for ranking and filtering riders
 */
class RankingEngine {
    constructor() {
        // Configuration for ranking logic
        this.config = {
            minValidPoints: 0,
            minValidPosition: 1,
            maxValidPosition: 1000
        };
    }

    /**
     * Get top N riders from a list
     * @param {Rider[]} riders - Array of riders
     * @param {number} count - Number of top riders to return
     * @returns {Rider[]} Top N riders
     */
    getTopRiders(riders, count) {
        if (!Array.isArray(riders) || riders.length === 0) {
            return [];
        }

        // Filter valid entries first
        const validRiders = this.filterValidEntries(riders);
        
        // Sort by points (primary) and position (secondary)
        const sortedRiders = this.sortByPoints(validRiders);
        
        // Return top N riders
        return sortedRiders.slice(0, Math.max(0, count));
    }

    /**
     * Sort riders by points (descending) and position (ascending) as tiebreaker
     * @param {Rider[]} riders - Array of riders to sort
     * @returns {Rider[]} Sorted array of riders
     */
    sortByPoints(riders) {
        if (!Array.isArray(riders)) {
            return [];
        }

        return [...riders].sort((a, b) => {
            // Primary sort: by points (descending)
            const pointsDiff = b.points - a.points;
            if (pointsDiff !== 0) {
                return pointsDiff;
            }

            // Secondary sort: by position (ascending) - lower position is better
            const positionDiff = a.position - b.position;
            if (positionDiff !== 0) {
                return positionDiff;
            }

            // Tertiary sort: by name (alphabetical) for consistency
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Sort riders by position (ascending)
     * @param {Rider[]} riders - Array of riders to sort
     * @returns {Rider[]} Sorted array of riders
     */
    sortByPosition(riders) {
        if (!Array.isArray(riders)) {
            return [];
        }

        return [...riders].sort((a, b) => {
            // Primary sort: by position (ascending)
            const positionDiff = a.position - b.position;
            if (positionDiff !== 0) {
                return positionDiff;
            }

            // Secondary sort: by points (descending) as tiebreaker
            const pointsDiff = b.points - a.points;
            if (pointsDiff !== 0) {
                return pointsDiff;
            }

            // Tertiary sort: by name (alphabetical)
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Filter out invalid or incomplete rider entries
     * @param {Rider[]} riders - Array of riders to filter
     * @returns {Rider[]} Filtered array of valid riders
     */
    filterValidEntries(riders) {
        if (!Array.isArray(riders)) {
            return [];
        }

        return riders.filter(rider => this.isValidRider(rider));
    }

    /**
     * Check if a rider entry is valid
     * @param {Rider} rider - Rider to validate
     * @returns {boolean} True if rider is valid
     */
    isValidRider(rider) {
        if (!rider || typeof rider !== 'object') {
            return false;
        }

        // Check required fields
        if (!rider.name || typeof rider.name !== 'string' || rider.name.trim().length === 0) {
            return false;
        }

        if (typeof rider.points !== 'number' || isNaN(rider.points)) {
            return false;
        }

        if (typeof rider.position !== 'number' || isNaN(rider.position)) {
            return false;
        }

        if (!rider.category || typeof rider.category !== 'string') {
            return false;
        }

        // Check value ranges
        if (rider.points < this.config.minValidPoints) {
            return false;
        }

        if (rider.position < this.config.minValidPosition || 
            rider.position > this.config.maxValidPosition) {
            return false;
        }

        return true;
    }

    /**
     * Get riders by category
     * @param {Rider[]} riders - Array of all riders
     * @param {string} category - Category to filter by
     * @returns {Rider[]} Riders in the specified category
     */
    getRidersByCategory(riders, category) {
        if (!Array.isArray(riders) || !category) {
            return [];
        }

        return riders.filter(rider => rider.category === category);
    }

    /**
     * Get ranking statistics for a set of riders
     * @param {Rider[]} riders - Array of riders
     * @returns {Object} Statistics object
     */
    getRankingStats(riders) {
        if (!Array.isArray(riders) || riders.length === 0) {
            return {
                totalRiders: 0,
                validRiders: 0,
                averagePoints: 0,
                maxPoints: 0,
                minPoints: 0
            };
        }

        const validRiders = this.filterValidEntries(riders);
        const points = validRiders.map(r => r.points);

        return {
            totalRiders: riders.length,
            validRiders: validRiders.length,
            averagePoints: points.length > 0 ? points.reduce((a, b) => a + b, 0) / points.length : 0,
            maxPoints: points.length > 0 ? Math.max(...points) : 0,
            minPoints: points.length > 0 ? Math.min(...points) : 0
        };
    }

    /**
     * Find riders with tied scores
     * @param {Rider[]} riders - Array of riders
     * @returns {Rider[][]} Array of arrays, each containing riders with the same points
     */
    findTiedRiders(riders) {
        if (!Array.isArray(riders) || riders.length === 0) {
            return [];
        }

        const validRiders = this.filterValidEntries(riders);
        const pointsGroups = new Map();

        // Group riders by points
        validRiders.forEach(rider => {
            const points = rider.points;
            if (!pointsGroups.has(points)) {
                pointsGroups.set(points, []);
            }
            pointsGroups.get(points).push(rider);
        });

        // Return only groups with more than one rider (ties)
        return Array.from(pointsGroups.values()).filter(group => group.length > 1);
    }

    /**
     * Get the position range for top N riders
     * @param {Rider[]} riders - Array of riders
     * @param {number} count - Number of top riders to consider
     * @returns {Object} Position range information
     */
    getTopRidersPositionRange(riders, count) {
        const topRiders = this.getTopRiders(riders, count);
        
        if (topRiders.length === 0) {
            return { min: 0, max: 0, range: 0 };
        }

        const positions = topRiders.map(r => r.position).filter(p => p > 0);
        
        if (positions.length === 0) {
            return { min: 0, max: 0, range: 0 };
        }

        const min = Math.min(...positions);
        const max = Math.max(...positions);

        return {
            min,
            max,
            range: max - min
        };
    }

    /**
     * Update ranking configuration
     * @param {Object} newConfig - New configuration values
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Reset ranking configuration to defaults
     */
    resetConfig() {
        this.config = {
            minValidPoints: 0,
            minValidPosition: 1,
            maxValidPosition: 1000
        };
    }
}

export { RankingEngine };