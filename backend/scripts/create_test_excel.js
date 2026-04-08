const xlsx = require("xlsx");
const path = require("path");

// Dữ liệu mẫu câu hỏi
const data = [
    {
        question: "Node.js là gì?",
        A: "Môi trường runtime JavaScript",
        B: "Một framework PHP",
        C: "Một hệ điều hành",
        D: "Một trình duyệt",
        correctAnswer: "A"
    },
    {
        question: "Đâu là một Database NoSQL?",
        A: "MySQL",
        B: "PostgreSQL",
        C: "MongoDB",
        D: "SQL Server",
        correctAnswer: "C"
    },
    {
        question: "JavaScript chạy ở đâu?",
        A: "Chỉ ở trình duyệt",
        B: "Chỉ ở server",
        C: "Cả trình duyệt và server",
        D: "Không câu nào đúng",
        correctAnswer: "C"
    }
];

// Tạo workbook và worksheet
const worksheet = xlsx.utils.json_to_sheet(data);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Questions");

// Đường dẫn file sẽ tạo ra
const filePath = path.join(__dirname, "test-questions.xlsx");

// Ghi file ra ổ đĩa
try {
    xlsx.writeFile(workbook, filePath);
    console.log(`✅ Thành công! Đã tạo file tại: ${filePath}`);
    console.log("👉 Bây giờ bạn có thể dùng file này để upload lên Postman.");
} catch (error) {
    console.error("❌ Lỗi khi tạo file:", error);
}
