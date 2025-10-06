import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  small?: boolean;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, small = false, ...props }, ref) => {
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-slate-400/20 shadow-lg backdrop-blur-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        small
          ? "h-[20px] w-[40px] data-[state=checked]:bg-softgreen data-[state=unchecked]:bg-slate-300"
          : "h-[22px] w-[50px] data-[state=checked]:bg-softgreen data-[state=unchecked]:bg-slate-300",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform",
          small
            ? "h-[14px] w-[14px] data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0"
            : "h-[16px] w-[18px] data-[state=checked]:translate-x-[28px] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
