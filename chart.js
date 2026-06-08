const revenueChartElement = document.querySelector("#revenueChart");

const revenueChartOptions = {
  series: [
    {
      name: "Net Revenue",
      data: [0, 0, 0, 0, 0, 0],
    },
    {
      name: "Operating Cost",
      data: [0, 0, 0, 0, 0, 0],
    },
  ],

  chart: {
    type: "area",
    height: 288,
    background: "transparent",
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },

  theme: {
    mode: "dark",
  },

  colors: ["#e5e7eb", "#6b7280"],

  dataLabels: {
    enabled: false,
  },

  stroke: {
    curve: "smooth",
    width: 2,
  },

  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.28,
      opacityTo: 0.02,
      stops: [0, 90, 100],
    },
  },

  grid: {
    borderColor: "#1f2937",
    strokeDashArray: 4,
  },

  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    labels: {
      style: {
        colors: "#6b7280",
        fontSize: "12px",
      },
    },
    axisBorder: {
      color: "#1f2937",
    },
    axisTicks: {
      color: "#1f2937",
    },
  },

  yaxis: {
    labels: {
      formatter: function (value) {
        return "€" + Number(value || 0).toLocaleString();
      },
      style: {
        colors: "#6b7280",
        fontSize: "12px",
      },
    },
  },

  legend: {
    position: "top",
    horizontalAlign: "right",
    labels: {
      colors: "#d1d5db",
    },
  },

  tooltip: {
    theme: "dark",
    y: {
      formatter: function (value) {
        return "€" + Number(value || 0).toLocaleString();
      },
    },
  },
};

let revenueChart = null;

if (revenueChartElement && window.ApexCharts) {
  revenueChart = new ApexCharts(revenueChartElement, revenueChartOptions);
  revenueChart.render();
} else if (revenueChartElement) {
  console.warn("ApexCharts is not available. Revenue chart was not rendered.");
}

window.updateRevenueChart = function updateRevenueChart(categories, revenueData, costData) {
  if (!revenueChart) {
    return;
  }

  revenueChart.updateOptions({
    xaxis: {
      categories,
    },
  });

  revenueChart.updateSeries([
    {
      name: "Net Revenue",
      data: revenueData,
    },
    {
      name: "Operating Cost",
      data: costData,
    },
  ]);
};
