Tổng hợp câu hỏi và câu trả lời về AWS VPC, Subnet, AZ, và Region
Dưới đây là tổng hợp các câu hỏi và câu trả lời liên quan đến AWS VPC, Subnet, Availability Zones (AZ), và Region, bao gồm các hình minh họa dạng văn bản để làm rõ các khái niệm.

Câu hỏi 1: Giả sử tôi có 2 AZ riêng biệt. Mỗi AZ chứa lần lượt 3 subnet 1,2,3 và 4,5,6. Trong cùng 1 AZ, các subnet có giao tiếp được với nhau không? Và chúng thông qua gì?
Trả lời:
Trong cùng một Availability Zone (AZ), các subnet trong cùng một VPC có thể giao tiếp với nhau thông qua local route trong bảng định tuyến (Route Table) của VPC. Dưới đây là chi tiết:

Khả năng giao tiếp:

Các subnet trong cùng một AZ và cùng một VPC (như Subnet 1, 2, 3 trong AZ1) có thể giao tiếp với nhau mặc định, miễn là không bị chặn bởi Network ACLs hoặc Security Groups.
Giao tiếp này xảy ra thông qua mạng nội bộ của VPC, không cần đi qua internet hoặc các thiết bị mạng bên ngoài.


Thông qua gì:

Local Route: Trong Route Table của VPC, có một tuyến mặc định (local route) cho phép tất cả các subnet trong VPC giao tiếp với nhau, bất kể chúng ở cùng AZ hay khác AZ. Tuyến này có dạng <VPC_CIDR> local (ví dụ: 10.0.0.0/16 local).
Network ACLs: Network ACLs kiểm soát lưu lượng vào/ra ở mức subnet. Mặc định, Network ACLs cho phép tất cả lưu lượng, nhưng nếu được cấu hình để chặn, giao tiếp giữa các subnet có thể bị ngăn.
Security Groups: Security Groups kiểm soát lưu lượng vào/ra ở mức instance (như EC2 Instances). Bạn cần cấu hình Security Groups để cho phép lưu lượng giữa các instance trong các subnet.


Ví dụ:

Giả sử VPC có CIDR 10.0.0.0/16 trong region ap-northeast-1:
Subnet 1 (10.0.1.0/24), Subnet 2 (10.0.2.0/24), Subnet 3 (10.0.3.0/24) đều trong AZ ap-northeast-1a.
Một EC2 Instance trong Subnet 1 (10.0.1.10) có thể giao tiếp với một EC2 Instance trong Subnet 2 (10.0.2.10) thông qua local route 10.0.0.0/16 local.
Nếu Security Group của instance trong Subnet 2 cho phép lưu lượng inbound từ 10.0.1.0/24 trên cổng 80, giao tiếp sẽ thành công.




Hình minh họa:


[VPC: 10.0.0.0/16, Region: ap-northeast-1]
    |
    |--- [AZ: ap-northeast-1a]
    |       |--- [Subnet 1: 10.0.1.0/24]
    |       |       |--- EC2 Instance: 10.0.1.10
    |       |--- [Subnet 2: 10.0.2.0/24]
    |       |       |--- EC2 Instance: 10.0.2.10
    |       |--- [Subnet 3: 10.0.3.0/24]
    |       |       |--- EC2 Instance: 10.0.3.10
    |       |
    |       |--- Communication: Via local route (10.0.0.0/16 local)
    |       |--- Controlled by: Network ACLs, Security Groups


Câu hỏi 2: Trường hợp khác AZ, làm sao để Subnet 1 giao tiếp được với Subnet 5?
Trả lời:
Trong trường hợp Subnet 1 (trong AZ1, ví dụ ap-northeast-1a) và Subnet 5 (trong AZ2, ví dụ ap-northeast-1c) thuộc cùng một VPC, chúng có thể giao tiếp với nhau thông qua local route của VPC. Dưới đây là chi tiết về cách đảm bảo giao tiếp giữa Subnet 1 và Subnet 5:

Khả năng giao tiếp:

Mặc định, các subnet trong cùng một VPC (bất kể chúng ở cùng hay khác AZ) có thể giao tiếp với nhau thông qua local route trong Route Table của VPC.
Giao tiếp này xảy ra trong mạng nội bộ của AWS, với độ trễ thấp giữa các AZ trong cùng một region.


Yêu cầu để giao tiếp:

Local Route: Route Table của VPC phải có tuyến 10.0.0.0/16 local (giả sử CIDR của VPC là 10.0.0.0/16), điều này được AWS cấu hình mặc định.
Network ACLs: Đảm bảo Network ACLs của Subnet 1 và Subnet 5 không chặn lưu lượng giữa 10.0.1.0/24 (Subnet 1) và 10.0.5.0/24 (Subnet 5).
Security Groups: Security Groups của các tài nguyên (như EC2 Instances) trong Subnet 1 và Subnet 5 phải cho phép lưu lượng vào/ra trên các cổng cần thiết (ví dụ: cổng 80, 3306).
Tài nguyên hoạt động: Các EC2 Instances trong Subnet 1 và Subnet 5 phải đang chạy và cấu hình đúng (ví dụ: dịch vụ web hoặc cơ sở dữ liệu đang hoạt động).


Các bước cấu hình:

Kiểm tra Route Table của VPC để đảm bảo có tuyến 10.0.0.0/16 local.
Cấu hình Network ACLs:
Subnet 1: Cho phép inbound từ 10.0.5.0/24 và outbound đến 10.0.5.0/24.
Subnet 5: Cho phép inbound từ 10.0.1.0/24 và outbound đến 10.0.1.0/24.


Cấu hình Security Groups:
Security Group của EC2 Instance trong Subnet 5: Cho phép inbound từ 10.0.1.0/24 trên cổng cần thiết (ví dụ: 3306 cho MySQL).
Security Group của EC2 Instance trong Subnet 1: Cho phép outbound đến 10.0.5.0/24 trên cổng tương ứng.


Kiểm tra trạng thái của EC2 Instances trong cả hai subnet để đảm bảo chúng hoạt động.


Hình minh họa:


[VPC: 10.0.0.0/16, Region: ap-northeast-1]
    |
    |--- [AZ: ap-northeast-1a]
    |       |--- [Subnet 1: 10.0.1.0/24]
    |       |       |--- EC2 Instance: 10.0.1.10 (Web Server)
    |       |--- [Subnet 2: 10.0.2.0/24]
    |       |--- [Subnet 3: 10.0.3.0/24]
    |
    |--- [AZ: ap-northeast-1c]
    |       |--- [Subnet 4: 10.0.4.0/24]
    |       |--- [Subnet 5: 10.0.5.0/24]
    |       |       |--- EC2 Instance: 10.0.5.10 (DB Server)
    |       |--- [Subnet 6: 10.0.6.0/24]
    |
    |--- [Route Table]
    |       |--- Local Route: 10.0.0.0/16 (enables Subnet 1 <-> Subnet 5)
    |       |--- Controlled by: Network ACLs, Security Groups


Câu hỏi 3: Giả sử trên cùng 1 AZ1, trường hợp nào thì Subnet 1 và Subnet 2 không thể giao tiếp với nhau?
Trả lời:
Mặc định, các subnet trong cùng một AZ và cùng một VPC có thể giao tiếp với nhau thông qua local route. Tuy nhiên, có một số trường hợp khiến Subnet 1 và Subnet 2 không thể giao tiếp:

Network ACLs chặn lưu lượng:

Network ACLs của Subnet 1 hoặc Subnet 2 chặn lưu lượng vào/ra giữa 10.0.1.0/24 và 10.0.2.0/24.
Ví dụ: NACL của Subnet 1 chặn inbound từ 10.0.2.0/24 trên cổng 80.


Security Groups chặn lưu lượng:

Security Groups của EC2 Instances trong Subnet 1 hoặc Subnet 2 không cho phép lưu lượng từ dải IP của subnet kia.
Ví dụ: Security Group của instance trong Subnet 2 không cho phép inbound từ 10.0.1.0/24 trên cổng 3306.


Route Table cấu hình sai:

Nếu Route Table của Subnet 1 hoặc Subnet 2 thiếu tuyến 10.0.0.0/16 local (hiếm xảy ra vì AWS tự động thêm tuyến này).
Ví dụ: Route Table của Subnet 1 không có tuyến đến 10.0.2.0/24.


Tài nguyên không hoạt động:

EC2 Instances trong Subnet 1 hoặc Subnet 2 bị tắt hoặc dịch vụ (như web server) không chạy.
Ví dụ: Máy chủ web trong Subnet 2 không chạy trên cổng 80.


VPC Endpoint hoặc dịch vụ không tương thích:

Nếu giao tiếp thông qua dịch vụ AWS (như S3 qua VPC Endpoint), và VPC Endpoint không được cấu hình để áp dụng cho cả hai subnet.


Chính sách IAM hạn chế:

Nếu sử dụng dịch vụ như AWS Systems Manager, thiếu quyền IAM có thể ngăn giao tiếp gián tiếp.



Hình minh họa:
[VPC: 10.0.0.0/16, Region: ap-northeast-1]
    |
    |--- [AZ: ap-northeast-1a]
    |       |--- [Subnet 1: 10.0.1.0/24]
    |       |       |--- EC2 Instance: 10.0.1.10
    |       |       |--- Security Group: Denies inbound from 10.0.2.0/24
    |       |       |--- NACL: Denies outbound to 10.0.2.0/24
    |       |--- [Subnet 2: 10.0.2.0/24]
    |       |       |--- EC2 Instance: 10.0.2.10
    |       |       |--- Security Group: Denies inbound from 10.0.1.0/24
    |       |
    |       |--- [Result]: No communication due to NACLs or Security Groups


Câu hỏi 4: EC2 Instance đóng vai trò gì trong Subnet?
Trả lời:
EC2 Instance là một máy ảo (virtual machine) được triển khai trong một subnet, đóng vai trò như một tài nguyên tính toán (compute resource) để chạy ứng dụng hoặc dịch vụ. Vai trò cụ thể của EC2 Instance trong subnet bao gồm:

Thực hiện các tác vụ tính toán:

Chạy các ứng dụng như máy chủ web (Nginx), máy chủ cơ sở dữ liệu (MySQL), hoặc xử lý dữ liệu.
Ví dụ: Một EC2 Instance trong Subnet 1 (10.0.1.0/24) chạy máy chủ web.


Kế thừa đặc điểm của Subnet:

Public vs Private: Nếu subnet là public, EC2 Instance có thể được gán public IP để truy cập internet. Nếu là private, instance chỉ giao tiếp nội bộ.
AZ: EC2 Instance chạy trong trung tâm dữ liệu của AZ mà subnet thuộc về.


Giao tiếp mạng:

Sử dụng địa chỉ IP từ subnet (như 10.0.1.10) để giao tiếp nội bộ (qua local route) hoặc với internet (nếu trong public subnet).
Controlled by Security Groups and Network ACLs.


Tính sẵn sàng cao:

Phân phối EC2 Instances trên các subnet trong các AZ khác nhau để đảm bảo ứng dụng hoạt động liên tục nếu một AZ gặp sự cố.


Lưu trữ và quản lý tài nguyên:

EC2 Instance sử dụng các dịch vụ như EBS hoặc S3 thông qua mạng của subnet.



Hình minh họa:
[VPC: 10.0.0.0/16, Region: ap-northeast-1]
    |
    |--- [AZ: ap-northeast-1a]
    |       |--- [Subnet 1: 10.0.1.0/24, Public]
    |       |       |--- EC2 Instance: 10.0.1.10 (Web Server, Public IP: 203.0.113.10)
    |       |       |--- Role: Serves HTTP/HTTPS traffic
    |       |--- [Subnet 2: 10.0.2.0/24, Private]
    |       |       |--- EC2 Instance: 10.0.2.10 (DB Server)
    |       |       |--- Role: Stores data, communicates internally


Câu hỏi 5: Trên 1 EC2 Instance được quản lý bởi 1 Subnet?
Trả lời:
Đúng. Mỗi EC2 Instance được gắn với một subnet duy nhất trong một VPC, và subnet quản lý các khía cạnh mạng của instance:

Quản lý bởi Subnet:

Địa chỉ IP: EC2 Instance nhận private IP từ dải CIDR của subnet (như 10.0.1.10 trong 10.0.1.0/24).
Kết nối mạng: Subnet xác định instance là public (có Internet Gateway) hay private (chỉ giao tiếp nội bộ).
AZ: Subnet gắn với một AZ, do đó EC2 Instance chạy trong trung tâm dữ liệu của AZ đó.
Bảo mật: Subnet áp dụng Network ACLs, và instance sử dụng Security Groups.


Lưu ý:

Một EC2 Instance không thể thuộc nhiều subnet cùng lúc.
Để di chuyển instance sang subnet khác, bạn phải dừng instance, thay đổi subnet, và khởi động lại.



Hình minh họa:
[VPC: 10.0.0.0/16]
    |
    |--- [AZ: ap-northeast-1a]
    |       |--- [Subnet 1: 10.0.1.0/24]
    |       |       |--- EC2 Instance: 10.0.1.10
    |       |       |--- Managed by: Subnet 1 (IP, connectivity, AZ)


Câu hỏi 6: Trên 1 Subnet có thể triển khai bao nhiêu EC2 Instance?
Trả lời:
Số lượng EC2 Instances trong một subnet phụ thuộc vào số địa chỉ IP khả dụng và giới hạn tài khoản AWS:

Số địa chỉ IP khả dụng:

Một subnet có dải CIDR (ví dụ: 10.0.1.0/24 có 256 địa chỉ, nhưng AWS giữ lại 5 địa chỉ, còn 251 địa chỉ khả dụng).
Mỗi EC2 Instance sử dụng ít nhất 1 private IP, do đó tối đa 251 instance trong /24.


Giới hạn tài khoản AWS:

Giới hạn vCPU (mặc định khoảng 1152 vCPU mỗi region).
Ví dụ: Với instance t3.micro (2 vCPU), bạn có thể chạy tối đa 576 instance trong region, bất kể số IP trong subnet.


Các yếu tố khác:

Các tài nguyên khác (như Elastic Load Balancer) cũng sử dụng IP, giảm số IP khả dụng.
Hiệu suất mạng có thể bị ảnh hưởng nếu triển khai quá nhiều instance trong một subnet.



Hình minh họa:
[VPC: 10.0.0.0/16]
    |
    |--- [AZ: ap-northeast-1a]
    |       |--- [Subnet 1: 10.0.1.0/24, 251 IPs available]
    |               |--- EC2 Instance 1: 10.0.1.10
    |               |--- EC2 Instance 2: 10.0.1.11
    |               |--- ... (Up to 251 instances, limited by vCPUs)


Câu hỏi 7: Trên 1 tài khoản AWS có thể triển khai bao nhiêu VPC? Và VPC có liên quan gì tới Region không?
Trả lời:

Số lượng VPC:

Mặc định: 5 VPC mỗi region.
Có thể yêu cầu tăng giới hạn qua AWS Support.
Giới hạn áp dụng riêng cho mỗi region, không phải tổng số VPC trên tài khoản.


Mối quan hệ với Region:

VPC là tài nguyên cấp region, chỉ tồn tại trong một region cụ thể (như ap-northeast-1).
Subnet trong VPC được gắn với AZ trong region đó.
Để kết nối VPC giữa các region, cần sử dụng Transit Gateway, VPC Peering, hoặc VPN.



Hình minh họa:
[AWS Account]
    |
    |--- [Region: ap-northeast-1]
    |       |--- [VPC 1: 10.0.0.0/16]
    |       |--- [VPC 2: 10.1.0.0/16]
    |       |--- ... (Up to 5 VPCs by default)
    |
    |--- [Region: ap-south-1]
            |--- [VPC 3: 172.16.0.0/16]


Câu hỏi 8: Nếu tôi chọn region là Tokyo thì tôi sẽ có những AZ nào?
Trả lời:
Trong region Asia Pacific (Tokyo) (ap-northeast-1), có 4 Availability Zones:

ap-northeast-1a
ap-northeast-1b (có thể không khả dụng cho tài khoản mới)
ap-northeast-1c
ap-northeast-1d

Lưu ý:

Một số tài khoản mới chỉ thấy 3 AZ (thiếu ap-northeast-1b) do giới hạn tài khoản.
Ngoài ra, có Local Zone: ap-northeast-1-tok-1a cho ứng dụng yêu cầu độ trễ thấp.
Kiểm tra AZ bằng lệnh:aws ec2 describe-availability-zones --region ap-northeast-1



Hình minh họa:
[Region: ap-northeast-1 (Tokyo)]
    |
    |--- [AZ: ap-northeast-1a]
    |--- [AZ: ap-northeast-1b] (if available)
    |--- [AZ: ap-northeast-1c]
    |--- [AZ: ap-northeast-1d]
    |--- [Local Zone: ap-northeast-1-tok-1a]


Câu hỏi 9: Tôi để ý là có cả ap-southnet-1, vậy region của nó là gì?
Trả lời:

Không có region nào tên ap-southnet-1. Có thể bạn nhầm với ap-south-1 (Asia Pacific - Mumbai).
Region ap-south-1:
Tên: Asia Pacific (Mumbai), Ấn Độ.
AZ: ap-south-1a, ap-south-1b, ap-south-1c.


Kiểm tra region và AZ:aws ec2 describe-regions
aws ec2 describe-availability-zones --region ap-south-1



Hình minh họa:
[Region: ap-south-1 (Mumbai)]
    |
    |--- [AZ: ap-south-1a]
    |--- [AZ: ap-south-1b]
    |--- [AZ: ap-south-1c]


Câu hỏi 10: Khi tạo thành công 1 tài khoản AWS, trên đó sẽ có 1 VPC mặc định. Trên VPC đó đang có sẵn bao nhiêu AZ và Subnet?
Trả lời:

Khi tạo tài khoản AWS mới, mỗi region có một Default VPC với:
CIDR: 172.31.0.0/16.
Subnet: Một subnet cho mỗi AZ khả dụng trong region (thường 3-4 subnet, tùy region).
Ví dụ trong ap-northeast-1: 3 hoặc 4 subnet (như 172.31.0.0/20 trong ap-northeast-1a, 172.31.16.0/20 trong ap-northeast-1c, v.v.).
Trong ap-south-1: 3 subnet (ap-south-1a, ap-south-1b, ap-south-1c).


AZ: Số lượng AZ bằng số lượng subnet, phụ thuộc vào region và tài khoản.


Kiểm tra:aws ec2 describe-subnets --region ap-northeast-1 --filters Name=vpc-id,Values=<default-vpc-id>



Hình minh họa:
[Region: ap-northeast-1]
    |
    |--- [Default VPC: 172.31.0.0/16]
            |--- [Subnet 1: 172.31.0.0/20, AZ: ap-northeast-1a]
            |--- [Subnet 2: 172.31.16.0/20, AZ: ap-northeast-1c]
            |--- [Subnet 3: 172.31.32.0/20, AZ: ap-northeast-1d]
            |--- [Subnet 4: 172.31.48.0/20, AZ: ap-northeast-1b] (if available)


Câu hỏi 11: AZ cung cấp cho Subnet những gì?
Trả lời:
Availability Zone (AZ) cung cấp các đặc điểm sau cho subnet:

Vị trí vật lý: Trung tâm dữ liệu nơi tài nguyên trong subnet được triển khai.
Tính sẵn sàng cao: Phân phối tài nguyên trên các AZ để chịu lỗi.
Cô lập tài nguyên: Tách biệt vật lý giữa các AZ.
Hỗ trợ phân phối tải: Cho phép ELB phân phối lưu lượng giữa các subnet/AZ.
Hỗ trợ Multi-AZ: Hỗ trợ RDS Multi-AZ, Auto Scaling.
Tính nhất quán: Tổ chức subnet theo vị trí vật lý.

Hình minh họa:
[VPC: 10.0.0.0/16]
    |
    |--- [AZ: ap-northeast-1a]
    |       |--- [Subnet 1: 10.0.1.0/24]
    |       |       |--- EC2 Instance: 10.0.1.10
    |       |       |--- Provided by AZ: Physical location, fault tolerance
    |
    |--- [AZ: ap-northeast-1c]
            |--- [Subnet 2: 10.0.2.0/24]
                    |--- EC2 Instance: 10.0.2.10
                    |--- Provided by AZ: Isolation from ap-northeast-1a


Câu hỏi 12: Region cung cấp cho VPC những gì?
Trả lời:
Region cung cấp cho VPC:

Phạm vi địa lý: Vị trí trung tâm dữ liệu (như Tokyo).
Availability Zones: Các AZ để triển khai subnet (như ap-northeast-1a, ap-northeast-1c).
Dịch vụ AWS: Các dịch vụ khả dụng (EC2, S3, RDS).
Cơ sở hạ tầng mạng: Kết nối nội bộ, Internet Gateway, Transit Gateway.
Chính sách định giá và tuân thủ: Chi phí và yêu cầu pháp lý.

Hình minh họa:
[Region: ap-northeast-1]
    |
    |--- Provides: AZs, services, network, pricing
    |
    |--- [VPC: 10.0.0.0/16]
            |--- [Subnet 1: 10.0.1.0/24, AZ: ap-northeast-1a]
            |--- [Subnet 2: 10.0.2.0/24, AZ: ap-northeast-1c]


Câu hỏi 13: VPC cung cấp cho AZ những gì?
Trả lời:
VPC không trực tiếp cung cấp gì cho AZ, mà thông qua subnet, VPC cung cấp:

Môi trường mạng logic: Dải CIDR (như 10.0.0.0/16).
Định tuyến mạng: Route Tables (như 10.0.0.0/16 local).
Bảo mật mạng: Security Groups, Network ACLs.
Phân phối tài nguyên: Triển khai tài nguyên trên các AZ.
Kết nối: Internet Gateway, NAT Gateway, VPC Endpoints.

Hình minh họa:
[Region: ap-northeast-1]
    |
    |--- [VPC: 10.0.0.0/16]
    |       |--- Provides: CIDR, routing, security
    |       |
    |       |--- [Subnet 1: 10.0.1.0/24, AZ: ap-northeast-1a]
    |       |--- [Subnet 2: 10.0.2.0/24, AZ: ap-northeast-1c]


Câu hỏi 14: Mỗi Subnet gắn với 1 AZ duy nhất và 1 Region duy nhất phải không?
Trả lời:

Đúng:
Mỗi subnet gắn với 1 AZ duy nhất (như ap-northeast-1a) và không thể trải dài trên nhiều AZ.
Mỗi subnet gắn với 1 Region duy nhất, kế thừa từ VPC (như ap-northeast-1).



Hình minh họa:
[VPC: 10.0.0.0/16, Region: ap-northeast-1]
    |
    |--- [Subnet 1: 10.0.1.0/24, AZ: ap-northeast-1a]
    |--- [Subnet 2: 10.0.2.0/24, AZ: ap-northeast-1c]


Câu hỏi 15: Region cung cấp cho AZ những gì?
Trả lời:
Region cung cấp cho AZ:

Phạm vi địa lý: Vị trí trung tâm dữ liệu (như Tokyo).
Dịch vụ AWS: Các dịch vụ khả dụng (EC2, RDS).
Kết nối mạng: Giao tiếp giữa các AZ trong Region.
Tính sẵn sàng cao: Nhiều AZ để chịu lỗi.
Hỗ trợ Multi-AZ: Hỗ trợ RDS Multi-AZ, ELB.
Chính sách định giá và tuân thủ: Chi phí và yêu cầu pháp lý.

Hình minh họa:
[Region: ap-northeast-1]
    |
    |--- Provides: Geographic scope, services, connectivity
    |
    |--- [AZ: ap-northeast-1a]
    |       |--- Hosts Subnet 1: 10.0.1.0/24
    |--- [AZ: ap-northeast-1c]
            |--- Hosts Subnet 2: 10.0.2.0/24

