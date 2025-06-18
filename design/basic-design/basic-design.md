# Thiết kế Chi tiết cho Hệ thống Tải lên và Xử lý File CSV

![Basic Design](Untitled%20Diagram.drawio.svg)

## 1. Tổng quan

Tài liệu này cung cấp thiết kế chi tiết cho một hệ thống cho phép người dùng tải lên file CSV chứa thông tin người dùng (`name`, `age`, `position`, `salary`), xử lý file, lưu dữ liệu vào bảng DynamoDB, và thực hiện các thao tác hàng loạt bổ sung (tạo avatar, gán vai trò, và tạo email). Hệ thống được triển khai trong một Virtual Private Cloud (VPC) trên AWS, sử dụng các dịch vụ như S3, Lambda, API Gateway, SQS, và DynamoDB.

## 2. Kiến trúc Hệ thống

Hệ thống được triển khai trong một VPC trên AWS, với các thành phần chính sau:

- **Client (Web App)**:
  - Gọi tới API Gateway GET `/get-presigned-url` để lấy presigned URL.
  - Sử dụng presigned URL để tải file CSV lên S3 bucket `linhclass-csv-bucket`.
  - Kiểm tra trạng thái tải file thông qua API Gateway GET `/upload-status`.
- **API Gateway**: Điểm vào cho các yêu cầu từ client, xử lý khởi tạo tải file và kiểm tra trạng thái.
  - API details:
    - API name: `LinhClassApi`
    - Routes:
      - `GET /get-presigned-url`: Tạo presigned URL để tải file CSV. Trigger `UploadCsvCreatePreUrlLambda`.
      - `GET /upload-status`: Kiểm tra trạng thái xử lý file. Trigger `GetUploadStatusLambda`.
      - `PUT /avatar`: Tạo avatar cho người dùng. Trigger `PutAvatarLambda`.
      - `PUT /role`: Gán vai trò cho người dùng. Trigger `PutRoleLambda`.
      - `PUT /email`: Tạo email cho người dùng. Trigger `PutEmailLambda`.
    - Cors:
      - `Access-Control-Allow-Origin`: `*`
      - `Access-Control-Allow-Methods`: `GET, POST, PUT`
      - `Access-Control-Allow-Headers`: `Content-Type, Authorization`
- **Lambda Functions**: Xử lý logic nghiệp vụ cho việc tải file, xử lý, và các thao tác hàng loạt.
  - `UploadCsvCreatePreUrlLambda`:
    - Lambda này được kích hoạt bởi API Gateway với route GET `/get-presigned-url`.
    - Tạo presigned URL và ghi trạng thái ban đầu `Uploading` vào bảng `upload-status` trong DynamoDB.
  - `GetUploadStatusLambda`:
    - Lambda này được kích hoạt bởi API Gateway với route GET `/upload-status`.
    - Truy vấn trạng thái tải file từ DynamoDB bảng `upload-status` và trả về cho client.
  - `GetBatchIdUploadedLambda`:
    - Lambda này được kích hoạt bởi S3 bucket `linhclass-csv-bucket` khi có file mới được tải lên.
    - Trích xuất `batchID` từ tên file và cập nhật trạng thái `Uploaded` trong bảng `upload-status`.
    - Gửi tin nhắn đến SQS `linhclass-sqs-queue` để kích hoạt xử lý file.
  - `BatchRunningLambda`:
    - Lambda này được kích hoạt bởi SQS `linhclass-sqs-queue`.
    - Đọc file CSV từ S3 bucket `linhclass-csv-bucket`, lưu dữ liệu vào bảng `user`, và gọi các API bổ sung để tạo avatar, gán vai trò, và tạo email.
    - Cập nhật trạng thái trong bảng `upload-status` theo từng bước xử lý.
      - `InProcessing`: Khi bắt đầu xử lý file.
      - `InsertSuccess`: Khi dữ liệu đã được lưu vào bảng `user`.
      - `BatchRunning`: Khi đang thực hiện các thao tác hàng loạt (tạo avatar, gán vai trò, tạo email).
        - Thao tác hàng loạt bao gồm:
          1. Gọi API để tạo avatar cho người dùng (`PUT /avatar`).
          2. Gọi API để gán vai trò cho người dùng (`PUT /role`).
          3. Gọi API để tạo email cho người dùng (`PUT /email`).
      - Nếu tất cả các API thành công, cập nhật trạng thái thành `Success`.
      - Nếu có lỗi xảy thì update trạng thái thành `Failed`.
  - `LogErrorLambda`:
    - Lambda này được kích hoạt bởi Dead Letter Queue (DLQ) `linhclass-sqs-queue-dlq`.
    - Ghi log lỗi vào bảng `error-log` trong DynamoDB với thông tin chi tiết về lỗi.
      - `batchID`: ID của lô dữ liệu gặp lỗi.
      - `errorMessage`: Thông điệp lỗi chi tiết.
      - `timestamp`: Thời gian xảy ra lỗi.
  - `PutAvatarLambda`:
    - Lambda này được kích hoạt bởi API Gateway với route PUT `/avatar`.
    - Sao chép ảnh mặc định `default-avatar.jpg` từ `linhclass-storage-bucket` sang `linhclass-avatar-bucket` và cập nhật trường `avatarUrl` trong bảng `User`.
    - Đổi tên ảnh thành `<user.id>.jpg` và lưu trữ đường dẫn trong trường `avatarUrl`.
  - `PutRoleLambda`:
    - Lambda này được kích hoạt bởi API Gateway với route PUT `/role`.
    - Cập nhật trường `role` trong bảng `User` với giá trị mặc định là `"employee"`.
  - `PutEmailLambda`:
    - Lambda này được kích hoạt bởi API Gateway với route PUT `/email`.
    - Tạo email cho người dùng theo định dạng `<name><age><role><position>@linhclass.biz` và cập nhật trường `email` trong bảng `User`.
- **S3 Buckets**:
  - `linhclass-csv-bucket`: 
    - Lưu trữ file CSV được tải lên từ client.
    - Kích hoạt Lambda Function `GetBatchIdUploadedLambda` khi có file mới được tải lên.
    - Presigned URL được tạo để client có thể tải file lên bucket này.
    - File được lưu với tên định dạng `<batchID>.csv`.
  - `linhclass-storage-bucket`:
    - Lưu trữ ảnh mặc định cho người dùng (`default-avatar.jpg`).
  - `linhclass-avatar-bucket`:
    - Lưu trữ ảnh avatar đã được tạo cho người dùng.
- **SQS Queue**: Quản lý xử lý bất đồng bộ cho các lô dữ liệu người dùng.
  - `linhclass-sqs-queue`:
    - Nhận tin nhắn từ Lambda Function `GetBatchIdUploadedLambda` khi có file CSV được tải lên.
    - Kích hoạt Lambda Function `BatchRunningLambda` để xử lý dữ liệu người dùng. 
    - Tin nhắn chứa `batchID` để xác định lô dữ liệu cần xử lý.
    - **Dead Letter Queue (DLQ)**: `linhclass-sqs-queue-dlq` để ghi nhận các tin nhắn không xử lý thành công sau 3 lần thử.
  - `linhclass-sqs-queue-dlq`:
    - Nhận các tin nhắn không xử lý thành công từ `linhclass-sqs-queue` sau 3 lần thử.
    - Kích hoạt Lambda Function `LogErrorLambda` để ghi log lỗi vào bảng `error-log`.
- **DynamoDB Tables**:
  - `upload-status`: 
    - Theo dõi trạng thái của quá trình tải `Uploading, Uploaded, InProcessing, InsertSuccess, BatchRunning, Success, Failed`.
    - Lưu trữ thông tin về `batchID`, `status`, `timestamp`, và `filename`.
  - `user`: 
    - Lưu trữ dữ liệu người dùng đã xử lý bao gồm `name`, `age`, `position`, `salary`, `role`, `avatarUrl`, và `email`.
    - Mỗi bản ghi có `id` là UUID duy nhất.
  - `error-log`:
    - Ghi nhận các lỗi xảy ra trong quá trình xử lý, bao gồm `batchID`, `errorMessage`, và `timestamp`.

## 3. Luồng Xử lý

### 3.1 Khởi tạo Tải File

1. **Yêu cầu từ Client**:
   - Client gửi yêu cầu POST đến API Gateway để khởi tạo việc tải file CSV chứa dữ liệu người dùng (`name`, `age`, `position`, `salary`).
   - Ví dụ yêu cầu:
     ```http
     GET /upload-csv
     Content-Type: application/json
     {
       "filename": "demo.csv"
     }
     ```
2. **API Gateway**:
   - API Gateway trigger đến Lambda Function 1 (`UploadCsvCreatePreUrlLambda`) thông qua call API.
3. **Lambda Function 1 (`UploadCsvCreatePreUrlLambda`)**:
   - Tạo một `batchID` duy nhất (UUID).
   - Chèn một bản ghi vào bảng `upload-status` trong DynamoDB:
     ```json
     {
       "batchID": "<uuid>",
       "status": "Uploading"
     }
     ```
   - Tạo một presigned URL để tải file lên `linhclass-csv-bucket` với key `<batchID>.csv`.
   - Trả về presigned URL cho client:
     ```json
     {
       "presignedURL": "<url>"
     }
     ```
4. **Client**:
   - Call presigned URL bằng PUT request để tải csv lên và lưu vào `linhclass-csv-bucket`:
     ```http
     PUT <presignedURL>
     Content-Type: text/csv
     ```

### 3.2 Kích hoạt Xử lý File

1. **S3 Trigger**:
   - Khi file được tải lên `linhclass-csv-bucket`, một sự kiện S3 trigger Lambda Function 2 (`GetBatchIdUploadedLambda`).
2. **Lambda Function 2 (`GetBatchIdUploadedLambda`)**:
   - Trích xuất `batchID` từ tên file (`<batchID>.csv`).
   - Cập nhật trạng thái trong bảng `upload-status` thành `"Uploaded"` cho bản ghi có `batchID` tương ứng.
   - Gửi một tin nhắn chứa `batchID` đến hàng đợi SQS.
   - Message format:
     ```json
     {
       "batchID": "<uuid>"
     }
     ```

### 3.3 Xử lý Dữ liệu Người dùng

1. **SQS Trigger**:
   - Tin nhắn từ SQS trigger Lambda Function 3 (`BatchRunningLambda`).
2. **Lambda Function 3 (`BatchRunningLambda`)**:
   - Cập nhật trạng thái trong bảng `upload-status` thành `"InProcessing"`.
   - Đọc file CSV từ `linhclass-csv-bucket` sử dụng `batchID`.
   - Lưu danh sách người dùng vào bảng `User` trong DynamoDB với cấu trúc tương tự trong csv.
     ```json
     {
       "id": "<uuid>",
       "name": "<string>",
       "age": <number>,
       "position": "<string>",
       "salary": <number>
     }
     ```
   - Nếu thành công, cập nhật trạng thái thành `"InsertSuccess"`.
   - Lặp qua danh sách người dùng:
     - Cập nhật trạng thái thành `"BatchRunning"`.
     - Gọi tuần tự 3 API thông qua API Gateway:
       1. **API-1 (CreateAvatar)**: Sao chép một ảnh từ `linhclass-storage-bucket` sang `linhclass-avatar-bucket` với tên `<user.id>.jpg`.
       2. **API-2 (AssignRole)**: Cập nhật bảng `User`, thêm trường `role` với giá trị `"employee"`.
       3. **API-3 (GenerateEmail)**: Cập nhật bảng `User`, thêm trường `email` với định dạng `<name><age><role><position>@linhclass.biz`.
     - Nếu tất cả API thành công, cập nhật trạng thái thành `"Success"`.
     - Nếu có lỗi trong quá trình polling, gửi tin nhắn vào Dead Letter Queue và trigger lambda Function 4 (`LogErrorLambda`) ghi log lỗi vào bảng `error-log`.

### 3.4 Xử lý Lỗi

1. **Dead Letter Queue Trigger**:
   - Tin nhắn lỗi trong DLQ kích hoạt Lambda Function 4 (`LogErrorLambda`).
2. **Lambda Function 4 (`LogErrorLambda`)**:
   - Ghi nội dung tin nhắn lỗi vào bảng `error-log` trong DynamoDB với cấu trúc:
     ```json
     {
       "errorID": "<uuid>",
       "batchID": "<uuid>",
       "errorMessage": "<string>",
       "timestamp": "<ISO8601>"
     }
     ```

### 3.5 Kiểm tra Trạng thái

1. **Client Polling**:
   - Client gửi yêu cầu GET đến API Gateway mỗi 5 giây để kiểm tra trạng thái:
     ```http
     GET /upload-status
     ```
2. **API Gateway**:
   - Chuyển tiếp yêu cầu đến Lambda Function 5 (`GetStatusLambda`).
3. **Lambda Function 5 (`GetStatusLambda`)**:
   - Truy vấn bảng `upload-status` với `batchID`.
   - Trả về trạng thái hiện tại:
     ```json
     {
       "batchID": "<uuid>",
       "status": "<Uploading|Uploaded|InProcessing|InsertSuccess|BatchRunning|Success|Failed>",
       "timestamp": "<ISO8601>"
     }
     ```
   - Client dừng polling khi trạng thái là `"Success"`

## 4. Mô hình Dữ liệu

### 4.1 Bảng `upload-status` (DynamoDB)

- **Partition Key**: `batchID` (String, UUID)
- **Attributes**:
  - `status` (String): Uploading, Uploaded, InProcessing, InsertSuccess, BatchRunning, Success, Failed
  - `timestamp` (String): ISO8601 timestamp
  - `filename` (String): Tên file gốc

### 4.2 Bảng `User` (DynamoDB)

- **Partition Key**: `id` (String, UUID)
- **Attributes**:
  - `name` (String)
  - `age` (Number)
  - `position` (String)
  - `salary` (Number)
  - `role` (String, optional): Giá trị mặc định là "employee"
  - `email` (String, optional): Định dạng `<name><age><role><position>@linhclass.biz`

### 4.3 Bảng `error-log` (DynamoDB)

- **Partition Key**: `errorID` (String, UUID)
- **Attributes**:
  - `batchID` (String, UUID)
  - `errorMessage` (String)
  - `timestamp` (String): ISO8601 timestamp

## 5. Đặc tả API

### 5.1 GET `/upload-csv`

- **Mô tả**: Khởi tạo quá trình tải file CSV.
- **Request**:
  ```json
  {
    "filename": "<string>"
  }
  ```
- **Response**:
  ```json
  {
    "batchID": "<uuid>",
    "presignedURL": "<string>",
    "status": "Uploading"
  }
  ```

### 5.2 GET `/upload-status`

- **Mô tả**: Kiểm tra trạng thái xử lý file.
- **Query Parameter**: `batchID=<uuid>`
- **Response**:
  ```json
  {
    "batchID": "<uuid>",
    "status": "<string>",
    "timestamp": "<string>"
  }
  ```

### 5.3 POST `/avatar` (API-1)

- **Mô tả**: Tạo avatar cho người dùng.
- **Request**:
  ```json
  {
    "userID": "<uuid>"
  }
  ```
- **Response**:
  ```json
  {
    "userID": "<uuid>",
    "status": "AvatarCreated"
  }
  ```

### 5.4 POST `/role` (API-2)

- **Mô tả**: Gán vai trò mặc định cho người dùng.
- **Request**:
  ```json
  {
    "userID": "<uuid>",
    "role": "employee"
  }
  ```
- **Response**:
  ```json
  {
    "userID": "<uuid>",
    "status": "RoleAssigned"
  }
  ```

### 5.5 POST `/email` (API-3)

- **Mô tả**: Tạo email mặc định cho người dùng.
- **Request**:
  ```json
  {
    "userID": "<uuid>",
    "name": "<string>",
    "age": <number>,
    "role": "<string>",
    "position": "<string>"
  }
  ```
- **Response**:
  ```json
  {
    "userID": "<uuid>",
    "email": "<string>",
    "status": "EmailCreated"
  }
  ```

## 6. Xử lý Lỗi

- **Lỗi API**: Nếu bất kỳ API nào (API-1, API-2, API-3) thất bại, gửi tin nhắn vào DLQ và ghi lỗi vào bảng `error-log`.
- **Timeout Lambda**: Cấu hình timeout tối đa 15 phút cho Lambda xử lý dữ liệu lớn.
- **SQS Retry**: Cấu hình SQS retry tối đa 5 lần trước khi chuyển tin nhắn vào DLQ.

## 7. Cân nhắc Hiệu suất

- **DynamoDB Throughput**: Sử dụng chế độ On-Demand để xử lý lưu lượng không đồng đều.
- **S3 Scalability**: S3 tự động mở rộng, không cần cấu hình bổ sung.
- **Lambda Concurrency**: Giới hạn concurrency của `BatchingLambda` ở mức 10 để tránh quá tải DynamoDB.
- **File Size Limit**: Giới hạn kích thước file CSV tối đa 10MB để đảm bảo Lambda xử lý trong giới hạn thời gian.

## 8. Bảo mật

- **IAM Roles**: Gán vai trò IAM tối thiểu cho từng Lambda (chỉ cấp quyền cần thiết cho S3, DynamoDB, SQS).
- **VPC Endpoints**: Sử dụng VPC Endpoints để truy cập S3 và DynamoDB mà không qua internet.
- **API Gateway Authorization**: Sử dụng AWS Cognito hoặc API Key để xác thực client.
- **Data Encryption**: S3 và DynamoDB sử dụng mã hóa tại rest (AES-256). Dữ liệu truyền tải sử dụng HTTPS.

## 9. Giám sát và Logging

- **CloudWatch Logs**: Ghi log từ tất cả Lambda Functions và API Gateway.
- **CloudWatch Metrics**: Theo dõi số lượng tin nhắn trong SQS/DLQ, số lỗi Lambda, và thời gian xử lý.
- **Alarms**: Thiết lập cảnh báo khi số tin nhắn trong DLQ vượt quá 10 hoặc Lambda thất bại liên tục.

## 10. Kế hoạch Kiểm thử

- **Unit Test**: Kiểm tra từng Lambda Function (xử lý CSV, gọi API, cập nhật DynamoDB).
- **Integration Test**: Kiểm tra toàn bộ luồng từ tải file đến xử lý và cập nhật trạng thái.
- **Load Test**: Mô phỏng 100 file CSV với 1000 bản ghi mỗi file để kiểm tra hiệu suất.
- **Error Test**: Mô phỏng lỗi (file CSV sai định dạng, API timeout) để kiểm tra xử lý lỗi và DLQ.

## 11. Triển khai

- **CICD Pipeline**: Sử dụng AWS CodePipeline và CodeBuild để tự động hóa triển khai Lambda, API Gateway, và các tài nguyên khác.
- **Infrastructure as Code**: Sử dụng AWS CloudFormation hoặc Terraform để định nghĩa VPC, S3, DynamoDB, SQS, và Lambda.
- **Rollback Plan**: Nếu triển khai thất bại, rollback về phiên bản trước và kiểm tra DLQ để xử lý tin nhắn lỗi.

## 12. Kết luận

Tài liệu này cung cấp một hướng dẫn toàn diện để triển khai hệ thống tải lên và xử lý file CSV dựa trên thiết kế cơ bản. Nó bao gồm các khía cạnh từ kiến trúc, luồng xử lý, mô hình dữ liệu, API, đến xử lý lỗi và bảo mật, đảm bảo hệ thống hoạt động hiệu quả, đáng tin cậy và dễ bảo trì.
