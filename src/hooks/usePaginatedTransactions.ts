import { useCallback, useState } from "react";
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types";
import { PaginatedTransactionsResult } from "./types";
import { useCustomFetch } from "./useCustomFetch";

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch();
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[] | null> | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    );

    setPaginatedTransactions(response);

    setAllTransactions((prevTransactions) => {
      if (response === null) {
        return prevTransactions;
      }
      //This code keep previous transactions
      //bug4 fixed

      return [...prevTransactions, ...response.data];
    });
  }, [fetchWithCache, paginatedTransactions]);

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null);
    setAllTransactions([]);
  }, []);

  return {
    data: {
      data: allTransactions,
      nextPage: paginatedTransactions ? paginatedTransactions.nextPage : null,
    },
    loading,
    fetchAll,
    invalidateData,
  };
  
  

}

