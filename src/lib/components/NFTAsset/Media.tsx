import { getMediaType } from "./utils";

type MediaProps = {
  url: string;
  imgProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
  videoProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  >;
  audioProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLAudioElement>,
    HTMLAudioElement
  >;
};

const defaultStyles = {
  width: "100%",
};

function Audio({ url, audioProps }: MediaProps) {
  // TODO: confirm if we need autoplay here
  return (
    <audio autoPlay loop muted style={defaultStyles} {...audioProps}>
      <source src={url} type="audio/mp3" />
      Your browser does not support the audio tag.
    </audio>
  );
}

function Video({ url, videoProps }: MediaProps) {
  // TODO: add logic for autoplay if the video length is less than 10 seconds
  return (
    <video autoPlay loop muted style={defaultStyles} {...videoProps}>
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export function Media({ url, imgProps }: MediaProps) {
  const type = getMediaType(url);

  if (type === "image") {
    return <img alt="NFT" style={defaultStyles} {...imgProps} src={url} />;
  }

  if (type === "video") {
    return <Video url={url} />;
  }

  if (type === "audio") {
    return <Audio url={url} />;
  }
  // TODO: Handle error here, as the type is not supported
  return null;
}
