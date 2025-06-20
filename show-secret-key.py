import boto3
import json
from prettytable import PrettyTable, HRuleStyle
from colorama import init, Fore

# Khởi tạo colorama
init()

# Cấu hình boto3 để kết nối với LocalStack
secrets_client = boto3.client(
    'secretsmanager',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='ap-northeast-1'
)

# Tạo bảng
table = PrettyTable(["Secret Name", "Secret Key", "Secret Value"])
table.hrules = HRuleStyle.ALL  # Thêm đường kẻ ngang giữa các dòng

# Lấy bí mật HitoEnvSecret
secret_id = "HitoEnvSecret"
try:
    response = secrets_client.get_secret_value(SecretId=secret_id)
    secret_name = response.get('Name', secret_id)
    secret_string = response.get('SecretString', '{}')
    
    # Parse secret string (giả sử là JSON)
    try:
        secret_data = json.loads(secret_string)
        if isinstance(secret_data, dict):
            for key, value in secret_data.items():
                table.add_row([secret_name, key, value])
        else:
            table.add_row([secret_name, "value", secret_string])
    except json.JSONDecodeError:
        table.add_row([secret_name, "value", secret_string])
except secrets_client.exceptions.ResourceNotFoundException:
    print(f"Error: Secret {secret_id} not found.")
except Exception as e:
    print(f"Error: Failed to retrieve secret {secret_id}: {e}")

# In bảng với màu xanh lá
print(f"{Fore.GREEN}{table}{Fore.RESET}")