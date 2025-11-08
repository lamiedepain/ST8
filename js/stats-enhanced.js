/**
 * Enhanced Statistics Module for ST8
 * Professional statistical charts and analytics
 */

class StatsModule {
  constructor() {
    this.agents = [];
    this.charts = {};
    this.colors = {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      services: {
        'VOIRIE': '#ef4444',
        'ESPACES_VERTS': '#10b981',
        'ENCADRANTS': '#3b82f6',
        'MAGASIN': '#f59e0b',
        'ENTRETIEN_BATIMENT': '#8b5cf6'
      },
      statusCodes: {
        'PREV': '#3b82f6',    // Prévisionnel - Blue
        'ASTH': '#ef4444',    // Absence thérapeutique - Red
        'ASTS': '#f59e0b',    // Absence syndicale - Orange
        'CP': '#10b981',      // Congé payé - Green
        'RTT': '#8b5cf6',     // RTT - Purple
        'MALADIE': '#dc2626', // Maladie - Dark red
        'AT': '#f97316'       // Accident travail - Dark orange
      }
    };
  }

  /**
   * Load agents data
   */
  async loadData() {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      this.agents = data.agents || [];
      return this.agents;
    } catch (error) {
      console.error('Error loading agents data:', error);
      return [];
    }
  }

  /**
   * Generate service distribution chart
   */
  renderServiceDistribution(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const serviceCounts = {};
    this.agents.forEach(agent => {
      const service = agent.service || 'Non assigné';
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });

    const ctx = canvas.getContext('2d');
    this.charts.serviceDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(serviceCounts),
        datasets: [{
          data: Object.values(serviceCounts),
          backgroundColor: Object.keys(serviceCounts).map(s => 
            this.colors.services[s] || this.colors.primary
          ),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12, weight: '500' },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          title: {
            display: true,
            text: 'Répartition par Service',
            font: { size: 16, weight: '600' },
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
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
   * Generate PREV (Prévisionnel) statistics by service
   */
  renderPrevByService(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const prevByService = {};
    const totalByService = {};

    this.agents.forEach(agent => {
      const service = agent.service || 'Non assigné';
      if (!prevByService[service]) {
        prevByService[service] = 0;
        totalByService[service] = 0;
      }

      if (agent.presences) {
        Object.values(agent.presences).forEach(status => {
          totalByService[service]++;
          if (status === 'PREV') {
            prevByService[service]++;
          }
        });
      }
    });

    // Calculate percentages
    const services = Object.keys(prevByService);
    const percentages = services.map(s => 
      totalByService[s] > 0 
        ? Math.round((prevByService[s] / totalByService[s]) * 100) 
        : 0
    );

    const ctx = canvas.getContext('2d');
    this.charts.prevByService = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: services,
        datasets: [{
          label: 'Taux de Prévisionnel (%)',
          data: percentages,
          backgroundColor: this.colors.statusCodes.PREV,
          borderColor: this.colors.statusCodes.PREV,
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Taux de Prévisionnel par Service',
            font: { size: 16, weight: '600' },
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y}% en prévisionnel`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  /**
   * Generate presence trends over time
   */
  renderPresenceTrends(canvasId, months = 6) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Generate last N months
    const monthLabels = [];
    const today = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthLabels.push(date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }));
    }

    // Calculate presence stats per month
    const presenceData = monthLabels.map(() => Math.floor(Math.random() * 30) + 70); // Mock data
    const absenceData = monthLabels.map(() => Math.floor(Math.random() * 15) + 5);   // Mock data
    const prevData = monthLabels.map(() => Math.floor(Math.random() * 20) + 10);     // Mock data

    const ctx = canvas.getContext('2d');
    this.charts.presenceTrends = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: 'Présences',
            data: presenceData,
            borderColor: this.colors.success,
            backgroundColor: this.colors.success + '20',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Absences',
            data: absenceData,
            borderColor: this.colors.danger,
            backgroundColor: this.colors.danger + '20',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Prévisionnels',
            data: prevData,
            borderColor: this.colors.info,
            backgroundColor: this.colors.info + '20',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: { size: 12, weight: '500' },
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Évolution des Présences sur 6 mois',
            font: { size: 16, weight: '600' },
            padding: 20
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  /**
   * Generate agent cost analysis
   */
  renderCostByAgent(canvasId, topN = 10) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Calculate mock costs per agent (based on grade and days worked)
    const agentCosts = this.agents.map(agent => {
      const baseCost = this.getGradeCost(agent.grade);
      const daysWorked = agent.presences ? Object.keys(agent.presences).length : 0;
      const monthlyCost = (baseCost / 22) * daysWorked; // Approximate monthly cost
      
      return {
        name: `${agent.nom} ${agent.prenom}`,
        cost: monthlyCost,
        service: agent.service
      };
    }).sort((a, b) => b.cost - a.cost).slice(0, topN);

    const ctx = canvas.getContext('2d');
    this.charts.costByAgent = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: agentCosts.map(a => a.name),
        datasets: [{
          label: 'Coût mensuel estimé (€)',
          data: agentCosts.map(a => a.cost),
          backgroundColor: agentCosts.map(a => 
            this.colors.services[a.service] || this.colors.primary
          ),
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Top ${topN} Agents par Coût Mensuel`,
            font: { size: 16, weight: '600' },
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${Math.round(context.parsed.x).toLocaleString('fr-FR')} €`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              callback: function(value) {
                return Math.round(value).toLocaleString('fr-FR') + ' €';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  /**
   * Generate status code distribution
   */
  renderStatusDistribution(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const statusCounts = {};
    this.agents.forEach(agent => {
      if (agent.presences) {
        Object.values(agent.presences).forEach(status => {
          if (status) {
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          }
        });
      }
    });

    const ctx = canvas.getContext('2d');
    this.charts.statusDistribution = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map(s => 
            this.colors.statusCodes[s] || this.colors.primary
          ),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: { size: 12, weight: '500' },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          title: {
            display: true,
            text: 'Répartition des Statuts',
            font: { size: 16, weight: '600' },
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
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
   * Get approximate monthly cost based on grade
   */
  getGradeCost(grade) {
    const costs = {
      'Technicien Principal de 1ère classe': 3200,
      'Technicien principal de 2e classe': 2900,
      'Technicien': 2600,
      'Adjoint technique principal de 1ère classe': 2400,
      'Adjoint technique principal de 2e classe': 2200,
      'Adjoint technique territorial': 2000,
      'Agent de maitrise principal': 2800,
      'Agent de maitrise': 2500
    };
    return costs[grade] || 2300;
  }

  /**
   * Destroy all charts
   */
  destroyCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  /**
   * Initialize all charts
   */
  async initAllCharts() {
    await this.loadData();
    this.destroyCharts();
    
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      this.renderServiceDistribution('chartServiceDistribution');
      this.renderPrevByService('chartPrevByService');
      this.renderPresenceTrends('chartPresenceTrends');
      this.renderCostByAgent('chartCostByAgent');
      this.renderStatusDistribution('chartStatusDistribution');
    }, 100);
  }
}

// Create global instance
window.StatsModule = StatsModule;
window.stats = new StatsModule();
