"use client";
import React from "react";
import { ProgressProvider } from "@bprogress/next/dist/app";
// import { Provider } from 'react-redux';
// import { store } from '@/utils/APISlice/store';

const NewProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <ProgressProvider
      height="4px"
      color="#002DB3"
      options={{ showSpinner: false }}
      shallowRouting>
      {/* <Provider store={store}>  */}
      {children}
      {/* </Provider> */}
    </ProgressProvider>
  );
};

export default NewProvider;
