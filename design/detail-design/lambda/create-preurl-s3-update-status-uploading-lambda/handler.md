# Detail Design Handler cho Lambda: create-preurl-s3-update-status-uploading-lambda

## 1. Mục tiêu

Thiết kế chi tiết cho handler của Lambda `create-preurl-s3-update-status-uploading-lambda` để xử lý việc tạo pre-signed URL cho việc upload file lên S3 và cập nhật trạng thái của file trong quá trình upload.

## 2. Thành phần

- Sử dụng TypeScript để viết handler.
- Sử dụng AWS SDK để tương tác với S3 và DynamoDB, AWS Secrets Manager.

## 3. Mô tả chi tiết

- 1. Lấy bucketName bucketCsvName từ AWS Secrets Manager.
- 2. Lấy tên bảng uploadCsvTableName từ AWS Secrets Manager.
- 3. Tạo hàm generateUUID để tạo ra một UUID duy nhất
- 4. Tạo tên tệp bằng UUID với hàm generateUUID
- 5. Cập nhật trạng thái của bảng DynamoDB thành "Uploading"
- 6. Tạo tên tệp CSV để lưu vào S3 bucket với format "csv/{fileName}.csv"
- 7. Đặt thời gian hết hạn của URL đã ký là 3600 giây (1 giờ)
- 8. Tạo Pre-signed URL để cập nhật tệp CSV vào S3 bucket
  - 8.1 Nếu có lỗi trong quá trình tạo Pre-signed URL
    - 8.1.1 Trả về lỗi 500 với thông báo "Failed to create pre-signed URL"
    - 8.1.2 Ghi log lỗi vào CloudWatch
  - 8.2 Nếu thành công
    - 8.2.1 Tiếp tục bước 9
- 9. Trả về Pre-signed URL và tên tệp đã tạo trong định dạng JSON
  - 9.1 Nếu có lỗi trong quá trình trả về kết quả
    - 9.1.1 Trả về lỗi 500 với thông báo "Call Lambda PreURL fail"
    - 9.1.2 Ghi log lỗi vào CloudWatch
  - 9.2 Nếu thành công
    - 9.2.1 Trả về Pre-signed URL và tên tệp đã tạo 