import CategoryGraph from "@/app-components/common/CategoryGraph";

const DashBoard = () => {
  return (
    <div className="overflow-auto min-h-screen px-[20px] pb-10 pt-[30px] ml-[210px] bg-slate-50">
      <div className="flex flex-row items-start gap-[12px] w-full">
        <div className="bg-white rounded-xl w-[450px] min-h-[180px] overflow-y-auto border border-slate-200">
          <p className="font-semibold text-[13px] px-4 py-[6px] w-full bg-primary text-white">
            Production Data
          </p>
          <div className="grid grid-cols-3 justify-start items-center gap-[12px] py-[10px] px-[10px]">
            <div className="flex flex-col gap-[10px] justify-center items-center">
              <div className="border border-slate-200/80  w-[130px] h-[55px] rounded-lg flex flex-col px-[6px] py-[4px] justify-start items-start">
                <p className="font-semibold text-[12px] text-gray/80">
                  Daily Target
                </p>
                <p className="font-bold text-[17px] text-primary">1808</p>
              </div>
            </div>
            <div className="flex flex-col gap-[10px] justify-center items-center">
              <div className="border border-slate-200/80  w-[130px] h-[55px] rounded-lg flex flex-col px-[6px] py-[4px] justify-start items-start">
                <p className="font-semibold text-[12px] text-gray/80">
                  Stitched Pieces
                </p>
                <p className="font-bold text-[17px] text-primary">678</p>
              </div>
            </div>
            <div className="flex flex-col gap-[10px] justify-center items-center">
              <div className="border border-slate-200/80   w-[130px] h-[55px] rounded-lg flex flex-col px-[6px] py-[4px] justify-start items-start">
                <p className="font-semibold text-[12px] text-gray/80">
                  Garment Sam
                </p>
                <p className="font-bold text-[17px] text-primary">12</p>
              </div>
            </div>
            <div className="flex flex-col gap-[10px] justify-center items-center">
              <div className="border border-slate-200/80   w-[130px] h-[60px] h-[55px] rounded-lg flex flex-col px-[6px] py-[4px] justify-start items-start">
                <p className="font-semibold text-[12px] text-gray/80">
                  Current Efficiency
                </p>
                <p className="font-bold text-[17px] text-primary">59%</p>
              </div>
            </div>
            <div className="flex flex-col gap-[10px] justify-center items-center">
              <div className="border border-slate-200/80 w-[130px] h-[60px] h-[55px] rounded-lg flex flex-col px-[6px] py-[4px] justify-start items-start">
                <p className="font-semibold text-[12px] text-gray/80">
                  Target Efficiency
                </p>
                <p className="font-bold text-[17px] text-primary">80%</p>
              </div>
            </div>
            <div className="flex flex-col gap-[10px] justify-center items-center">
              <div className="border border-slate-200/80 w-[130px] h-[55px] rounded-lg flex flex-col px-[6px] py-[4px] justify-start items-start">
                <p className="font-semibold text-[12px] text-gray/80">WIP</p>
                <p className="font-bold text-[17px] text-primary">1808</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl w-[830px] min-h-[180px] overflow-y-auto border border-slate-200">
          <p className="font-semibold text-[13px] px-4 py-[6px] w-full bg-primary text-white">
            Machines and Operators Data
          </p>
          <div className="flex flex-row gap-[40px] py-[10px] px-[10px]">
            <CategoryGraph
              data={[300, 200, 100]}
              labels={["Total", "Active", "Inactive"]}
              colors={["#2F4058", "#70c77791", "rgba(255, 130, 123, 0.6)"]}
              centerLabel="300"
              centerSubLabel="Machines"
              heading="Machines"
            />

            <CategoryGraph
              data={[300, 270, 200]}
              labels={["Total", "Active", "Logged In"]}
              colors={["#2F4058", "#cbd5e1", "#70c77791"]}
              centerLabel="300"
              centerSubLabel="Operators"
              heading="Operators"
            />
            <CategoryGraph
              data={[300, 270]}
              labels={["Total", "Assigned"]}
              colors={["#2F4058", "#cbd5e1"]}
              centerLabel="300"
              centerSubLabel="Devices"
              heading="Devices"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 min-h-[400px] shadow-2xl bg-white shadow-primary/10 backdrop-blur-lg px-4 py-2 mt-[18px] mb-[30px]">
        <div className="flex items-start justify-between mb-[12px] mt-[10px]">
          <h2 className="text-[15px] font-bold "></h2>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
