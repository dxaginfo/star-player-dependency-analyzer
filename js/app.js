/**
 * Star Player Dependency Analyzer
 * Main Application JavaScript
 */

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    const app = new DependencyAnalyzer();
    app.init();
});

/**
 * Main DependencyAnalyzer class that handles the entire application
 */
class DependencyAnalyzer {
    constructor() {
        // Main data structures
        this.players = [];
        this.assessmentAreas = [
            { id: 'revenue', name: 'Revenue Generation', weight: 5 },
            { id: 'fans', name: 'Fan Engagement', weight: 4 },
            { id: 'performance', name: 'Team Performance', weight: 5 },
            { id: 'brand', name: 'Brand Reputation', weight: 3 },
            { id: 'innovation', name: 'Innovation/Strategy', weight: 3 }
        ];
        this.currentSection = 'intro';
        this.charts = {}; // Store chart instances for updates
    }

    /**
     * Initialize the application
     */
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for saved data
        this.loadSavedData();
        
        // Initialize UI
        this.updatePlayersList();
        this.renderAssessmentForm();
        this.showSection('intro');
    }

    /**
     * Set up all event listeners for the application
     */
    setupEventListeners() {
        // Section navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showSection(e.target.dataset.section);
            });
        });

        // Player management
        document.getElementById('add-player-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPlayerFromForm();
        });

        // Assessment form submission
        document.getElementById('assessment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processAssessment();
        });

        // Weight controls
        document.querySelectorAll('.weight-control').forEach(control => {
            control.addEventListener('input', (e) => {
                const areaId = e.target.dataset.area;
                const weight = parseInt(e.target.value);
                this.updateAreaWeight(areaId, weight);
            });
        });

        // Data management
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveData();
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e);
        });

        // CSV import/export
        document.getElementById('export-csv-btn').addEventListener('click', () => {
            this.exportCSV();
        });

        document.getElementById('import-csv-btn').addEventListener('click', () => {
            document.getElementById('csv-import-file').click();
        });

        document.getElementById('csv-import-file').addEventListener('change', (e) => {
            this.importCSV(e);
        });
    }

    /**
     * Display the specified section and hide all others
     * @param {string} sectionId - The ID of the section to display
     */
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionId}-section`).classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll(`.nav-link[data-section="${sectionId}"]`).forEach(link => {
            link.classList.add('active');
        });
        
        this.currentSection = sectionId;
    }

    /**
     * Add a new player from the form input
     */
    addPlayerFromForm() {
        const nameInput = document.getElementById('player-name');
        const positionInput = document.getElementById('player-position');
        const customInput = document.getElementById('player-custom');
        
        const player = {
            id: Date.now(),
            name: nameInput.value.trim(),
            position: positionInput.value.trim(),
            custom: customInput.value.trim(),
            assessments: {}
        };
        
        this.players.push(player);
        this.updatePlayersList();
        this.renderAssessmentForm();
        
        // Reset form
        nameInput.value = '';
        positionInput.value = '';
        customInput.value = '';
        nameInput.focus();
        
        // Enable continue button if we have players
        document.getElementById('continue-to-assessment-btn').disabled = this.players.length === 0;
    }

    /**
     * Remove a player from the list
     * @param {number} playerId - The ID of the player to remove
     */
    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        this.updatePlayersList();
        this.renderAssessmentForm();
        
        // Disable continue button if no players
        document.getElementById('continue-to-assessment-btn').disabled = this.players.length === 0;
    }

    /**
     * Update the UI list of players
     */
    updatePlayersList() {
        const tableBody = document.getElementById('players-table-body');
        const noPlayersRow = document.getElementById('no-players-row');
        const playerCount = document.getElementById('player-count');
        
        // Clear existing rows
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        
        if (this.players.length === 0) {
            tableBody.appendChild(noPlayersRow);
            playerCount.textContent = '0 players added';
            return;
        }
        
        // Add player rows
        this.players.forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.position}</td>
                <td>${player.custom || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger remove-player-btn" data-id="${player.id}">
                        Remove
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = parseInt(e.target.dataset.id);
                this.removePlayer(playerId);
            });
        });
        
        // Update player count
        playerCount.textContent = `${this.players.length} player${this.players.length !== 1 ? 's' : ''} added`;
    }

    /**
     * Render the assessment form based on players and areas
     */
    renderAssessmentForm() {
        const tableBody = document.getElementById('assessment-table-body');
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add player rows
        this.players.forEach(player => {
            const row = document.createElement('tr');
            
            let cellsHtml = `<td class="fw-bold">${player.name}</td>`;
            
            // Add a cell for each assessment area
            this.assessmentAreas.forEach(area => {
                const currentValue = player.assessments[area.id] || 5; // Default to middle value
                cellsHtml += `
                    <td class="rating-cell">
                        <select class="form-select form-select-sm assessment-select" 
                                data-player="${player.id}" 
                                data-area="${area.id}">
                            ${this.generateRatingOptions(currentValue)}
                        </select>
                    </td>
                `;
            });
            
            row.innerHTML = cellsHtml;
            tableBody.appendChild(row);
        });
    }

    /**
     * Generate HTML options for rating selects
     * @param {number} selectedValue - The currently selected value
     * @returns {string} HTML option elements
     */
    generateRatingOptions(selectedValue) {
        let options = '';
        for (let i = 1; i <= 10; i++) {
            options += `<option value="${i}" ${i === selectedValue ? 'selected' : ''}>${i}</option>`;
        }
        return options;
    }

    /**
     * Update the weight of an assessment area
     * @param {string} areaId - The ID of the area to update
     * @param {number} weight - The new weight value
     */
    updateAreaWeight(areaId, weight) {
        const area = this.assessmentAreas.find(a => a.id === areaId);
        if (area) {
            area.weight = weight;
        }
    }

    /**
     * Process the assessment form and calculate dependency scores
     */
    processAssessment() {
        // Gather all assessment values from the form
        document.querySelectorAll('.assessment-select').forEach(select => {
            const playerId = parseInt(select.dataset.player);
            const areaId = select.dataset.area;
            const value = parseInt(select.value);
            
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                player.assessments[areaId] = value;
            }
        });
        
        this.calculateDependencyScores();
        this.generateRecommendations();
        this.renderResults();
        this.showSection('results');
    }

    /**
     * Calculate dependency scores for all players
     */
    calculateDependencyScores() {
        this.players.forEach(player => {
            let totalScore = 0;
            let totalWeight = 0;
            let highestAreaId = null;
            let highestAreaScore = 0;
            
            this.assessmentAreas.forEach(area => {
                if (player.assessments[area.id]) {
                    const weightedScore = player.assessments[area.id] * area.weight;
                    totalScore += weightedScore;
                    totalWeight += area.weight;
                    
                    // Track the highest impact area
                    if (weightedScore > highestAreaScore) {
                        highestAreaScore = weightedScore;
                        highestAreaId = area.id;
                    }
                }
            });
            
            // Calculate weighted average and round to 1 decimal place
            player.dependencyScore = totalWeight > 0 ? 
                Math.round((totalScore / totalWeight) * 10) / 10 : 0;
            
            // Store highest impact area
            player.highestImpactArea = highestAreaId;
                
            // Categorize risk level
            if (player.dependencyScore >= 8) {
                player.riskLevel = 'high';
            } else if (player.dependencyScore >= 5) {
                player.riskLevel = 'medium';
            } else {
                player.riskLevel = 'low';
            }
        });
    }

    /**
     * Generate recommendations based on dependency scores
     */
    generateRecommendations() {
        // Clear previous recommendations
        this.organizationalRecommendations = {
            structural: [],
            process: [],
            culture: []
        };
        
        // Generate specific recommendations for each player
        this.players.forEach(player => {
            player.recommendations = [];
            
            if (player.riskLevel === 'high') {
                player.recommendations.push(
                    'Develop a succession plan immediately',
                    'Create knowledge transfer protocols',
                    'Implement cross-training for critical skills',
                    'Diversify responsibilities across the organization'
                );
                
                // Add org recommendations based on high-risk players
                if (player.highestImpactArea === 'revenue') {
                    this.organizationalRecommendations.structural.push(
                        'Develop multiple revenue streams to reduce dependency on key revenue generators'
                    );
                } else if (player.highestImpactArea === 'fans') {
                    this.organizationalRecommendations.structural.push(
                        'Create a team-focused fan engagement strategy rather than individual-focused marketing'
                    );
                } else if (player.highestImpactArea === 'performance') {
                    this.organizationalRecommendations.process.push(
                        'Implement a system-based performance framework rather than relying on individual brilliance'
                    );
                }
            } else if (player.riskLevel === 'medium') {
                player.recommendations.push(
                    'Identify potential successors for key responsibilities',
                    'Document critical processes and knowledge',
                    'Create development plans for backup personnel'
                );
            } else {
                player.recommendations.push(
                    'Maintain current approach, no immediate action required',
                    'Regular skill assessment to monitor dependency'
                );
            }
        });
        
        // Add default organizational recommendations
        this.organizationalRecommendations.structural.push(
            'Create a formal succession planning process for all key positions',
            'Establish a cross-functional team structure to distribute knowledge and skills'
        );
        
        this.organizationalRecommendations.process.push(
            'Implement regular dependency assessment reviews',
            'Develop standardized knowledge documentation procedures',
            'Create cross-training protocols for critical functions'
        );
        
        this.organizationalRecommendations.culture.push(
            'Foster a culture of knowledge sharing and collaboration',
            'Recognize and reward team success over individual performance',
            'Promote mentorship to distribute expertise across the organization'
        );
    }

    /**
     * Render the results visualizations and tables
     */
    renderResults() {
        this.renderDependencyChart();
        this.renderRiskDistributionChart();
        this.renderResultsTable();
        this.renderRecommendations();
    }

    /**
     * Render the main dependency score chart
     */
    renderDependencyChart() {
        const ctx = document.getElementById('dependency-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.dependency) {
            this.charts.dependency.destroy();
        }
        
        // Sort players by dependency score (descending)
        const sortedPlayers = [...this.players].sort((a, b) => b.dependencyScore - a.dependencyScore);
        
        // Create chart
        this.charts.dependency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedPlayers.map(p => p.name),
                datasets: [{
                    label: 'Dependency Score (0-10)',
                    data: sortedPlayers.map(p => p.dependencyScore),
                    backgroundColor: sortedPlayers.map(p => {
                        if (p.riskLevel === 'high') return 'rgba(220, 53, 69, 0.8)';
                        if (p.riskLevel === 'medium') return 'rgba(255, 193, 7, 0.8)';
                        return 'rgba(25, 135, 84, 0.8)';
                    }),
                    borderColor: sortedPlayers.map(p => {
                        if (p.riskLevel === 'high') return 'rgb(220, 53, 69)';
                        if (p.riskLevel === 'medium') return 'rgb(255, 193, 7)';
                        return 'rgb(25, 135, 84)';
                    }),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Dependency Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Player/Personnel'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const player = sortedPlayers[context.dataIndex];
                                return `Risk Level: ${player.riskLevel.charAt(0).toUpperCase() + player.riskLevel.slice(1)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Render the risk distribution pie chart
     */
    renderRiskDistributionChart() {
        const ctx = document.getElementById('risk-distribution-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.riskDistribution) {
            this.charts.riskDistribution.destroy();
        }
        
        // Count risk levels
        const highRisk = this.players.filter(p => p.riskLevel === 'high').length;
        const mediumRisk = this.players.filter(p => p.riskLevel === 'medium').length;
        const lowRisk = this.players.filter(p => p.riskLevel === 'low').length;
        
        // Create chart
        this.charts.riskDistribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    data: [highRisk, mediumRisk, lowRisk],
                    backgroundColor: [
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(25, 135, 84, 0.8)'
                    ],
                    borderColor: [
                        'rgb(220, 53, 69)',
                        'rgb(255, 193, 7)',
                        'rgb(25, 135, 84)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = highRisk + mediumRisk + lowRisk;
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Render the detailed results table
     */
    renderResultsTable() {
        const tableBody = document.getElementById('results-table-body');
        tableBody.innerHTML = '';
        
        // Sort players by dependency score (highest first)
        const sortedPlayers = [...this.players].sort((a, b) => b.dependencyScore - a.dependencyScore);
        
        sortedPlayers.forEach(player => {
            const row = document.createElement('tr');
            
            // Get the name of the highest impact area
            const highestArea = this.assessmentAreas.find(a => a.id === player.highestImpactArea);
            const highestAreaName = highestArea ? highestArea.name : 'N/A';
            
            // Set row background based on risk level
            if (player.riskLevel === 'high') {
                row.classList.add('table-danger');
            } else if (player.riskLevel === 'medium') {
                row.classList.add('table-warning');
            } else {
                row.classList.add('table-success');
            }
            
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.position}</td>
                <td class="fw-bold">${player.dependencyScore}</td>
                <td>
                    <span class="badge ${player.riskLevel === 'high' ? 'bg-danger' : 
                                           player.riskLevel === 'medium' ? 'bg-warning text-dark' : 
                                           'bg-success'}">
                        ${player.riskLevel.charAt(0).toUpperCase() + player.riskLevel.slice(1)}
                    </span>
                </td>
                <td>${highestAreaName}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-recommendations-btn" 
                            data-id="${player.id}">
                        View Details
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to recommendation buttons
        document.querySelectorAll('.view-recommendations-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showSection('recommendations');
            });
        });
    }

    /**
     * Render recommendations based on assessment results
     */
    renderRecommendations() {
        // Player-specific recommendations
        const highRiskDiv = document.getElementById('high-risk-recommendations');
        const mediumRiskDiv = document.getElementById('medium-risk-recommendations');
        const lowRiskDiv = document.getElementById('low-risk-recommendations');
        const noHighRisk = document.getElementById('no-high-risk');
        const noMediumRisk = document.getElementById('no-medium-risk');
        const noLowRisk = document.getElementById('no-low-risk');
        
        // Clear previous content
        highRiskDiv.innerHTML = '';
        mediumRiskDiv.innerHTML = '';
        lowRiskDiv.innerHTML = '';
        
        // Group players by risk level
        const highRiskPlayers = this.players.filter(p => p.riskLevel === 'high');
        const mediumRiskPlayers = this.players.filter(p => p.riskLevel === 'medium');
        const lowRiskPlayers = this.players.filter(p => p.riskLevel === 'low');
        
        // Show placeholder messages if no players in a category
        if (highRiskPlayers.length === 0) {
            highRiskDiv.appendChild(noHighRisk);
        } else {
            noHighRisk.remove();
            this.renderPlayerRecommendations(highRiskPlayers, highRiskDiv);
        }
        
        if (mediumRiskPlayers.length === 0) {
            mediumRiskDiv.appendChild(noMediumRisk);
        } else {
            noMediumRisk.remove();
            this.renderPlayerRecommendations(mediumRiskPlayers, mediumRiskDiv);
        }
        
        if (lowRiskPlayers.length === 0) {
            lowRiskDiv.appendChild(noLowRisk);
        } else {
            noLowRisk.remove();
            this.renderPlayerRecommendations(lowRiskPlayers, lowRiskDiv);
        }
        
        // Organizational recommendations
        this.renderOrganizationalRecommendations();
    }

    /**
     * Render recommendations for a group of players
     * @param {Array} players - Array of player objects
     * @param {HTMLElement} container - Container element to append recommendations
     */
    renderPlayerRecommendations(players, container) {
        players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'card recommendation-card';
            
            let recommendationsHtml = '';
            player.recommendations.forEach(rec => {
                recommendationsHtml += `<li>${rec}</li>`;
            });
            
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${player.name} <span class="text-muted">(${player.position})</span></h5>
                    <p class="card-text">Dependency Score: <strong>${player.dependencyScore}</strong></p>
                    <ul>${recommendationsHtml}</ul>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    /**
     * Render organizational recommendations
     */
    renderOrganizationalRecommendations() {
        const structuralList = document.getElementById('structural-recommendations');
        const processList = document.getElementById('process-recommendations');
        const cultureList = document.getElementById('culture-recommendations');
        
        // Clear previous content
        structuralList.innerHTML = '';
        processList.innerHTML = '';
        cultureList.innerHTML = '';
        
        // Add recommendations to lists
        this.organizationalRecommendations.structural.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            structuralList.appendChild(li);
        });
        
        this.organizationalRecommendations.process.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            processList.appendChild(li);
        });
        
        this.organizationalRecommendations.culture.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            cultureList.appendChild(li);
        });
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        try {
            localStorage.setItem('dependencyData', JSON.stringify({
                players: this.players,
                assessmentAreas: this.assessmentAreas,
                lastUpdated: new Date().toISOString()
            }));
            
            alert('Data saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data. Please try exporting instead.');
        }
    }

    /**
     * Load saved data from localStorage
     */
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('dependencyData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.players = data.players || [];
                this.assessmentAreas = data.assessmentAreas || this.assessmentAreas;
                
                // Update UI elements
                document.getElementById('continue-to-assessment-btn').disabled = this.players.length === 0;
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    /**
     * Export data as a JSON file
     */
    exportData() {
        try {
            const dataStr = JSON.stringify({
                players: this.players,
                assessmentAreas: this.assessmentAreas,
                exportDate: new Date().toISOString()
            }, null, 2);
            
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileName = 'dependency-analysis-' + new Date().toISOString().split('T')[0] + '.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileName);
            linkElement.click();
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again.');
        }
    }

    /**
     * Import data from a JSON file
     * @param {Event} event - The file input change event
     */
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.players && Array.isArray(data.players)) {
                    this.players = data.players;
                    
                    if (data.assessmentAreas && Array.isArray(data.assessmentAreas)) {
                        this.assessmentAreas = data.assessmentAreas;
                    }
                    
                    // Update UI
                    this.updatePlayersList();
                    this.renderAssessmentForm();
                    document.getElementById('continue-to-assessment-btn').disabled = this.players.length === 0;
                    
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid data format. Could not import players.');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    /**
     * Export player list as CSV
     */
    exportCSV() {
        if (this.players.length === 0) {
            alert('No players to export.');
            return;
        }
        
        try {
            // Create CSV content
            let csvContent = 'Name,Position,Custom Attribute\n';
            this.players.forEach(player => {
                csvContent += `"${player.name}","${player.position}","${player.custom || ''}"\n`;
            });
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'players.csv');
            link.click();
            
            // Clean up
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Error exporting CSV. Please try again.');
        }
    }

    /**
     * Import players from a CSV file
     * @param {Event} event - The file input change event
     */
    importCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvData = e.target.result;
                const lines = csvData.split('\n');
                
                // Skip header row
                const newPlayers = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    // Handle quoted CSV values properly
                    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                    if (values && values.length >= 2) {
                        // Remove quotes from values
                        const name = values[0].replace(/^"|"$/g, '');
                        const position = values[1].replace(/^"|"$/g, '');
                        const custom = values[2] ? values[2].replace(/^"|"$/g, '') : '';
                        
                        newPlayers.push({
                            id: Date.now() + i, // Ensure unique IDs
                            name,
                            position,
                            custom,
                            assessments: {}
                        });
                    }
                }
                
                if (newPlayers.length > 0) {
                    this.players = [...this.players, ...newPlayers];
                    this.updatePlayersList();
                    this.renderAssessmentForm();
                    document.getElementById('continue-to-assessment-btn').disabled = false;
                    
                    alert(`Imported ${newPlayers.length} players successfully.`);
                } else {
                    alert('No valid player data found in CSV.');
                }
            } catch (error) {
                console.error('CSV import error:', error);
                alert('Error importing CSV. Please check the file format.');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
}