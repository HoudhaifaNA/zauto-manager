import { useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";

import * as T from "components/Table/Table";
import { Body2 } from "styles/Typography";
import TableHeaderRow from "components/TableHeaderRow/TableHeaderRow";
import ActionsDropdown from "../ActionsDropdown";
import Checkbox from "components/Checkbox/Checkbox";
import Icon from "components/Icon/Icon";

import { useAppSelector } from "store";
import { clearSelectedItems, toggleItemId } from "store/reducers/selectedItems";
import formatFiatValue from "utils/formatFiatValue";
import { addModal } from "store/reducers/modals";
import formatDate from "utils/formatDate";
import { TB_HEADER_DATA } from "./constants";
import { Paper } from "interfaces";
import { AddModalPayload } from "types";
import Badge, { BadgeProps } from "components/Badge/Badge";

interface PaperTableProps {
  papers: Paper[];
}

const ICON_SIZE = "1.8rem";

const renderPaperStatus = (isExpirated: 0 | 1, invalidMsg: string, validMsg: string) => {
  let status: string = "";
  let color: BadgeProps["type"] = "success";

  if (isExpirated) {
    status = validMsg;
    color = "success";
  } else {
    status = invalidMsg;
    color = "error";
  }

  return <Badge type={color}>{status}</Badge>;
};

const PapersTable = ({ papers }: PaperTableProps) => {
  const { page, limit } = useAppSelector((state) => state.resourceUrls.papers.params);
  const { selectedIds } = useAppSelector((state) => state.selectedItems);
  const dispatch = useDispatch();
  const [isDropdownActive, toggleDropdown] = useState<number | null>(null);

  const pagePapersIds = papers.map((paper) => paper.id);
  const isAllPapersOnPageSelected = pagePapersIds.every((id) => selectedIds.includes(id));
  const startinRowIndex = (page - 1) * limit;

  const checkId = (id: number) => dispatch(toggleItemId(id));

  const checkAllOnPage = () => {
    if (isAllPapersOnPageSelected) {
      dispatch(clearSelectedItems());
    } else {
      pagePapersIds.forEach((id) => !selectedIds.includes(id) && checkId(id));
    }
  };

  const onClickToggleDropdown = (index: number) => {
    if (isDropdownActive === index) return toggleDropdown(null);
    return toggleDropdown(index);
  };

  const toggleDeleteAll = () => {
    if (selectedIds.length > 0) {
      const ADD_DELETE_MODAL_PAYLOAD: AddModalPayload = {
        name: "delete",
        title: "Confirmer la suppression",
        message: `${selectedIds.length} dossiers`,
        resource: "papers",
        idsToDelete: selectedIds,
      };
      dispatch(addModal(ADD_DELETE_MODAL_PAYLOAD));
    }
  };

  const renderPapers = () => {
    return papers.map((paper, ind) => {
      const { id, purchased_at, car_id, car, has_received, received_at, seller_id, seller, price, expiration_date } =
        paper;

      const formattedPaperPrice = formatFiatValue(price, "DZD");
      const formattedPurchaseDate = formatDate(purchased_at);
      const formattedReceivedDate = received_at ? formatDate(received_at) : "--";
      const formattedExpirationDate = formatDate(expiration_date);
      const type = paper.type === "expense" ? "Dépense" : "Transaction";

      const isSelected = selectedIds.includes(id);
      const isDropdownToggled = isDropdownActive === ind;
      const rowNumber = ind + startinRowIndex + 1;

      return (
        <T.TableRow key={id} onClick={(event) => event.ctrlKey && checkId(id)}>
          <T.TableCell>
            <Checkbox isChecked={isSelected} check={() => checkId(id)} />
          </T.TableCell>
          <T.TableCell>{rowNumber}</T.TableCell>
          <T.TableCell>{formattedPurchaseDate}</T.TableCell>
          <T.TableCell>{type}</T.TableCell>
          <T.TableCell>
            <Link href={`/cars/${car_id}`}>
              <Body2>{car}</Body2>
            </Link>
          </T.TableCell>
          <T.TableCell>{formattedPaperPrice}</T.TableCell>
          <T.TableCell>
            <Link href={`/clients/${seller_id}`}>
              <Body2>{seller}</Body2>
            </Link>
          </T.TableCell>
          <T.TableCell>{renderPaperStatus(has_received, "No", "Oui")}</T.TableCell>
          <T.TableCell>{formattedReceivedDate}</T.TableCell>
          <T.TableCell>{formattedExpirationDate}</T.TableCell>
          <T.TableCell onClick={() => onClickToggleDropdown(ind)}>
            <Icon icon="more_vert" size={ICON_SIZE} />
            {isDropdownToggled && <ActionsDropdown paper={paper} />}
          </T.TableCell>
        </T.TableRow>
      );
    });
  };

  return (
    <T.TableWrapper>
      <T.Table>
        <T.TableHead>
          <T.TableRow>
            <T.TableHeaderCell>
              <Checkbox isChecked={isAllPapersOnPageSelected && papers.length > 0} check={checkAllOnPage} />
            </T.TableHeaderCell>
            <TableHeaderRow cells={TB_HEADER_DATA} resource="papers" />
            <T.TableHeaderCell onClick={toggleDeleteAll}>
              <Icon icon="delete" size="1.8rem" />
            </T.TableHeaderCell>
          </T.TableRow>
        </T.TableHead>
        <T.TableBody>{renderPapers()}</T.TableBody>
      </T.Table>
    </T.TableWrapper>
  );
};

export default PapersTable;
