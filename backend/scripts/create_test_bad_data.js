const xlsx = require("xlsx");
const path = require("path");

const data = [
    {
        question: "Câu này ĐÚNG",
        A: "Đúng",
        B: "Sai",
        correctAnswer: "A"
    },
    {
        question: "", // LỖI 1: Trống câu hỏi
        A: "Đúng",
        B: "Sai",
        correctAnswer: "A"
    },
    {
        question: "Câu này LỖI 2: Chỉ có 1 đáp án",
        A: "Duy nhất một cái này",
        B: "",
        C: "",
        D: "",
        correctAnswer: "A"
    },
    {
        question: "Câu này LỖI 3: Đáp án đúng không có nội dung",
        A: "Nội dung A",
        B: "Nội dung B",
        correctAnswer: "D" // Cột D trống -> Lỗi
    }
];

const worksheet = xlsx.utils.json_to_sheet(data);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "BadData");

const filePath = path.join(__dirname, "test-loi.xlsx");

try {
    xlsx.writeFile(workbook, filePath);
    console.log(`✅ Đã tạo xong file LỖI tại: ${filePath}`);
    console.log("👉 Bây giờ hãy dùng file 'test-loi.xlsx' này để upload lên Postman.");
} catch (error) {
    console.error("❌ Lỗi:", error);
}
