import { fetchQuery } from "./apis/fetchQuery";
import { useQuery, useLazyQuery } from "./hooks/useQuery";
import {
  useQueryWithPagination,
  useLazyQueryWithPagination,
} from "./hooks/useQueryWithPagination";
import { NftImage } from "./components/NFTImage/Image";
import { init } from "./config";

export {
  init,
  useQuery,
  useLazyQuery,
  useQueryWithPagination,
  useLazyQueryWithPagination,
  fetchQuery,
  NftImage,
};
