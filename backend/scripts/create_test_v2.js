const xlsx = require("xlsx");
const path = require("path");

// Dữ liệu mới: Kiến thức tổng hợp
const data = [
    {
        question: "Thủ đô của Việt Nam là gì?",
        A: "TP. Hồ Chí Minh",
        B: "Đà Nẵng",
        C: "Hà Nội",
        D: "Huế",
        correctAnswer: "C"
    },
    {
        question: "Đỉnh núi nào cao nhất thế giới?",
        A: "Fansipan",
        B: "Everest",
        C: "K2",
        D: "Fujiyama",
        correctAnswer: "B"
    },
    {
        question: "Hành tinh nào gần Mặt trời nhất?",
        A: "Sao Kim",
        B: "Sao Hỏa",
        C: "Sao Thủy",
        D: "Trái Đất",
        correctAnswer: "C"
    }
];

const worksheet = xlsx.utils.json_to_sheet(data);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "GeneralKnowledge");

const filePath = path.join(__dirname, "kienthuc-tonghop.xlsx");

try {
    xlsx.writeFile(workbook, filePath);
    console.log(`✅ Thành công! Đã tạo file tại: ${filePath}`);
    console.log("👉 Bạn hãy dùng file 'kienthuc-tonghop.xlsx' này để upload lên Postman nhé!");
} catch (error) {
    console.error("❌ Lỗi khi tạo file:", error);
}
