import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MachineBrand from "./MachineBrands";
import MachineType from "./MachineTypes";
import OrderSize from "./OrderSizes";
import OrderColor from "./OrderColors";
import Customer from "./Customers";
import Operation from "./Operations";
import Article from "./Articles";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const Libraries = () => {
  const { userDetail } = useContext(AuthContext);
  const role = userDetail?.role?.name || "";

  return (
    <div className="px-[50px] ml-[210px] bg-slate-50 overflow-auto min-h-screen">
      <div>
        <Tabs
          defaultValue={role === "ROLE_SUPERVISOR" ? "operation" : "customer"}
          className="w-full"
        >
          <div className="w-fit mb-8">
            <TabsList className="flex bg-white ml-[0px] !px-0 rounded-full text-gray/80 border border-slate-200">
              {role !== "ROLE_SUPERVISOR" && (
                <TabsTrigger
                  value="customer"
                  className="rounded-full px-4 py-1 font-medium text-[10px]
                             data-[state=active]:bg-primary data-[state=active]:text-white
                             hover:bg-primary/5 transition-all"
                >
                  Customer Library
                </TabsTrigger>
              )}

              <TabsTrigger
                value="operation"
                className="rounded-full px-4 py-1 font-medium text-[10px]
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           hover:bg-primary/5 transition-all"
              >
                Operation Library
              </TabsTrigger>

              <TabsTrigger
                value="article"
                className="rounded-full px-4 py-1 font-medium text-[10px]
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           hover:bg-primary/5 transition-all"
              >
                Article Library
              </TabsTrigger>

              <TabsTrigger
                value="size"
                className="rounded-full px-4 py-1 font-medium text-[10px]
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           hover:bg-primary/5 transition-all"
              >
                Order Size Library
              </TabsTrigger>

              <TabsTrigger
                value="color"
                className="rounded-full px-4 py-1 font-medium text-[10px]
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           hover:bg-primary/5 transition-all"
              >
                Order Color Library
              </TabsTrigger>

              <TabsTrigger
                value="machineType"
                className="rounded-full px-4 py-1 font-medium text-[10px]
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           hover:bg-primary/5 transition-all"
              >
                Machine Type Library
              </TabsTrigger>

              <TabsTrigger
                value="machineBrand"
                className="rounded-full px-4 py-1 font-medium text-[10px]
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           hover:bg-primary/5 transition-all"
              >
                Machine Brand Library
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full">
            {role !== "ROLE_SUPERVISOR" && (
              <TabsContent value="customer">
                <Customer />
              </TabsContent>
            )}

            <TabsContent value="operation">
              <Operation />
            </TabsContent>
            <TabsContent value="article">
              <Article />
            </TabsContent>
            <TabsContent value="size">
              <OrderSize />
            </TabsContent>
            <TabsContent value="color">
              <OrderColor />
            </TabsContent>
            <TabsContent value="machineType">
              <MachineType />
            </TabsContent>
            <TabsContent value="machineBrand">
              <MachineBrand />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Libraries;
