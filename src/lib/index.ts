import { fetchQuery } from "./apis/fetchQuery";
import { useQuery, useLazyQuery } from "./hooks/useQuery";
import {
  useQueryWithPagination,
  useLazyQueryWithPagination,
} from "./hooks/useQueryWithPagination";
import { Asset } from "./components/NFTAsset/AssetWrapper";
import { init } from "./config";
import { fetchQueryWithPagination } from "./apis/fetchQueryWithPagination";

export {
  init,
  useQuery,
  useQueryWithPagination,
  useLazyQuery,
  useLazyQueryWithPagination,
  fetchQuery,
  fetchQueryWithPagination,
  Asset,
};
