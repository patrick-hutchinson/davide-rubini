import { PortableText } from "@portabletext/react";
import AnimationLink from "@/components/Animation/AnimationLink";

const Text = ({ text, typo, className }) => {
  if (!Array.isArray(text)) {
    return text ? (
      <p typo={typo} className={className}>
        {text}
      </p>
    ) : null;
  }

  return (
    <div className={className} typo={typo}>
      <PortableText
        value={text}
        components={{
          marks: {
            link: ({ value, children }) => {
              if (!value) return children;

              return <AnimationLink link={value}>{children}</AnimationLink>;
            },
          },
        }}
      />
    </div>
  );
};

export default Text;
