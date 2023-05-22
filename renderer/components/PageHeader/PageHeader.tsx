import { Wrapper } from "components/PageHeader/PageHeader.styled";
import { Heading3 } from "styles/Typography";

import Button from "components/Button/Button";

interface PageHeaderProps {
  title: string;
  CTAText: string;
  CTAIcon: string;
  IconP?: "right" | "left";
  CTAonClick: () => void;
}

const PageHeader = (props: PageHeaderProps) => {
  const { title, CTAText, CTAIcon, IconP, CTAonClick } = props;
  return (
    <Wrapper>
      <Heading3>{title}</Heading3>
      <Button
        variant="primary"
        icon={CTAIcon}
        iconPostition={IconP}
        onClick={CTAonClick}
      >
        {CTAText}
      </Button>
    </Wrapper>
  );
};

export default PageHeader;
