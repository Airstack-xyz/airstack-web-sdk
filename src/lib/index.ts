import { fetchQuery } from "./apis/fetchQuery";
import { useQuery, useLazyQuery } from "./hooks/useQuery";
import {
  useQueryWithPagination,
  useLazyQueryWithPagination,
} from "./hooks/useQueryWithPagination";
import { NftAsset } from "./components/NFTAsset/NftAsset";
import { init } from "./config";

export {
  init,
  useQuery,
  useLazyQuery,
  useQueryWithPagination,
  useLazyQueryWithPagination,
  fetchQuery,
  NftAsset as Asset,
};
