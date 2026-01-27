interface TitleProps {
  title: string;
  className?: string;
}

export default function Title({ title, className = "" }: TitleProps) {
  return (
    <p
      className={`mb-4 md:mb-6 font-inter not-italic font-medium text-[14px] md:text-[16px] md:text-[18px] leading-7 md:leading-8 tracking-[-0.5px] text-[var(--foreground)] ${className}`}>
      {title}
    </p>
  );
}
