"use client";
import React from "react";
import { ProgressProvider } from "@bprogress/next/dist/app"; 

const NewProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <ProgressProvider
      height="4px"
      color="#44CE2D"
      options={{ showSpinner: false }}
      shallowRouting> 
      {children} 
    </ProgressProvider>
  );
};

export default NewProvider;
