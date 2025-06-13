# Thiết kế chi tiết của Entity

# Danh sách các Entity
- `Upload-Status`: Quản lý trạng thái tải lên của các tệp.

# Entity: Upload-Status
## Mô tả
`Upload-Status` là một thực thể dùng để quản lý trạng thái của các tệp được tải lên. Nó lưu trữ thông tin về quá trình tải lên, bao gồm trạng thái hiện tại, thời gian bắt đầu và kết thúc, và các thông tin liên quan khác.

## Thuộc tính
- `id`: Mã định danh duy nhất của trạng thái tải lên.
- `fileName`: Tên của tệp được tải lên.
- `status`: Trạng thái hiện tại của quá trình tải lên (ví dụ: "Đang tải lên", "Hoàn thành", "Lỗi").
- `startTime`: Thời gian bắt đầu quá trình tải lên.
- `endTime`: Thời gian kết thúc quá trình tải lên (nếu có).
- `errorMessage`: Thông điệp lỗi nếu quá trình tải lên gặp sự cố.

## Mối quan hệ
- `Upload-Status` có thể liên kết với các thực thể khác như `User` để theo dõi ai đã thực hiện quá trình tải lên.
- Có thể có mối quan hệ với các thực thể khác như `File` để lưu trữ thông tin chi tiết về tệp được tải lên.

## Event
### List events
1. `UploadStarted`: Sự kiện này được kích hoạt khi quá trình tải lên bắt đầu. Nó có thể bao gồm thông tin về `fileName`, `startTime`, và `userId`.
2. `UploadCompleted`: Sự kiện này được kích hoạt khi quá trình tải lên hoàn thành. Nó có thể bao gồm thông tin về `fileName`, `endTime`, và `status`.
3. `UploadFailed`: Sự kiện này được kích hoạt khi quá trình tải lên gặp lỗi. Nó có thể bao gồm thông tin về `fileName`, `errorMessage`, và `status`.
4. `UploadStatusUpdated`: Sự kiện này được kích hoạt khi trạng thái của quá trình tải lên được cập nhật. Nó có thể bao gồm thông tin về `fileName`, `status`, và thời gian cập nhật.

### Event details
- `UploadStarted`
  - **Mô tả**: Sự kiện này được kích hoạt khi quá trình tải lên bắt đầu.
  - **Thuộc tính**:
    - `fileName`: Tên của tệp được tải lên.
    - `startTime`: Thời gian bắt đầu quá trình tải lên.
    - `userId`: Mã định danh của người dùng thực hiện quá trình tải lên.
    - `status`: Trạng thái ban đầu của quá trình tải lên (thường là "Đang tải lên").
- `UploadCompleted`
  - **Mô tả**: Sự kiện này được kích hoạt khi quá trình tải lên hoàn thành.
  - **Thuộc tính**:
    - `fileName`: Tên của tệp đã được tải lên.
    - `endTime`: Thời gian kết thúc quá trình tải lên.
    - `status`: Trạng thái cuối cùng của quá trình tải lên (thường là "Hoàn thành").