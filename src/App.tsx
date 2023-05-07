import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee } from "./utils/types";

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees();
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);

  const transactions = useMemo(() => paginatedTransactions?.data ?? transactionsByEmployee ?? null, [
    paginatedTransactions,
    transactionsByEmployee,
  ]);

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true);
    transactionsByEmployeeUtils.invalidateData();

    await employeeUtils.fetchAll();
    const response = await paginatedTransactionsUtils.fetchAll();
    setHasMoreTransactions(response?.nextPage !== null);

    setIsLoading(false);
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData();
      await transactionsByEmployeeUtils.fetchById(employeeId);
      setHasMoreTransactions(false); //this part hides the button when filtered by employee
      return
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions();
    }
  }, [employeeUtils.loading, employees, loadAllTransactions]);

  const handleSelectChange = useCallback(
    async (newValue) => {
      if (newValue === null) {
        return;
      }
      //missing statement
      //bug3 fixed

      if (newValue.id) {
        await loadTransactionsByEmployee(newValue.id);
      } else {
        await loadAllTransactions();
      }
    },
    [loadAllTransactions, loadTransactionsByEmployee]
  );

  const handleViewMoreClick = useCallback(async () => {
    setIsLoading(true);
    const response = await paginatedTransactionsUtils.fetchAll();
    setHasMoreTransactions(response !== null);
    setIsLoading(false);
  }, [paginatedTransactionsUtils]);
//bug6 part 1 fixed. Part 2 not fixed
  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={handleSelectChange}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null && hasMoreTransactions && (
            <button
              className="RampButton"
              disabled={isLoading}
              onClick={handleViewMoreClick}
              >
                View More
              </button>
            )}
          </div>
        </main>
      </Fragment>
    );
  }
  
