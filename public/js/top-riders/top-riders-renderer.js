/**
 * @fileoverview UI renderer for top riders tables
 * Handles HTML generation and DOM manipulation for displaying rider data
 */

import { CSS_CLASSES, ERROR_MESSAGES } from './constants.js';

/**
 * Renderer for creating and managing top riders UI components
 */
class TopRidersRenderer {
    constructor() {
        this.containerElement = null;
        this.isRendered = false;
    }

    /**
     * Render the complete top riders section
     * @param {TopRidersData} topRidersData - Data to render
     * @returns {HTMLElement} The rendered container element
     */
    renderTopRidersSection(topRidersData) {
        try {
            // Create main container
            const container = this.createContainer();
            
            // Add section title
            const title = this.createSectionTitle('Top Riders');
            container.appendChild(title);

            // Create tables container
            const tablesContainer = this.createTablesContainer();

            // Render Main League table
            if (topRidersData.mainLeague && topRidersData.mainLeague.length > 0) {
                const mlTable = this.createLeagueTable(topRidersData.mainLeague, 'Main League - Top 10');
                tablesContainer.appendChild(mlTable);
            }

            // Render Development League table (only if data exists)
            if (topRidersData.developmentLeague && topRidersData.developmentLeague.length > 0) {
                const dlTable = this.createLeagueTable(topRidersData.developmentLeague, 'Development League - Top 10');
                tablesContainer.appendChild(dlTable);
            }

            // Render Prime tables (only if data exists)
            let hasPrimeData = false;
            const primeContainer = this.createPrimeTablesContainer();
            
            if (topRidersData.prime1 && topRidersData.prime1.length > 0) {
                const prime1Table = this.createPrimeTable(topRidersData.prime1, 'Prime Competition 1 - Top 5');
                primeContainer.appendChild(prime1Table);
                hasPrimeData = true;
            }

            if (topRidersData.prime2 && topRidersData.prime2.length > 0) {
                const prime2Table = this.createPrimeTable(topRidersData.prime2, 'Prime Competition 2 - Top 5');
                primeContainer.appendChild(prime2Table);
                hasPrimeData = true;
            }

            // Only add prime container if there's actually prime data
            if (hasPrimeData) {
                tablesContainer.appendChild(primeContainer);
            }
            container.appendChild(tablesContainer);

            // Add last updated info
            if (topRidersData.lastUpdated) {
                const lastUpdated = this.createLastUpdatedInfo(topRidersData.lastUpdated);
                container.appendChild(lastUpdated);
            }

            this.containerElement = container;
            this.isRendered = true;

            return container;
        } catch (error) {
            console.error('Error rendering top riders section:', error);
            return this.createErrorElement(ERROR_MESSAGES.GENERIC_ERROR);
        }
    }

    /**
     * Create a league table (ML or DL)
     * @param {Rider[]} riders - Array of riders
     * @param {string} title - Table title
     * @returns {HTMLElement} Table element
     */
    createLeagueTable(riders, title) {
        const section = this.createTableSection(title);
        const table = this.createTable();
        
        // Create header
        const header = this.createTableHeader(['Position', 'Rider', 'Points', 'Club']);
        table.appendChild(header);

        // Create body
        const tbody = document.createElement('tbody');
        
        riders.forEach((rider, index) => {
            const position = rider.position || (index + 1);
            const isLeader = position === 1 || position === '1';
            
            const row = this.createTableRow([
                position,
                isLeader ? this.createRiderWithJersey(rider.name, 'yellow') : rider.name,
                rider.points,
                rider.club || '-'
            ]);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        section.appendChild(table);
        
        return section;
    }

    /**
     * Create a prime table
     * @param {Rider[]} riders - Array of riders
     * @param {string} title - Table title
     * @returns {HTMLElement} Table element
     */
    createPrimeTable(riders, title) {
        const section = this.createTableSection(title);
        const table = this.createTable();
        
        // Create header (Prime tables might not have positions)
        const header = this.createTableHeader(['Rank', 'Rider', 'Prime Points']);
        table.appendChild(header);

        // Create body
        const tbody = document.createElement('tbody');
        
        riders.forEach((rider, index) => {
            const rank = index + 1;
            const isLeader = rank === 1;
            
            const row = this.createTableRow([
                rank,
                isLeader ? this.createRiderWithJersey(rider.name, 'green') : rider.name,
                rider.points
            ]);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        section.appendChild(table);
        
        return section;
    }

    /**
     * Create main container element
     * @returns {HTMLElement} Container div
     */
    createContainer() {
        const container = document.createElement('div');
        container.className = CSS_CLASSES.CONTAINER;
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Top Riders Summary');
        return container;
    }

    /**
     * Create section title
     * @param {string} titleText - Title text
     * @returns {HTMLElement} Title element
     */
    createSectionTitle(titleText) {
        const title = document.createElement('h2');
        title.className = CSS_CLASSES.HEADER;
        title.textContent = titleText;
        return title;
    }

    /**
     * Create tables container
     * @returns {HTMLElement} Tables container div
     */
    createTablesContainer() {
        const container = document.createElement('div');
        container.className = 'top-riders-tables';
        return container;
    }

    /**
     * Create prime tables container
     * @returns {HTMLElement} Prime tables container div
     */
    createPrimeTablesContainer() {
        const container = document.createElement('div');
        container.className = 'prime-tables-container';
        return container;
    }

    /**
     * Create a table section with title
     * @param {string} title - Section title
     * @returns {HTMLElement} Section element
     */
    createTableSection(title) {
        const section = document.createElement('div');
        section.className = CSS_CLASSES.SECTION;
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.className = 'table-title';
        
        section.appendChild(titleElement);
        return section;
    }

    /**
     * Create a table element
     * @returns {HTMLElement} Table element
     */
    createTable() {
        const table = document.createElement('table');
        table.className = CSS_CLASSES.TABLE;
        table.setAttribute('role', 'table');
        return table;
    }

    /**
     * Create table header
     * @param {string[]} headers - Array of header texts
     * @returns {HTMLElement} Table header element
     */
    createTableHeader(headers) {
        const thead = document.createElement('thead');
        const row = document.createElement('tr');
        
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.setAttribute('scope', 'col');
            row.appendChild(th);
        });
        
        thead.appendChild(row);
        return thead;
    }

    /**
     * Create table row
     * @param {(string|number|HTMLElement)[]} cells - Array of cell values
     * @returns {HTMLElement} Table row element
     */
    createTableRow(cells) {
        const row = document.createElement('tr');
        
        cells.forEach((cellValue, index) => {
            const td = document.createElement('td');
            
            // Handle HTML elements vs text content
            if (cellValue instanceof HTMLElement) {
                td.appendChild(cellValue);
            } else {
                td.textContent = cellValue;
            }
            
            // Add data attributes for styling
            if (index === 0) {
                td.setAttribute('data-label', 'Position');
            } else if (index === 1) {
                td.setAttribute('data-label', 'Rider');
            } else if (index === 2) {
                td.setAttribute('data-label', 'Points');
            } else if (index === 3) {
                td.setAttribute('data-label', 'Club');
            }
            
            row.appendChild(td);
        });
        
        return row;
    }

    /**
     * Create rider name with jersey icon
     * @param {string} riderName - Name of the rider
     * @param {string} jerseyColor - Color of jersey ('yellow' or 'green')
     * @returns {HTMLElement} Span element with jersey icon and rider name
     */
    createRiderWithJersey(riderName, jerseyColor) {
        const container = document.createElement('span');
        
        // Create jersey icon
        const jersey = document.createElement('span');
        jersey.className = `jersey-icon ${jerseyColor}-jersey`;
        jersey.setAttribute('aria-label', `${jerseyColor} jersey leader`);
        jersey.setAttribute('title', `${jerseyColor === 'yellow' ? 'League' : 'Prime'} Leader`);
        
        // Add rider name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = riderName;
        
        container.appendChild(jersey);
        container.appendChild(nameSpan);
        
        return container;
    }

    /**
     * Create last updated information element
     * @param {Date} lastUpdated - Last update timestamp
     * @returns {HTMLElement} Last updated element
     */
    createLastUpdatedInfo(lastUpdated) {
        const info = document.createElement('div');
        info.className = 'last-updated-info';
        
        const timeString = lastUpdated.toLocaleString();
        info.textContent = `Last updated: ${timeString}`;
        
        return info;
    }

    /**
     * Create loading indicator
     * @returns {HTMLElement} Loading element
     */
    createLoadingElement() {
        const loading = document.createElement('div');
        loading.className = CSS_CLASSES.LOADING;
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading top riders...</p>
        `;
        loading.setAttribute('role', 'status');
        loading.setAttribute('aria-label', 'Loading top riders data');
        return loading;
    }

    /**
     * Create error message element
     * @param {string} message - Error message
     * @returns {HTMLElement} Error element
     */
    createErrorElement(message) {
        const error = document.createElement('div');
        error.className = CSS_CLASSES.ERROR;
        error.innerHTML = `
            <p>${message}</p>
            <button class="${CSS_CLASSES.REFRESH_BTN}" type="button">Try Again</button>
        `;
        error.setAttribute('role', 'alert');
        return error;
    }

    /**
     * Create empty state element
     * @returns {HTMLElement} Empty state element
     */
    createEmptyStateElement() {
        const empty = document.createElement('div');
        empty.className = 'top-riders-empty';
        empty.innerHTML = `
            <p>No rider data available at this time.</p>
            <p>Please check back later or refresh the page.</p>
        `;
        return empty;
    }

    /**
     * Apply responsive styles (called after rendering)
     */
    applyResponsiveStyles() {
        if (!this.containerElement) {
            return;
        }

        // Add responsive classes based on container width
        const containerWidth = this.containerElement.offsetWidth;
        
        if (containerWidth < 768) {
            this.containerElement.classList.add('mobile-layout');
        } else if (containerWidth < 1024) {
            this.containerElement.classList.add('tablet-layout');
        } else {
            this.containerElement.classList.add('desktop-layout');
        }
    }

    /**
     * Update existing rendered content
     * @param {TopRidersData} newData - New data to render
     */
    updateContent(newData) {
        if (!this.isRendered || !this.containerElement) {
            console.warn('Cannot update content - not yet rendered');
            return;
        }

        // Clear existing content
        this.containerElement.innerHTML = '';
        
        // Re-render with new data
        const newContent = this.renderTopRidersSection(newData);
        this.containerElement.innerHTML = newContent.innerHTML;
        
        // Reapply responsive styles
        this.applyResponsiveStyles();
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
            this.containerElement.appendChild(this.createLoadingElement());
        }
    }

    /**
     * Show error state
     * @param {string} message - Error message to display
     */
    showError(message) {
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
            this.containerElement.appendChild(this.createErrorElement(message));
        }
    }

    /**
     * Clean up renderer resources
     */
    destroy() {
        this.containerElement = null;
        this.isRendered = false;
    }
}

export { TopRidersRenderer };