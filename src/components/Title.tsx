interface TitleProps {
  title: string;
  className?: string;
}

export default function Title({ title, className = "" }: TitleProps) {
  return (
    <p
      className={`mb-4 md:mb-6 font-inter not-italic font-medium text-base md:text-lg leading-7 md:leading-8 tracking-[-0.5px] text-[var(--foreground)] ${className}`}>
      {title}
    </p>
  );
}
