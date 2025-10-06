import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllDevices from "./AllDevices";
import Binding from "./Binding";

const DeviceBinding = () => {
  return (
    <div className="px-[50px] ml-[210px] bg-slate-50 overflow-auto min-h-screen">
      <div className="">
        <Tabs defaultValue="bindDevice" className="w-full">
          <div className="w-fit mb-8">
            <TabsList className="flex bg-white ml-[0px] h-[24px] !px-0 rounded-full text-gray/80 border border-slate-200">
              <TabsTrigger
                value="bindDevice"
                className="rounded-full px-4 py-1 font-medium text-[10px]
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           hover:bg-primary/5 transition-all"
              >
                Bind Optiman Device with Machine
              </TabsTrigger>
              <TabsTrigger
                value="allDevices"
                className="rounded-full px-4 py-1 font-medium text-[10px]
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           hover:bg-primary/5 transition-all"
              >
                All Optiman Devices
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="w-full">
            <TabsContent value="bindDevice">
              <Binding />
            </TabsContent>
            <TabsContent value="allDevices">
              <AllDevices />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DeviceBinding;
