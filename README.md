# QCoda — Prototype quản lý nguồn tri thức

Ứng dụng HTML5, CSS3 và JavaScript thuần, dựa trên wireframe PDF và yêu cầu bổ sung. Không cần cài thư viện hoặc chạy bước build.

## Chạy ứng dụng

1. Mở thư mục này trong Visual Studio Code.
2. Nhấn chuột phải vào `index.html`, chọn **Open with Live Server**.
3. Giữ nguyên địa chỉ và cổng khi trình diễn để dùng lại dữ liệu đã lưu.

Hoặc chạy `python -m http.server 5500 --bind 127.0.0.1`, rồi mở http://127.0.0.1:5500. Không mở bằng `file://` vì khả năng lưu tệp của trình duyệt có thể bị giới hạn.

## Tài khoản thử nghiệm

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Điều phối viên — Nguyễn Thị Lan | dieuphoi@qcoda.vn | 123456 |
| Thành viên — Trần Văn Minh | thanhvien@qcoda.vn | 123456 |
| QA — Lê Thị Hòa | qa@qcoda.vn | 123456 |

Có thể bấm tài khoản mẫu để điền biểu mẫu, sau đó bấm Đăng nhập. Cả ba tài khoản đều tham gia hai dự án. Tên vai trò luôn hiển thị bằng tiếng Anh: **Project Coordinator**, **Developer**, **QA**. Developer và QA chỉ được xem; Project Coordinator được cập nhật tài liệu.

## Chuyển ngôn ngữ và xem lịch sử

- Chọn **Tiếng Việt / English** ở biểu mẫu đăng nhập hoặc thanh trên. Lựa chọn được lưu khi tải lại trang và đăng nhập lại.
- Nhãn giao diện, nút, thông báo, bộ lọc, danh mục và hộp thoại chuyển theo ngôn ngữ. Tên người dùng, tên dự án và tên tệp được giữ nguyên theo dữ liệu gốc.
- Bộ lọc tìm kiếm, trang lịch sử, nội dung đăng nhập và PDF đang chọn được giữ lại khi đổi ngôn ngữ. Bộ chọn ngôn ngữ bị khóa trong khi đang cập nhật tài liệu.
- Cả bảng **Hoạt động gần đây** và **Lịch sử cập nhật** có cột **Thao tác / Actions**, với nút **Xem / View** mở chi tiết bản cập nhật. Tên tài liệu trong hai bảng là văn bản.
- Kiểm tra nút Xem ở cả hai bảng, đổi sang English rồi kiểm tra View và hộp thoại Update details; tải lại trang để kiểm tra lựa chọn ngôn ngữ được giữ lại.

## Kiểm thử kịch bản

Trong **Dự án**, bấm tên dự án hoặc **Xem yêu cầu** để mở danh sách yêu cầu mẫu riêng của dự án. Mỗi yêu cầu có nút **Run QCoda**; bấm nút chỉ mở thông báo chờ, không gọi dịch vụ phân tích, không tạo kết quả hoặc bản ghi cập nhật. Danh sách và thông báo hỗ trợ Việt/Anh; mọi vai trò tham gia dự án đều có thể dùng nút trình diễn này.

- **A — Thành công:** Đăng nhập điều phối viên → Thêm tài liệu → chọn thư mục và PDF hợp lệ dưới 20 MB → Xác nhận cập nhật → Xác nhận. Quan sát tiến trình khoảng 2–3 giây. Mở Nguồn tri thức và tìm tên tệp; mở Xem lịch sử, bản ghi mới nằm đầu. Kiểm tra số liệu Tổng quan và mở lại tệp sau khi tải lại trang.
- **B — Chỉ xem:** Đăng xuất → đăng nhập thành viên. Không có mục Cập nhật tài liệu. Kiểm tra tài liệu mới và lịch sử ở cùng dự án; mở trực tiếp `#upload` để thấy thông báo từ chối. Đăng xuất rồi mở URL nội bộ để kiểm tra màn hình đăng nhập.
- **C — Tệp không hợp lệ:** Thử kéo thả TXT/PNG/Word vào vùng tải hoặc chọn chúng bằng bộ lọc tất cả tệp của hộp chọn. Tệp bị từ chối; nút xác nhận bị khóa. Tệp đổi đuôi thành PDF nhưng không có chữ ký PDF cũng bị từ chối. Chưa chọn tệp thì không thể xác nhận.
- **D — Lỗi xử lý:** Chọn PDF hợp lệ, bật Mô phỏng lỗi xử lý, xác nhận. Sau tiến trình, ứng dụng báo thất bại. Số tài liệu và số bản ghi lịch sử không tăng.
- **E — Tách dự án:** Thêm PDF vào Hệ thống nội bộ AI. Chọn Nền tảng quản lý khách hàng ở thanh trên; tệp và lịch sử vừa thêm không xuất hiện. Quay lại dự án đầu để kiểm tra dữ liệu còn nguyên. Việc chuyển dự án xóa tệp đang chọn; trong khi xử lý, bộ chọn dự án bị khóa.

Thử thêm tìm kiếm theo tên tài liệu, tên thư mục, người cập nhật; lọc danh mục và thời gian; mở thư mục trống; phân trang khi có trên 6 bản ghi. Đặt lại dữ liệu mẫu trong Cài đặt có hộp xác nhận.

## Tổ chức và lưu dữ liệu

- `index.html`: khung trang, hộp thoại và vùng thông báo.
- `style.css`: hệ thống màu, bố cục và giao diện thích ứng màn hình.
- `script.js`: dữ liệu mẫu, đăng nhập, kiểm tra vai trò theo dự án, điều hướng, tải PDF, tìm kiếm, lịch sử và lưu trữ.
- `i18n.js`: từ điển Việt/Anh, lựa chọn ngôn ngữ và bộ chọn ngôn ngữ dùng chung.
- Phiên đăng nhập và dự án đang chọn: sessionStorage. Thông tin tài liệu và lịch sử: localStorage. Nội dung tệp PDF: IndexedDB.
- Các tài liệu mẫu chỉ có thông tin minh họa, không có tệp PDF đính kèm. Tệp tự tải lên có thể xem và tải lại. Xóa dữ liệu trang hoặc đổi trình duyệt sẽ không còn truy cập được các tệp đã lưu.
- Quyền truy cập chỉ được mô phỏng trong trình duyệt, có kiểm tra khi điều hướng và cập nhật. Đây không phải cơ chế bảo mật cho hệ thống thực tế; người có quyền sửa mã hoặc dữ liệu trình duyệt có thể thay đổi prototype.
- Không trích xuất hoặc phân tích PDF, không gửi tệp ra dịch vụ bên ngoài.

## Mức độ xác minh

Đã kiểm tra cú pháp JavaScript, HTTP 200 và logic các kịch bản A–E trong môi trường mô phỏng DOM/lưu tệp. Chưa kiểm thử đầu cuối trong trình duyệt thật do công cụ trình duyệt không khả dụng. Cần kiểm tra trực quan ở 1366 × 768 và 1920 × 1080, kéo thả tệp, lưu/mở PDF bằng IndexedDB và tải lại trang trên Live Server.
