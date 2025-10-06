import { Skeleton } from "@/components/ui/skeleton";

interface FilterSkeletonProps {
  small?: boolean;
  xsmall?: boolean;
  medium?: boolean;
}

const FilterSkeleton = ({
  small = false,
  xsmall = false,
  medium = false,
}: FilterSkeletonProps) => {
  let widthClass = "w-[150px]";

  if (xsmall) {
    widthClass = "w-[110px]";
  } else if (small) {
    widthClass = "w-[120px]";
  } else if (medium) {
    widthClass = "w-[130px]";
  }

  return (
    <Skeleton
      className={`${widthClass} h-[40px] bg-slate-200 rounded-md mt-[3px]`}
    />
  );
};

export default FilterSkeleton;
