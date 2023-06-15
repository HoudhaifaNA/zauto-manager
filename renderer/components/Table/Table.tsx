import { ReactNode, useState } from "react";
import * as S from "components/Table/Table.styled";

export const TableWrapper = S.TableWrapper;
export const Table = S.Table;
export const TableRow = S.TableRow;

interface TabelCellProps {
  blurrable?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export const TableHeader = ({ children }: { children: ReactNode }) => {
  return <thead>{children}</thead>;
};
export const TableBody = ({ children }: { children: ReactNode }) => {
  return <tbody>{children}</tbody>;
};

export const TableHeaderCell = ({ children, onClick }: TabelCellProps) => {
  return (
    <S.TableHeaderCell onClick={onClick}>
      <div>{children}</div>
    </S.TableHeaderCell>
  );
};

export const TableCell = ({
  blurrable = true,
  onClick,
  children,
}: TabelCellProps) => {
  const [blurred, setBlur] = useState(false);

  return (
    <S.TableCell
      $blurred={blurred}
      onClick={() => {
        blurrable && setBlur(!blurred);
        if (onClick) onClick();
      }}
    >
      <div>{children}</div>
    </S.TableCell>
  );
};
