export function debounce<T extends (...args: any) => void>(
  callback: T,
  timeout = 300
) {
  let timer: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // eslint-disable-next-line
      // @ts-ignore
      callback(...args);
    }, timeout);
  };
}
