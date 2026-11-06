#!/usr/bin/env python3
"""
Converts the 4 source Xchange .docx specification documents into clean Markdown
files inside docs/ (01-prd.md, 02-brd.md, 03-system-design.md, 04-web-spec.md).
Executed using the local Python virtual environment (.venv/bin/python).
"""

import os
import zipfile
import xml.etree.ElementTree as ET

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(ROOT_DIR, "docs")

DOC_MAPPING = {
    "Xchange — Product Requirements Document (PRD).docx": "01-prd.md",
    "Xchange — Business Requirements Document (BRD).docx": "02-brd.md",
    "Xchange — System Design & Architecture.docx": "03-system-design.md",
    "Xchange — Web Application Build Spec (Next.js).docx": "04-web-spec.md",
    "ui_suggestion.docx": "05-ui-suggestion.md",
}

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def extract_docx_to_markdown(docx_path: str) -> str:
    if not zipfile.is_zipfile(docx_path):
        with open(docx_path, "r", encoding="utf-8") as f:
            return f.read().strip() + "\n"
    lines: list[str] = []
    with zipfile.ZipFile(docx_path) as zf:
        tree = ET.fromstring(zf.read("word/document.xml"))
        body = tree.find("w:body", NS)
        if body is None:
            return ""
        for idx, child in enumerate(body):
            tag = child.tag.split("}")[-1]
            if tag == "p":
                p_style = child.find(".//w:pStyle", NS)
                style_val = (
                    p_style.attrib.get(f"{{{NS['w']}}}val", "")
                    if p_style is not None
                    else ""
                )
                texts = [
                    t.text for t in child.findall(".//w:t", NS) if t.text is not None
                ]
                text = "".join(texts).strip()
                if not text:
                    continue
                if idx == 0 or style_val.lower() in ("title", "heading1", "h1"):
                    lines.append(f"# {text}\n")
                elif style_val.lower() in ("heading2", "h2"):
                    lines.append(f"## {text}\n")
                elif style_val.lower() in ("heading3", "h3"):
                    lines.append(f"### {text}\n")
                else:
                    lines.append(f"{text}\n")
            elif tag == "tbl":
                rows = child.findall(".//w:tr", NS)
                table_rows: list[list[str]] = []
                for row in rows:
                    cells: list[str] = []
                    for cell in row.findall(".//w:tc", NS):
                        cell_text = " ".join(
                            "".join(
                                t.text
                                for t in p.findall(".//w:t", NS)
                                if t.text is not None
                            )
                            for p in cell.findall(".//w:p", NS)
                        ).strip()
                        cells.append(cell_text.replace("|", "\\|"))
                    if cells:
                        table_rows.append(cells)
                if table_rows:
                    header = table_rows[0]
                    lines.append("| " + " | ".join(header) + " |")
                    lines.append("| " + " | ".join(["---"] * len(header)) + " |")
                    for r in table_rows[1:]:
                        padded = r + [""] * max(0, len(header) - len(r))
                        lines.append("| " + " | ".join(padded[: len(header)]) + " |")
                    lines.append("")
    return "\n".join(lines).strip() + "\n"


def main() -> None:
    os.makedirs(DOCS_DIR, exist_ok=True)
    for src_name, dest_name in DOC_MAPPING.items():
        src_path = os.path.join(ROOT_DIR, src_name)
        dest_path = os.path.join(DOCS_DIR, dest_name)
        if not os.path.exists(src_path):
            raise FileNotFoundError(f"Missing source document: {src_path}")
        md_content = extract_docx_to_markdown(src_path)
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(md_content)
        print(f"Converted '{src_name}' -> 'docs/{dest_name}' ({len(md_content)} bytes)")


if __name__ == "__main__":
    main()
