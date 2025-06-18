# Detail Desin Infra cho Role: linhclass-lambda-role

## Mục tiêu

Thiết kế IAM Role `linhclass-lambda-role` để cung cấp quyền truy cập cần thiết cho các Lambda functions trong hệ thống.

## Thành phần hạ tầng

- Sử dụng AWS IAM để tạo Role.
- Cấu hình Role:
  - Name: `linhclass-lambda-role`
  - Description: Role cho các Lambda functions trong hệ thống linhclass.
  - Trust Policy: Cho phép Lambda service assume role này. (Assum có nghĩa là các Lambda functions có thể sử dụng role này để thực hiện các hành động được cấp quyền.)
  - Permissions:
    - Quyền truy cập S3 để đọc và ghi dữ liệu.
    - Quyền ghi vào CloudWatch Logs để ghi log từ Lambda functions.
      - Tags:
      - `Name`: linhclass-lambda-role
      - `Environment`: production
      - `CreatedBy`: linhclass-team
      - `CreatedAt`: Today's date

## File tham khảo:

- Tham khảo các quyền IAM cần thiết trong tài liệu list role tại: detail-design/role/list-role.md.
