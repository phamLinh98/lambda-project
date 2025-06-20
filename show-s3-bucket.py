import boto3
from prettytable import PrettyTable, HRuleStyle
from colorama import init, Fore

# Khởi tạo colorama
init()

# Cấu hình boto3 để kết nối với LocalStack
s3_client = boto3.client(
    's3',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='us-east-1'
)

# Tạo bảng chính
table = PrettyTable(["Bucket Name", "File Name", "Last Modified", "Size"])
table.hrules = HRuleStyle.ALL  # Sử dụng HRuleStyle.ALL thay vì ALL

# Lấy danh sách bucket
try:
    response = s3_client.list_buckets()
    buckets = response.get('Buckets', [])
except Exception as e:
    print(f"Error: Failed to list buckets: {e}")
    buckets = []

# Lấy danh sách file trong mỗi bucket
for bucket in buckets:
    bucket_name = bucket["Name"]
    try:
        response = s3_client.list_objects_v2(Bucket=bucket_name)
        objects = response.get('Contents', [])
        if objects:
            for obj in objects:
                table.add_row([
                    bucket_name,
                    obj["Key"],
                    obj["LastModified"].strftime('%Y-%m-%dT%H:%M:%S%z'),
                    obj["Size"]
                ])
        else:
            # Nếu bucket rỗng, thêm dòng với thông tin bucket nhưng không có file
            table.add_row([bucket_name, "", "", ""])
    except Exception as e:
        print(f"Error: Failed to list objects for bucket {bucket_name}: {e}")
        table.add_row([bucket_name, "", "", ""])

# In bảng với màu xanh lá
print(f"{Fore.GREEN}{table}{Fore.RESET}")