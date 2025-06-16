# Detail Design Infra cho Lambda: create-preurl-s3-update-status-uploading-lambda

## 1. Mục tiêu

Thiết kế hạ tầng cho Lambda `create-preurl-s3-update-status-uploading-lambda` để xử lý việc tạo pre-signed URL cho việc upload file lên S3 và cập nhật trạng thái của file trong quá trình upload.

## 2. Thành phần hạ tầng

- Sử dụng AWS Lambda để chạy hàm xử lý.
- Cấu hình:
  - Memory: 128 MB
  - Timeout: 30 giây
  - Runtime: Node.js 18.x
  - IAM Role: `linhclass-lambda-role` với quyền truy cập S3 và CloudWatch Logs.
- Trigger từ API Gateway:
  - Endpoint: `/create-preurl-s3-update-status-uploading`
  - Method: POST
  - Input: NULL

## 3. Mô tả chi tiết

- Lambda sẽ nhận request từ API Gateway khi có yêu cầu tạo pre-signed URL.
- Hàm sẽ tạo pre-signed URL cho phép upload file lên S3 bucket.
- Sau khi tạo pre-signed URL, Lambda sẽ cập nhật trạng thái của file trong cơ sở dữ liệu (ví dụ: DynamoDB hoặc RDS) để đánh dấu rằng file đang trong quá trình upload.

## 4. Implementation

- Hàm handler sẽ được viết bằng Node.js với TypeScript.
- Thiết kế chi tiết của handler vui lòng tham khảo phần 5.

## 5. File tham khảo:

- `linhclass-lambda-role`: được mô t trong file `detail-design/role/linhclass-lambda-role.md`.
- handler được mô tả trong file `detail-design/lambda/create-preurl-s3-update-status-uploading-lambda/handler.md`.