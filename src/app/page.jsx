"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiBarChart2,
  FiPackage,
  FiLogIn,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import { AiFillSafetyCertificate } from "react-icons/ai";
import Chart from "chart.js/auto";
import isBetween from "dayjs/plugin/isBetween";
import dayjs from "dayjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Tambahkan plugin isBetween ke dayjs
dayjs.extend(isBetween);

// const mesinData = [
//   {
//     id: 1,
//     name: "Mesin 1",
//     date: "2025-03-01",
//     output_standard: 5000,
//     output_actual: 5200,
//     reject_standard: 2.5,
//     reject_actual: 2.0,
//   },
// ];

export default function Dashboard() {
  const pathname = usePathname();
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("all");
  const [avgEfficiency, setAvgEfficiency] = useState("");
  const [avgQuality, setAvgQuality] = useState("");
  const [avgDowntime, setAvgDowntime] = useState({});

  const outputChartRef = useRef(null);
  const rejectChartRef = useRef(null);
  const [actualData, setActualData] = useState([]);
  const [actualDataFiltered, setActualDataFiltered] = useState([]);
  const [standardData, setStandardData] = useState([]);
  const [user, setUser] = useState();
  const [isAllOutputRed, setIsAllOutputRed] = useState(false);
  const [isAllRejectRed, setIsAllRejectRed] = useState(false);
  const [outputSum, setOutputSum] = useState(0);
  const [outputStandarSum, setOutputStandarSum] = useState(0);
  let groupedData = [];

  useEffect(() => {
    handleApplyFilters();
  }, [selectedMachine, endDate, startDate, timePeriod]);

  useEffect(() => {
    const fetchActual = async () => {
      const res = await fetch(
        "api/actual/with-standar" // Ganti dengan URL API yang sesuai
      );
      const data = await res.json();
      if (res.ok) {
        setActualData(data.actualFormatted);
        setActualDataFiltered(data.actualFormatted);
        setStandardData(data.standar);
      } else {
        console.error("Failed to fetch actual data:", data);
      }
    };
    fetchActual();

    const fetchUser = async () => {
      const res = await fetch("api/auth/me");
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const efficiencyResult = calculateEfficiency(actualDataFiltered);
    setAvgEfficiency(efficiencyResult);

    const averageQualityRate = calculateAverageQualityRate(actualDataFiltered);
    setAvgQuality(averageQualityRate);

    const downtimeResult = analyzeDowntime(actualDataFiltered);
    setAvgDowntime(downtimeResult);

    groupedData = groupExtruderData(actualDataFiltered);

    const output = groupedData.reduce((acc, item) => {
      acc.push(item.output_actual < item.output_standard);
      return acc;
    }, []);
    setIsAllOutputRed(output.every((val) => val === true));
    setOutputSum(
      groupedData.reduce((acc, item) => {
        return acc + item.output_actual;
      }, 0)
    );
    setOutputStandarSum(
      groupedData.reduce((acc, item) => {
        return acc + item.output_standard;
      }, 0)
    );

    const reject = groupedData.reduce((acc, item) => {
      acc.push(item.reject_actual < item.reject_standard);
      return acc;
    }, []);
    setIsAllRejectRed(reject.every((val) => val === true));

    const lowestLabelPlugin = {
      id: "lowestLabelPlugin",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const dataset = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);

        if (!dataset || !meta || !meta.data.length) return;

        let minIndex = 0;
        dataset.data.forEach((val, i) => {
          if (val < dataset.data[minIndex]) {
            minIndex = i;
          }
        });

        const bar = meta.data[minIndex];
        if (!bar) return;

        const text = "Decreased consumer demand";
        const padding = 6;
        const radius = 6;
        const tailHeight = 8;

        ctx.save();
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textWidth = ctx.measureText(text).width;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = 28;

        const x = bar.x;
        const y = bar.y - boxHeight - tailHeight - 6;

        // ===== Gambar Bubble dengan Border =====
        ctx.beginPath();
        ctx.moveTo(x - boxWidth / 2 + radius, y);
        ctx.lineTo(x + boxWidth / 2 - radius, y);
        ctx.quadraticCurveTo(x + boxWidth / 2, y, x + boxWidth / 2, y + radius);
        ctx.lineTo(x + boxWidth / 2, y + boxHeight - radius);
        ctx.quadraticCurveTo(
          x + boxWidth / 2,
          y + boxHeight,
          x + boxWidth / 2 - radius,
          y + boxHeight
        );
        ctx.lineTo(x + 6, y + boxHeight); // sebelum tail
        ctx.lineTo(x, y + boxHeight + tailHeight); // tail point
        ctx.lineTo(x - 6, y + boxHeight); // setelah tail
        ctx.lineTo(x - boxWidth / 2 + radius, y + boxHeight);
        ctx.quadraticCurveTo(
          x - boxWidth / 2,
          y + boxHeight,
          x - boxWidth / 2,
          y + boxHeight - radius
        );
        ctx.lineTo(x - boxWidth / 2, y + radius);
        ctx.quadraticCurveTo(x - boxWidth / 2, y, x - boxWidth / 2 + radius, y);
        ctx.closePath();

        // Border saja
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Teks hitam
        ctx.fillStyle = "black";
        ctx.fillText(text, x, y + boxHeight / 2);

        ctx.restore();
      },
    };

    const ctxOutput = outputChartRef.current.getContext("2d");
    const ctxReject = rejectChartRef.current.getContext("2d");

    // Destroy chart lama jika ada
    if (outputChartRef.current._chartInstance) {
      outputChartRef.current._chartInstance.destroy();
    }
    if (rejectChartRef.current._chartInstance) {
      rejectChartRef.current._chartInstance.destroy();
    }

    const newOutputChart = new Chart(ctxOutput, {
      type: "bar",
      data: {
        labels: groupedData.map((m) => m.name),
        datasets: [
          {
            label: "Actual Output",
            data: groupedData.map((m) => m.output_actual),
            backgroundColor: groupedData.map((m) =>
              m.output_actual < m.output_standard
                ? "rgba(239, 68, 68, 0.6)"
                : "rgba(34, 197, 94, 0.6)"
            ),
            borderRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const dataIndex = context.dataIndex;
                const item = groupedData[dataIndex];
                return [
                  `Actual: ${item.output_actual}`,
                  `Standard: ${item.output_standard}`,
                  `${item.output_actual > item.output_standard ? "+" : ""}${item.output_actual - item.output_standard} (${
                    item.output_standard !== 0
                      ? (((item.output_actual - item.output_standard) / item.output_standard) * 100).toFixed(1)
                      : "0"
                  }%)`,
                ];
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
      plugins: [lowestLabelPlugin],
    });

    const newRejectChart = new Chart(ctxReject, {
      type: "bar",
      data: {
        labels: groupedData.map((m) => m.name),
        datasets: [
          {
            label: "Actual Reject Rate",
            data: groupedData.map((m) => m.reject_actual),
            backgroundColor: groupedData.map((m) => {
              return m.reject_actual < m.reject_standard
                ? "rgba(239, 68, 68, 0.6)"
                : "rgba(34, 197, 94, 0.6)";
            }), // Merah (Tailwind: red-500)
            borderRadius: 10, // Sudut melengkung
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: "bottom",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Simpan instance ke elemen canvas agar bisa destroy saat perlu
    outputChartRef.current._chartInstance = newOutputChart;
    rejectChartRef.current._chartInstance = newRejectChart;

    // Cleanup function
    return () => {
      newOutputChart.destroy();
      newRejectChart.destroy();
    };
  }, [actualDataFiltered]);

  const handleApplyFilters = () => {
    const filteredData = actualData.filter((item) => {
      const itemDate = dayjs(item.date);

      const isWithinDateRange =
        (timePeriod === "daily" && itemDate.isSame(dayjs(), "day")) ||
        (timePeriod === "weekly" &&
          itemDate.isAfter(dayjs().subtract(7, "day"))) ||
        (timePeriod === "monthly" &&
          itemDate.isAfter(dayjs().subtract(1, "month"))) ||
        (timePeriod === "custom" &&
          startDate &&
          endDate &&
          itemDate.isBetween(dayjs(startDate), dayjs(endDate), null, "[]"));

      const isMachineSelected =
        selectedMachine === "all" || item.name === selectedMachine;

      return isWithinDateRange && isMachineSelected;
    });

    setActualDataFiltered(filteredData);
  };

  const calculateEfficiency = (data) => {
    const efficiencies = data.map((item) => {
      const efficiency = (item.output_actual / item.output_standard) * 100;
      return efficiency;
    });

    // Menghitung rata-rata efisiensi
    const averageEfficiency =
      efficiencies.reduce((total, efficiency) => total + efficiency, 0) /
      efficiencies.length;
    return averageEfficiency.toFixed(2); // Menampilkan rata-rata dengan 2 angka desimal
  };

  const calculateQualityRate = (outputActual, rejectActual) => {
    const goodOutput = outputActual - rejectActual;
    return (goodOutput / outputActual) * 100;
  };

  // Function to calculate average Quality Rate
  const calculateAverageQualityRate = (data) => {
    let totalQualityRate = 0;
    let totalItems = data.length;

    data.forEach((item) => {
      const qualityRate = calculateQualityRate(
        item.output_actual,
        item.reject_actual
      );
      totalQualityRate += qualityRate;
    });

    const averageQualityRate = totalQualityRate / totalItems;
    return averageQualityRate.toFixed(2); // Returns the average rounded to 2 decimal places
  };

  function analyzeDowntime(data) {
    const totalActual = data.reduce(
      (sum, item) => sum + item.downtime_actual,
      0
    );
    const totalStandard = data.reduce(
      (sum, item) => sum + item.downtime_standard,
      0
    );

    const averageActual = totalActual / data.length;
    const achievementPercentage = (totalActual / totalStandard) * 100;

    return {
      averageActual: averageActual.toFixed(2), // jam
      achievementPercentage: achievementPercentage.toFixed(2),
    };
  }

  const groupExtruderData = (data) => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = {
          name: item.name,
          output_actual: 0,
          reject_actual: 0,
          output_standard: 0, // diasumsikan sama per mesin
          reject_standard: 0, // diasumsikan sama per mesin
        };
      }

      acc[item.name].output_actual += item.output_actual || 0;
      acc[item.name].reject_actual += item.reject_actual || 0;
      acc[item.name].reject_standard += item.reject_standard || 0;
      acc[item.name].output_standard += item.output_standard || 0;

      return acc;
    }, {});

    return Object.values(grouped).map((item) => ({
      name: item.name,
      output_actual: item.output_actual,
      output_standard: item.output_standard,
      reject_actual: item.reject_actual,
      reject_standard: item.reject_standard,
      reject_rate_actual: item.output_actual
        ? item.reject_actual / item.output_actual
        : 0,
    }));
  };

  return (
    <div
      className={`${
        user ? "dashboard" : "ml-[0px]"
      } bg-gray-100 font-sans min-h-screen p-6`}
    >
      <div className="container mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome to Your Production Dashboard!
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            Stay informed and track real-time performance, output, efficiency,
            and more with ease. Let's optimize your operations!
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Filter Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                value={timePeriod}
                onChange={(e) => {
                  setTimePeriod(e.target.value);
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Date Range Filter */}
            {timePeriod === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="self-center">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Machine Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Machine
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Machines</option>
                {standardData.map((std) => (
                  <option key={std._id} value={std.name}>
                    {std.name}
                  </option>
                ))}
              </select>
            </div>
            {!user && (
              <Link className="text-blue-600 mt-10 ml-auto" href={"/login"}>
                <FiLogIn />
              </Link>
            )}
          </div>
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Total Production"
            icon={1}
            value={outputSum}
            subtitle={`${outputSum - outputStandarSum} vs standard`}
            color={outputSum < outputStandarSum ? "red" : "green"}
            isPlus={outputSum < outputStandarSum ? false : true}
          />
          <KpiCard
            icon={2}
            title="Average Efficiency"
            value={avgEfficiency + " %"}
            subtitle={`${(avgEfficiency - 100).toFixed(2)} % vs standard`}
            color={avgEfficiency > 100 ? "green" : "red"}
            isPlus={avgEfficiency > 100 ? true : false}
          />
          <KpiCard
            icon={3}
            title="Quality Rate"
            value={avgQuality + " %"}
            subtitle={`${(avgQuality - 85).toFixed(2)} % vs standard`}
            color={avgQuality > 85 ? "green" : "red"}
            isPlus={avgQuality > 85 ? true : false}
          />
          <KpiCard
            icon={4}
            title="Downtime"
            value={avgDowntime.averageActual + " hrs"}
            subtitle={`${(100 - avgDowntime.achievementPercentage).toFixed(
              2
            )} % vs standard`}
            color={
              100 - avgDowntime.achievementPercentage < 0 ? "red" : "green"
            }
            isPlus={100 - avgDowntime.achievementPercentage < 0 ? false : true}
          />
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-row items-center">
              <FiBarChart2 className="mr-2 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-700">
                Product Output
              </h2>
              <small className="text-white bg-green-600 rounded-md px-2 font-bold ml-auto">
                Below Standard
              </small>
              <small className="text-white bg-red-600 rounded-md px-2 font-bold ml-2">
                Above Standard
              </small>
            </div>
            <canvas ref={outputChartRef} className="w-full h-64" />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-row items-center">
              <FiBarChart2 className="mr-2 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-700">
                Reject Rate
              </h2>
              <small className="text-white bg-green-600 rounded-md px-2 font-bold ml-auto">
                Below Standard
              </small>
              <small className="text-white bg-red-600 rounded-md px-2 font-bold ml-2">
                Above Standard
              </small>
            </div>
            <div className="flex flex-row items-center"></div>
            <canvas ref={rejectChartRef} className="w-full h-64" />
          </div>
        </div>
        {/* Legend */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            • <span className="text-green-600">Green</span> indicates
            improvement
          </p>
          <p className="text-sm text-gray-600">
            • <span className="text-red-600">Red</span> indicates decline
          </p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, color, icon, isPlus }) {
  const colorClass = {
    green: "text-green-600",
    red: "text-red-600",
    orange: "text-orange-500",
  }[color];

  let iconColor;

  switch (icon) {
    case 1:
      iconColor = "bg-blue-100";
      break;
    case 2:
      iconColor = "bg-green-100";
      break;
    case 3:
      iconColor = "bg-fuchsia-100";
      break;
    case 4:
      iconColor = "bg-orange-100";
      break;
    default:
      iconColor = "bg-gray-100";
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
      <div
        className={`${iconColor} p-2 w-13 h-13 flex items-center justify-center rounded-full`}
      >
        {icon === 1 && <FiPackage className="text-2xl text-blue-600" />}
        {icon === 2 && <FiTrendingUp className="text-2xl text-green-600" />}
        {icon === 3 && (
          <AiFillSafetyCertificate className="text-2xl text-fuchsia-600" />
        )}
        {icon === 4 && <FiClock className="text-2xl text-orange-600" />}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <div
          className={`text-2xl font-bold ${
            isPlus ? "text-green-500" : "text-red-500"
          }`}
        >
          {value}
        </div>
        <div className={`text-sm mt-1 ${colorClass}`}>{subtitle}</div>
      </div>
    </div>
  );
}
