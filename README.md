# Star Player Dependency Analyzer

A web application that helps sports teams or organizations assess their reliance on key individuals and provides risk mitigation recommendations.

## Overview

The Star Player Dependency Analyzer is a tool designed to help sports teams, executives, and managers evaluate their organization's reliance on star players or key personnel. By assessing multiple areas of impact (revenue generation, fan engagement, team performance, etc.), the tool calculates dependency scores, identifies risk levels, and provides actionable recommendations for risk mitigation.

## Features

- **Player/Employee Input**: Add and manage a roster of players or employees to analyze
- **Multi-dimensional Assessment**: Rate key personnel across various business impact areas
- **Customizable Weights**: Adjust importance of different assessment areas based on organizational priorities 
- **Dependency Scoring**: Algorithm that calculates overall dependency and categorizes risk levels
- **Visual Dashboard**: Interactive charts and visualizations of dependency metrics
- **Risk Mitigation Recommendations**: Customized suggestions based on dependency analysis
- **Data Export/Import**: Save, export, and import your analysis for continuity

## Getting Started

### Prerequisites
- Any modern web browser
- No installation required - runs entirely in browser

### Usage
1. Visit the hosted application at [https://dxaginfo.github.io/star-player-dependency-analyzer/](https://dxaginfo.github.io/star-player-dependency-analyzer/)
2. Add your players/employees with their roles
3. Complete the dependency assessment questionnaire
4. View results and recommendations
5. Export your data for future reference

## Technical Details

This application is built using:
- HTML5, CSS3 with Bootstrap 5 for responsive design
- Vanilla JavaScript for application logic
- Chart.js for data visualization
- LocalStorage for data persistence

## Development

### Project Structure
```
star-player-dependency-analyzer/
├── index.html              # Main application HTML
├── css/
│   └── styles.css          # Custom styling
├── js/
│   ├── app.js              # Application initialization
│   ├── players.js          # Player management functionality
│   ├── assessment.js       # Assessment logic
│   ├── calculator.js       # Dependency scoring algorithms
│   ├── visualization.js    # Chart and visualization code
│   └── recommendations.js  # Recommendation generation
└── assets/
    └── icons/              # Application icons
```

### Running Locally
1. Clone the repository:
```bash
git clone https://github.com/dxaginfo/star-player-dependency-analyzer.git
```
2. Open index.html in any browser
3. No build steps or server setup required

## Use Cases

- **Sports Teams**: Evaluate dependency on star players and develop contingency plans
- **Small Businesses**: Assess reliance on key personnel and mitigate succession risks
- **Project Teams**: Identify knowledge silos and develop cross-training strategies
- **Executive Teams**: Plan for leadership transitions and organizational resilience

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by strategic management principles in sports and business
- Built to address the common challenge of over-reliance on star talent