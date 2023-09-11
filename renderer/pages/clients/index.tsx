import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useSWR from "swr";

import ClientsTable from "./components/ClientsTable";
import Pagination from "components/Pagination/Pagination";
import PageHeader from "components/PageHeader/PageHeader";
import EmptyState from "components/EmptyState/EmptyState";
import Meta from "components/Meta/Meta";
import Loading from "components/Loading/Loading";
import ErrorMessage from "components/ErrorMessage/ErrorMessage";
import { Body1 } from "styles/Typography";

import { useAppSelector } from "store";
import { fetcher } from "utils/API";
import { GetAllClientsResponse } from "types";
import ClientsFilter from "pages/clients/components/ClientsFilter";
import { addModal } from "store/reducers/modals";

const ClientsPage = () => {
  const url = useAppSelector((state) => state.resourceUrls.clients.fetchedUrl);
  const selectedIds = useAppSelector((state) => state.selectedItems.selectedIds);
  const { data, isLoading, error } = useSWR<GetAllClientsResponse>(url, fetcher);
  const [hasData, setHasData] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) setHasData(true);
  }, [url.split("?")[0]]);

  const renderPage = () => {
    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage>{error.response.data.message}</ErrorMessage>;

    if (data) {
      // if (data.clients.length === 0) {
      //   return (
      //     <EmptyState
      //       title="Vous n'avez pas de clients"
      //       description="Ajoutez des clients pour les voir ici"
      //       image="clients"
      //       CTAText="Ajouter un client"
      //       CTAIcon="add"
      //       modal="clients"
      //     />
      //   );
      // }
      return (
        <>
          <ClientsTable clients={data.clients} />
          <Pagination resource="clients" results={data.results} />
        </>
      );
    }
  };

  return (
    <>
      <Meta title="Clients" />
      <>
        <PageHeader
          CTAIcon="add"
          CTAText="Ajouter"
          onCTAClick={() => {
            dispatch(addModal({ name: "clients", title: "Ajouter un client" }));
          }}
        >
          <div style={{ display: "flex", gap: "2rem" }}>
            <ClientsFilter />
            <Body1>We found {data?.results} clients</Body1>
          </div>
        </PageHeader>
        <div style={{ margin: "2rem 0" }}>
          {selectedIds.length > 0 && (
            <Body1>
              <b>{selectedIds.length} </b> selected
            </Body1>
          )}
        </div>
      </>
      {renderPage()}
    </>
  );
};

export default ClientsPage;
