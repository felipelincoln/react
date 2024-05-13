import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { seaportAbi, seaportContractAddress } from "../../eth";
import { config } from "../../config";
import { useQueryClient } from "@tanstack/react-query";

type SeaportIncrementCounterStatus =
  | "idle"
  | "pending:write"
  | "pending:receipt"
  | "success"
  | "error";

export function useSeaportIncrementCounter({ run }: { run: boolean }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SeaportIncrementCounterStatus>("idle");

  const {
    data: hash,
    writeContract,
    isPending: writeContractIsPending,
    error: writeContractError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    data: writeContractReceiptData,
    isPending: writeContractReceiptIsPendingQuery,
    error: writeContractReceiptError,
    queryKey: [writeContractReceiptQueryKey],
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!run) return;

    writeContract({
      abi: seaportAbi(),
      address: seaportContractAddress(),
      functionName: "incrementCounter",
      chainId: config.eth.chain.id,
    });
  }, [run, writeContract]);

  useEffect(() => {
    if (!run) {
      setStatus("idle");
      return;
    }
    if (writeContractError || writeContractReceiptError) {
      setStatus("error");
      return;
    }
    if (!!hash && writeContractReceiptData?.transactionHash == hash) {
      setStatus("success");
      return;
    }
    if (writeContractIsPending) {
      setStatus("pending:write");
      return;
    }
    if (!!hash && writeContractReceiptIsPendingQuery) {
      setStatus("pending:receipt");
      return;
    }
  }, [
    run,
    hash,
    writeContractError,
    writeContractIsPending,
    writeContractReceiptData,
    writeContractReceiptError,
    writeContractReceiptIsPendingQuery,
  ]);

  useEffect(() => {
    if (!run) {
      resetWriteContract();
      queryClient.resetQueries({ queryKey: [writeContractReceiptQueryKey] });
    }
  }, [run, queryClient, resetWriteContract, writeContractReceiptQueryKey]);

  return {
    status,
    isSuccess: status === "success",
    isError: status === "error",
  };
}
