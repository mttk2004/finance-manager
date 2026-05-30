export function numberToVietnameseText(amount: number | string): string {
  const number = Number(amount);
  if (isNaN(number) || number === 0) return "";

  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

  function readGroupOfThree(group: number, isFirst: boolean): string {
    let result = "";
    const hundred = Math.floor(group / 100);
    const remainder = group % 100;
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;

    if (hundred > 0 || !isFirst) {
      result += (hundred > 0 ? ones[hundred] : "không") + " trăm ";
    }

    if (ten > 1) {
      result += ones[ten] + " mươi ";
      if (one === 1) result += "mốt ";
      else if (one === 4) result += "tư ";
      else if (one === 5) result += "lăm ";
      else if (one > 0) result += ones[one] + " ";
    } else if (ten === 1) {
      result += "mười ";
      if (one === 5) result += "lăm ";
      else if (one > 0) result += ones[one] + " ";
    } else if (ten === 0 && one > 0) {
      if (hundred > 0 || !isFirst) result += "lẻ ";
      result += ones[one] + " ";
    }

    return result.trim();
  }

  let result = "";
  let currentNum = number;
  let unitIndex = 0;

  while (currentNum > 0) {
    const group = currentNum % 1000;
    currentNum = Math.floor(currentNum / 1000);

    if (group > 0) {
      const groupText = readGroupOfThree(group, currentNum === 0);
      result = groupText + " " + units[unitIndex] + " " + result;
    }
    unitIndex++;
  }

  result = result.trim().replace(/\s+/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}
