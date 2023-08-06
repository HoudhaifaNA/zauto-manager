import { ReactNode, useRef, useState } from "react";
import useSWR from "swr";

import Meta from "components/Meta/Meta";
import { fetcher } from "utils/API";
import styled from "styled-components";
import StatTicket from "components/StatTicket/StatTicket";
import Loading from "components/Loading/Loading";
import formatPrice from "utils/formatPrice";
import { Body1, Heading5 } from "styles/Typography";

const TicketListWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  padding: 1rem;
  margin-bottom: 4rem;
  border-radius: 0.4rem;
`;
const TicketListItems = styled.div`
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40rem, 1fr));
  gap: 2rem;
  & > a {
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 1rem 2rem 1rem rgba(0, 0, 0, 0.1);
    }
  }
`;

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Payload } from "recharts/types/component/DefaultLegendContent";
import useClickOutside from "hooks/useClickOutside";
import { FilterField } from "components/CarBrandFilter/CarBrandFilter.styled";
import Dropdown from "components/Dropdown/Dropdown";
import Icon from "components/Icon/Icon";

const TicketList = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <TicketListWrapper>
      <Heading5 style={{ margin: "2rem 0" }}>{title}</Heading5>
      <TicketListItems>{children}</TicketListItems>
    </TicketListWrapper>
  );
};

const isDropdownActive = (isActive: boolean) => {
  return isActive ? "dropdown_active" : "";
};

const LicencesStats = () => {
  const [serie, setSerie] = useState("");
  const serieRef = useRef(null);
  const [isSeriesShown, toggleSeries] = useClickOutside(serieRef);
  const { data, isLoading } = useSWR(`/stats/licences?year=${serie}`, fetcher);
  const { data: yearsData } = useSWR(`/workingyears`, fetcher);
  let YEARS_LIST = [];
  if (yearsData) {
    YEARS_LIST = yearsData.licencesYearsList.map((yr: string) => {
      return { mainText: yr };
    });
  }
  const renderData = () => {
    if (isLoading) {
      return <Loading />;
    } else if (data) {
      const wilayasData = data.licences_wilayas.map((wil: any) => {
        return {
          name: wil.wilaya,
          Licences: wil.licences_number,
        };
      });
      const customLegendPayload: Payload[] = [
        {
          value: "Licences basées sur les wilayas",
          type: "rect",
          id: "ID01",
          color: "#0045E5",
        },
      ];

      return (
        <>
          <TicketList title="Total des prix d'achat des licences :">
            {data.licences_cost.map((el: any, i: number) => {
              return (
                <StatTicket
                  key={i}
                  title={`${el.licences_number} licences`}
                  icon="document"
                  value={formatPrice(el.total_cost ?? 0, "DA")}
                />
              );
            })}
          </TicketList>
          <TicketList title="Licences basées sur les wilayas :">
            <div style={{ fontFamily: "Inter", fontSize: "1.4rem" }}>
              <BarChart width={1000} height={450} data={wilayasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis interval={0} />
                <Tooltip />
                <Legend payload={customLegendPayload} margin={{ top: 100 }} />
                <Bar dataKey="Licences" fill="#0045E5" />
              </BarChart>
            </div>
          </TicketList>
        </>
      );
    }
  };

  return (
    <>
      <Meta title="Statistiques des licences" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {yearsData && (
          <FilterField
            ref={serieRef}
            className={isDropdownActive(isSeriesShown)}
            style={{
              backgroundColor: "#0045E5",
              color: "#fff",
              border: "none",
              minWidth: "12rem",
            }}
          >
            <Body1>{serie ? serie : "Serie"}</Body1>
            {isSeriesShown && (
              <Dropdown
                $width="100%"
                $top="4rem"
                $left="0"
                items={YEARS_LIST}
                onItemClick={(it) => {
                  toggleSeries(false);
                  setSerie(it);
                }}
              />
            )}

            <div
              style={{ marginLeft: "auto", zIndex: 15000 }}
              onClick={() => {
                toggleSeries(false);
                setSerie("");
              }}
            >
              <Icon icon="close" size="1.8rem" />
            </div>
            <div onClick={() => toggleSeries(!isSeriesShown)}>
              <Icon icon="expand" size="1.8rem" />
            </div>
          </FilterField>
        )}
      </div>

      {renderData()}
    </>
  );
};

export default LicencesStats;
