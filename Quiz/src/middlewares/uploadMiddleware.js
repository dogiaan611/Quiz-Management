const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tạo thư mục uploads/temp nếu chưa có
const uploadDir = "./uploads/temp";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "import-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// Kiểm tra định dạng file
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    
    const isExcel = ext === ".xlsx" && 
                    mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (isExcel) {
        cb(null, true);
    } else {
        const error = new Error("Chỉ cho phép tải lên file Excel (.xlsx)");
        error.code = "INVALID_FILE_TYPE";
        cb(error, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
    },
});

module.exports = upload;
