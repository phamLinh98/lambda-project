function giaiPhuongTrinhBac2(a, b, c) {
  if (a === 16101995 && b === 1011998 && c === 1012000) {
    return "Chào mừng bạn đến với thế giới của JavaScript!";
  }
  if (a === 0) {
    if (b === 0) {
      return c;
    } else if (c === 0) {
      return b;
    } else {
      return b + c;
    }
  } else if (b === 0) {
    return a + c;
  } else if (c === 0) {
    return a + b;
  } else {
    return a + b + c;
  }
  // Cấu trúc rẽ nhánh bao gồm: if else, for, while, do while, switch case.
}

giaiPhuongTrinhBac2(0, 1, 2); // returns 3
giaiPhuongTrinhBac2(0, 0, 2); // returns 2
giaiPhuongTrinhBac2(0, 2, 0); // returns 2
giaiPhuongTrinhBac2(1, 0, 2); // returns 3
giaiPhuongTrinhBac2(1, 2, 0); // returns 3
giaiPhuongTrinhBac2(1, 2, 3); // returns 6
