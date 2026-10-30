"""Tạo các trang con từ khung của index.html.

Header, menu, cột phải và footer được lấy nguyên từ index.html, nên chỉ cần sửa
một chỗ (index.html) rồi chạy lại:  python build.py
Nội dung riêng của từng trang nằm trong thư mục pages/.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
index = (ROOT / "index.html").read_text(encoding="utf-8")

top = index[: index.index("<main")]
aside = re.search(r"<aside class=\"col-side\">.*?</aside>", index, re.S).group(0)
bottom = index[index.index("</main>") + len("</main>"):]

PAGES = [
    # (file, tiêu đề tab, href mục menu đang chọn, file nội dung)
    ("gioi-thieu.html", "Giới thiệu", "gioi-thieu.html", "gioi-thieu.html"),
    ("tin-tuc.html", "Tin tức - Sự kiện", "tin-tuc.html", "tin-tuc.html"),
    ("tin-chi-tiet.html", "Hội nghị Người lao động năm 2026", "tin-tuc.html", "tin-chi-tiet.html"),
    ("lien-he.html", "Liên hệ", "lien-he.html", "lien-he.html"),
    ("san-pham.html", "Sản phẩm", "san-pham.html", "san-pham.html"),
    ("dich-vu.html", "Dịch vụ", "dich-vu.html", "dich-vu.html"),
    ("xuat-khau-lao-dong.html", "Xuất khẩu lao động", "xuat-khau-lao-dong.html", "xuat-khau-lao-dong.html"),
    ("van-ban.html", "Văn bản pháp luật", "van-ban.html", "van-ban.html"),
]

# Trang không có cột phải (hiện chưa dùng)
FULL_WIDTH = set()

SITE = "Công ty CP Phát triển Công nghiệp - Xây lắp và Thương mại Hà Tĩnh"

for out, title, active, src in PAGES:
    page_top = re.sub(r"<title>.*?</title>", f"<title>{title} | {SITE}</title>", top)
    page_top = page_top.replace('<li class="active">', "<li>")
    page_top = re.sub(
        rf'<li( class="has-sub")?><a href="{re.escape(active)}"',
        lambda m: f'<li class="{"has-sub " if m.group(1) else ""}active"><a href="{active}"',
        page_top,
        count=1,
    )
    body = (ROOT / "pages" / src).read_text(encoding="utf-8")
    if out in FULL_WIDTH:
        # Trang dàn trải hết chiều ngang, không có cột phải
        main = '<main class="page-full">\n' + body + "\n  </main>"
    else:
        main = (
            '<main class="container layout">\n\n    <div class="col-main page">\n'
            + body
            + "\n    </div>\n\n    "
            + aside
            + "\n  </main>"
        )
    html = page_top + main + bottom
    (ROOT / out).write_text(html, encoding="utf-8")
    print("built", out)
