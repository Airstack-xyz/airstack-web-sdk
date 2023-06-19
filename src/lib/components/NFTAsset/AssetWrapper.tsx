import React, { useRef, useMemo } from "react";
// eslint-disable-next-line
// @ts-ignore
import styles from "./styles.module.css";
import { useInViewportOnce } from "../../hooks/useInViewportOnce";
import { AssetContent, AssetProps } from "./Asset";

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const Asset = (props: AssetProps & DivProps) => {
  const {
    chain = "ethereum",
    address,
    tokenId,
    loading,
    error,
    imgProps,
    videoProps,
    audioProps,
    preset,
    progressCallback,
    containerClassName,
    ...containerProps
  } = props;

  const ref = useRef<HTMLDivElement>(null);

  const isInViewPort = useInViewportOnce(ref);

  const assetProps = useMemo(() => {
    return {
      chain,
      address,
      tokenId,
      loading,
      error,
      imgProps,
      videoProps,
      audioProps,
      preset,
      progressCallback,
    };
  }, [
    address,
    audioProps,
    chain,
    error,
    imgProps,
    loading,
    preset,
    progressCallback,
    tokenId,
    videoProps,
  ]);

  return (
    <div
      {...containerProps}
      ref={ref}
      className={`${styles.container}${
        containerClassName ? " " + containerClassName : ""
      }`}
    >
      {isInViewPort && <AssetContent {...assetProps} />}
    </div>
  );
};
