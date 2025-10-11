import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface CategoryGraphProps {
  data: number[];
  labels: string[];
  colors: string[];
  centerLabel?: string;
  centerSubLabel?: string;
  heading?: string;
}

const CategoryGraph = ({
  data,
  labels,
  colors,
  centerLabel,
  centerSubLabel,
  heading,
}: CategoryGraphProps) => {
  const pieData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
        cutout: "85%",
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        display: false,
      },
    },
  };

  return (
    <div className="flex justify-start items-center h-[126px] rounded-[10px] bg-white">
      <div className="relative w-1/2 h-4/5">
        <Pie data={pieData} options={options} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            fontSize: "12px",
            lineHeight: "1.2",
          }}
        >
          <p className="text-xl">{centerLabel}</p>
          {centerSubLabel && (
            <div style={{ fontWeight: "normal", fontSize: "11px" }}>
              {centerSubLabel}
            </div>
          )}
        </div>
      </div>
      <div className="w-1/2 flex flex-col ml-[10px] gap-y-1">
        <h3 className="text-sm font-semibold">{heading}</h3>
        {labels.map((item, i) => {
          return (
            <span
              key={i}
              className="text-[11px] flex w-4/5 items-center justify-start"
            >
              <span className="bg-light-gray flex items-center p-1 pe-4 relative">
                <span
                  style={{ backgroundColor: colors[i] }}
                  className="w-[7px] h-[7px] rounded-full absolute -left-[2px]"
                />
                <span className="ms-2 w-[50px] text-[11px] font-normal">
                  {item}
                </span>
              </span>
              <span className=" flex items-center text-[11px] justify-center font-semibold p-1">
                {data[i]}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGraph;
