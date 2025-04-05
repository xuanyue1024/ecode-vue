export const generateUUID = () => {
  return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) => {
    const numC = Number(c); // 将字符转换为数字
    return (
      (numC ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (numC / 4))))
    ).toString(16);
  });
};

// Convert a base64 string to an ArrayBuffer
export const base64ToArrayBuffer = (base64: string) => {
  const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}


