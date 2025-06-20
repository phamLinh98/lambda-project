import boto3
from tabulate import tabulate
from colorama import Fore, Style, init

# Khởi tạo colorama
init(autoreset=True)

# Kết nối đến LocalStack SQS
sqs = boto3.client(
    "sqs",
    region_name="ap-northeast-1",  # 👈 Region phải khớp với queue bạn tạo
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
)

# Lấy danh sách queue
response = sqs.list_queues()
queue_urls = response.get("QueueUrls", [])

if not queue_urls:
    print("❌ Không có queue nào trong LocalStack.")
    exit()

# Chuẩn bị bảng
table = []

# Duyệt qua từng queue
for url in queue_urls:
    queue_name = url.split("/")[-1]

    try:
        # Lấy message (tối đa 10)
        msg_response = sqs.receive_message(
            QueueUrl=url,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=1,
            VisibilityTimeout=0,  # 👈 Không ẩn message sau khi đọc
        )
        messages = msg_response.get("Messages", [])
    except Exception as e:
        print(f"⚠️ Lỗi đọc queue {queue_name}: {e}")
        messages = []

    # Thêm vào bảng
    if not messages:
        table.append([queue_name, "-", "-"])
    else:
        for msg in messages:
            table.append([queue_name, msg["MessageId"], msg["Body"]])

# In bảng với màu xanh lá cây
print(Fore.GREEN + tabulate(table, headers=["Queue Name", "Message ID", "Body"], tablefmt="grid"))
