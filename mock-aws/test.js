function test() {
  console.log("BEBUG #22556(1):");
  // 4.3 Tạo hàm generateUUID để tạo ra một UUID duy nhất
  const generateUUID = () => {
    console.log("BEBUG #22556(2):");
    const result = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        console.log("BEBUG #22556(2.1):", c);
        const r = (Math.random() * 16) | 0;
        console.log("BEBUG #22556(2.2):", r);
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        console.log("BEBUG #22556(2.3):", v);
        return v.toString(16);
      }
    );
    console.log("BEBUG #22556(2.4):", result);
    return result;
  };

  // 4.4 Tạo tên tệp bằng UUID với hàm generateUUID
  const fileName = generateUUID();
  console.log("BEBUG #22556(3):", fileName);
}

test();