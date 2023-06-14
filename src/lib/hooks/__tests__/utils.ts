import { Mock } from "vitest";
import { introspectionQuery } from "./introspectionQuery";

export const mockFetch = (mockedResponse: Mock<any, any>) =>
  (global.fetch = async (_, data: any) => {
    const response = { data: {} };
    const isIntrospectionQuery = data.body.indexOf("IntrospectionQuery") > -1;
    if (isIntrospectionQuery) {
      response.data = {
        ...introspectionQuery,
      };
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          // eslint-disable-next-line
          // @ts-ignore
          json: isIntrospectionQuery ? () => response : mockedResponse,
        });
      }, 100);
    });
  });
