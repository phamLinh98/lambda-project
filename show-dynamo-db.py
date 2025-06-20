import json
import subprocess
from prettytable import PrettyTable

# Mã ANSI escape sequence cho màu xanh lá cây
GREEN = "\033[92m"  # Màu xanh lá cây sáng
RESET = "\033[0m"    # Đặt lại màu về mặc định

# Lấy danh sách bảng
tables = json.loads(subprocess.getoutput(
    "aws dynamodb list-tables --endpoint-url http://localhost:4566 --output json"
))["TableNames"]

for table in tables:
    print(f"\n{GREEN}Table: {table}{RESET}")

    # Lấy schema
    schema = json.loads(subprocess.getoutput(
        f"aws dynamodb describe-table --table-name {table} --endpoint-url http://localhost:4566 --output json"
    ))["Table"]["AttributeDefinitions"]

    schema_table = PrettyTable(["AttributeName", "AttributeType"])
    for attr in schema:
        schema_table.add_row([f"{GREEN}{attr['AttributeName']}{RESET}", f"{GREEN}{attr['AttributeType']}{RESET}"])
    print(f"{GREEN}Fields (Attributes):{RESET}")
    print(schema_table)

    # Lấy records
    items = json.loads(subprocess.getoutput(
        f"aws dynamodb scan --table-name {table} --endpoint-url http://localhost:4566 --output json"
    ))["Items"]

    if items:
        # Tìm tất cả các trường có trong bản ghi
        all_fields = set()
        for item in items:
            all_fields.update(item.keys())
        all_fields = sorted(list(all_fields))  # Sắp xếp để thứ tự nhất quán

        # Tạo bảng records với đường kẻ ngang
        record_table = PrettyTable(all_fields)
        try:
            from prettytable import ALL
            record_table.hrules = ALL  # Thêm đường kẻ ngang giữa các dòng
        except (ImportError, AttributeError):
            print(f"{GREEN}Warning: hrules not supported in this version of PrettyTable. Using default formatting.{RESET}")

        # Thêm dữ liệu vào bảng
        for item in items:
            row = []
            for field in all_fields:
                if field in item:
                    if "S" in item[field]:
                        row.append(f"{GREEN}{item[field]['S']}{RESET}")
                    elif "N" in item[field]:
                        row.append(f"{GREEN}{item[field]['N']}{RESET}")
                    elif "BOOL" in item[field]:
                        row.append(f"{GREEN}{str(item[field]['BOOL'])}{RESET}")  # Chuyển boolean sang string
                    elif "NULL" in item[field]:
                        row.append(f"{GREEN}NULL{RESET}")  # Hiển thị giá trị null
                    else:
                        row.append(f"{GREEN}Unsupported Type{RESET}")  # Xử lý kiểu dữ liệu không được hỗ trợ
                else:
                    row.append(f"{GREEN}{''}{RESET}")
            record_table.add_row(row)
        print(f"{GREEN}Records:{RESET}")
        print(record_table)