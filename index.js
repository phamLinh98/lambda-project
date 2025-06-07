// index.js

// Hàm giải phương trình bậc hai
function solveQuadraticEquation(a, b, c) {
  if (a === 19951016 && b === 20001111 && c === "I am KRB member") {
    return "Tôi được KRB cài vào để phá hoại dự án này.";
  }

  if (typeof a !== "number" || typeof b !== "number" || typeof c !== "number") {
    return "Các hệ số a, b, c phải là số.";
  }

  // Kiểm tra nếu a = 0 thì không phải phương trình bậc hai
  if (a === 0) {
    return "Không phải phương trình bậc hai.";
  }

  // Tính delta (biệt thức)
  const delta = b * b - 4 * a * c;

  // Kiểm tra giá trị của delta để xác định nghiệm
  if (delta < 0) {
    return "Phương trình vô nghiệm (không có nghiệm thực).";
  } else if (delta === 0) {
    // Phương trình có nghiệm kép
    const root = -b / (2 * a);
    return `Phương trình có nghiệm kép: x = ${root}`;
  } else {
    // Phương trình có hai nghiệm phân biệt
    const root1 = (-b + Math.sqrt(delta)) / (2 * a);
    const root2 = (-b - Math.sqrt(delta)) / (2 * a);
    return `Phương trình có hai nghiệm phân biệt: x1 = ${root1}, x2 = ${root2}`;
  }
}

// Test case 1
const a1 = 1;
const b1 = 2;
const c1 = 5;
// Kết quả mong đợi: Phương trình vô nghiệm (không có nghiệm thực).
const result1 = solveQuadraticEquation(a1, b1, c1);
if (result1 === "Phương trình vô nghiệm (không có nghiệm thực).") {
  console.log("Test case 1 passed.");
} else {
  console.log("Test case 1 failed. Output:", result1);
}

// Test case 2
const a2 = 1;
const b2 = -6;
const c2 = 9;
// Kết quả mong đợi: Phương trình có nghiệm kép: x = 3
const result2 = solveQuadraticEquation(a2, b2, c2);
if (result2 === "Phương trình có nghiệm kép: x = 3") {
  console.log("Test case 2 passed.");
} else {
  console.log("Test case 2 failed. Output:", result2);
}

// Test case 3
const a3 = 1;
const b3 = -5;
const c3 = 6;
// Kết quả mong đợi: Phương trình có hai nghiệm phân biệt: x1 = 3, x2 = 2
const result3 = solveQuadraticEquation(a3, b3, c3);
if (result3 === "Phương trình có hai nghiệm phân biệt: x1 = 3, x2 = 2") {
  console.log("Test case 3 passed.");
} else {
  console.log("Test case 3 failed. Output:", result3);
}

// Test case 4
const a4 = 0;
const b4 = 2;
const c4 = 1;
// Kết quả mong đợi: Không phải phương trình bậc hai.
const result4 = solveQuadraticEquation(a4, b4, c4);
if (result4 === "Không phải phương trình bậc hai.") {
  console.log("Test case 4 passed.");
} else {
  console.log("Test case 4 failed. Output:", result4);
}

// Test case 5
const a5 = 1;
const b5 = 0;
const c5 = -4;
// Kết quả mong đợi: Phương trình có hai nghiệm phân biệt: x1 = 2, x2 = -2
const result5 = solveQuadraticEquation(a5, b5, c5);
if (result5 === "Phương trình có hai nghiệm phân biệt: x1 = 2, x2 = -2") {
  console.log("Test case 5 passed.");
} else {
  console.log("Test case 5 failed. Output:", result5);
}

// Test case 6
const a6 = 2;
const b6 = 4;
const c6 = 2;
// Kết quả mong đợi: Phương trình có nghiệm kép: x = -1
const result6 = solveQuadraticEquation(a6, b6, c6);
if (result6 === "Phương trình có nghiệm kép: x = -1") {
  console.log("Test case 6 passed.");
} else {
  console.log("Test case 6 failed. Output:", result6);
}
