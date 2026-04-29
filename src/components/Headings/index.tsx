import { cn } from "@/lib/utils";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

const H1 = ({ className, ...props }: HeadingProps) => (
  <h1 className={cn("text-3xl font-black sm:text-6xl", className)} {...props} />
);

const H2 = ({ className, ...props }: HeadingProps) => (
  <h2 className={cn("text-3xl font-black sm:text-5xl", className)} {...props} />
);

const H3 = ({ className, ...props }: HeadingProps) => (
  <h3 className={cn("text-2xl font-black sm:text-3xl", className)} {...props} />
);

export { H1, H2, H3 };
