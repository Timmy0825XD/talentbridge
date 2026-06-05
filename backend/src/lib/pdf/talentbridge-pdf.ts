import PDFDocument from 'pdfkit';

/** Paleta alineada con el frontend TalentBridge */
export const TB = {
  primary: '#00386c',
  accent: '#006d37',
  dark: '#191c1e',
  muted: '#424750',
  subtle: '#737781',
  border: '#e6e8ea',
  bg: '#f7f9fb',
  warning: '#7c5c00',
  danger: '#93000a',
} as const;

const PAGE = { width: 595.28, height: 841.89 };
const DEFAULT_MARGIN = 48;
const FOOTER_RESERVE = 28;
const STRIP_HEIGHT = 12;

export type PdfMetaLine = { label: string; value: string };

export type PdfTableColumn = {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
};

export type PdfKpi = { label: string; value: string; hint?: string };

function formatDateCo(d: Date): string {
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatMoneyCop(amount: number): string {
  return `$${amount.toLocaleString('es-CO')} COP`;
}

export { formatDateCo, formatMoneyCop };

export function renderPdf(
  build: (pdf: TalentBridgePdf) => void,
  options?: { margin?: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      bufferPages: true,
      autoFirstPage: true,
    });
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pdf = new TalentBridgePdf(doc, options?.margin ?? DEFAULT_MARGIN);
    build(pdf);
    pdf.finalize();
    doc.end();
  });
}

export class TalentBridgePdf {
  readonly doc: InstanceType<typeof PDFDocument>;
  readonly margin: number;
  readonly contentWidth: number;
  y: number;
  private sectionCount = 0;

  constructor(doc: InstanceType<typeof PDFDocument>, margin = DEFAULT_MARGIN) {
    this.doc = doc;
    this.margin = margin;
    this.contentWidth = PAGE.width - margin * 2;
    this.y = margin + STRIP_HEIGHT;
    this.drawPageStrip();
  }

  private bottomLimit(): number {
    return PAGE.height - this.margin - FOOTER_RESERVE;
  }

  /** Evita que PDFKit dispare saltos de página automáticos al escribir texto */
  private syncCursor(): void {
    this.doc.x = this.margin;
    this.doc.y = this.y;
  }

  private measureText(
    text: string,
    width: number,
    font: string,
    fontSize: number,
    lineGap = 2
  ): number {
    this.doc.font(font).fontSize(fontSize);
    return this.doc.heightOfString(text, { width, lineGap });
  }

  /** Texto en caja acotada: no crea páginas extra */
  private drawBoundedText(
    text: string,
    x: number,
    y: number,
    width: number,
    font: string,
    fontSize: number,
    color: string,
    lineGap = 2
  ): number {
    const h = this.measureText(text, width, font, fontSize, lineGap);
    this.doc.font(font).fontSize(fontSize).fillColor(color);
    this.doc.text(text, x, y, { width, lineGap, height: h });
    this.syncCursor();
    return h;
  }

  ensureSpace(needed: number): void {
    if (this.y + needed <= this.bottomLimit()) return;
    this.doc.addPage();
    this.y = this.margin + STRIP_HEIGHT;
    this.drawPageStrip();
    this.syncCursor();
  }

  drawPageStrip(): void {
    this.doc.save();
    this.doc.rect(0, 0, PAGE.width, 6).fill(TB.primary);
    this.doc.rect(0, 6, PAGE.width, 3).fill(TB.accent);
    this.doc.restore();
  }

  drawCoverHeader(opts: {
    reportType: string;
    title: string;
    subtitle?: string;
    meta?: PdfMetaLine[];
    generatedAt?: Date;
  }): void {
    const { reportType, title, subtitle, meta, generatedAt = new Date() } = opts;
    const pad = 16;
    const innerW = this.contentWidth - pad * 2;

    const titleH = this.measureText(title, innerW, 'Helvetica-Bold', 18);
    const subtitleH = subtitle
      ? this.measureText(subtitle, innerW, 'Helvetica', 10)
      : 0;
    const headerH = 52 + titleH + subtitleH + (subtitle ? 6 : 0);

    this.ensureSpace(headerH + 20);

    const hy = this.y;
    this.doc.save();
    this.doc.roundedRect(this.margin, hy, this.contentWidth, headerH, 8).fill(TB.primary);
    this.doc.restore();

    let ty = hy + 14;
    this.drawBoundedText('TALENTBRIDGE', this.margin + pad, ty, innerW, 'Helvetica-Bold', 9, '#ffffff', 0);
    ty += 12;
    this.drawBoundedText(
      reportType.toUpperCase(),
      this.margin + pad,
      ty,
      innerW,
      'Helvetica',
      8,
      '#ffffff',
      0
    );
    ty += 14;
    ty += this.drawBoundedText(title, this.margin + pad, ty, innerW, 'Helvetica-Bold', 18, '#ffffff', 2);
    if (subtitle) {
      ty += 4;
      this.drawBoundedText(subtitle, this.margin + pad, ty, innerW, 'Helvetica', 10, '#ffffff', 2);
    }

    this.y = hy + headerH + 14;

    const dateLine = `Generado el ${formatDateCo(generatedAt)} · Documento confidencial`;
    const dateH = this.measureText(dateLine, this.contentWidth, 'Helvetica', 8);
    this.ensureSpace(dateH + 8);
    this.drawBoundedText(
      dateLine,
      this.margin,
      this.y,
      this.contentWidth,
      'Helvetica',
      8,
      TB.subtle
    );
    this.y += dateH + 10;

    if (meta && meta.length > 0) {
      const rowHeights = meta.map(line => {
        const labelH = this.measureText(line.label, innerW, 'Helvetica-Bold', 8);
        const valueH = this.measureText(line.value, innerW, 'Helvetica', 9);
        return 4 + labelH + 2 + valueH + 8;
      });
      const boxH = 12 + rowHeights.reduce((a, b) => a + b, 0);
      this.ensureSpace(boxH + 8);

      const boxY = this.y;
      this.doc.save();
      this.doc.roundedRect(this.margin, boxY, this.contentWidth, boxH, 6).fill(TB.bg);
      this.doc.restore();

      let my = boxY + 10;
      for (const line of meta) {
        const lh = this.drawBoundedText(
          line.label,
          this.margin + 12,
          my,
          innerW,
          'Helvetica-Bold',
          8,
          TB.muted
        );
        my += lh + 2;
        const vh = this.drawBoundedText(
          line.value,
          this.margin + 12,
          my,
          innerW,
          'Helvetica',
          9,
          TB.dark
        );
        my += vh + 8;
      }
      this.y = boxY + boxH + 12;
    }
  }

  drawExecutiveSummary(paragraphs: string[]): void {
    this.drawSection('Resumen ejecutivo');
    for (const p of paragraphs) {
      this.drawParagraph(p);
    }
  }

  drawSection(title: string): void {
    this.sectionCount += 1;
    this.ensureSpace(32);
    this.y += 4;
    const sy = this.y;
    this.doc.save();
    this.doc.rect(this.margin, sy, 4, 18).fill(TB.accent);
    this.doc.restore();
    const th = this.drawBoundedText(
      `${this.sectionCount}. ${title}`,
      this.margin + 12,
      sy + 2,
      this.contentWidth - 12,
      'Helvetica-Bold',
      12,
      TB.primary
    );
    this.y = sy + Math.max(22, th + 6);
  }

  drawParagraph(text: string, opts?: { indent?: number; color?: string }): void {
    const indent = opts?.indent ?? 0;
    const width = this.contentWidth - indent;
    const h = this.measureText(text, width, 'Helvetica', 10, 3);
    this.ensureSpace(h + 10);
    const ph = this.drawBoundedText(
      text,
      this.margin + indent,
      this.y,
      width,
      'Helvetica',
      10,
      opts?.color ?? TB.muted,
      3
    );
    this.y += ph + 8;
  }

  drawKeyValueGrid(rows: PdfMetaLine[], columns = 2): void {
    if (rows.length === 0) return;
    const gap = 12;
    const colW = (this.contentWidth - gap * (columns - 1)) / columns;

    for (let i = 0; i < rows.length; i += columns) {
      const slice = rows.slice(i, i + columns);
      let rowH = 0;
      const startY = this.y;

      slice.forEach((row, col) => {
        const x = this.margin + col * (colW + gap);
        const labelH = this.measureText(row.label, colW, 'Helvetica-Bold', 8);
        const valueH = this.measureText(row.value, colW, 'Helvetica', 10, 2);
        const cellH = labelH + 4 + valueH;
        rowH = Math.max(rowH, cellH);

        this.ensureSpace(cellH + 4);
        this.drawBoundedText(row.label, x, startY, colW, 'Helvetica-Bold', 8, TB.subtle);
        this.drawBoundedText(row.value, x, startY + labelH + 4, colW, 'Helvetica', 10, TB.dark, 2);
      });

      this.y = startY + rowH + 12;
    }
  }

  drawKpiRow(kpis: PdfKpi[]): void {
    if (kpis.length === 0) return;
    const gap = 8;
    const boxW = (this.contentWidth - gap * (kpis.length - 1)) / kpis.length;

    const layouts = kpis.map(kpi => {
      const innerW = boxW - 16;
      const labelH = this.measureText(kpi.label.toUpperCase(), innerW, 'Helvetica', 7, 0);
      const valueH = this.measureText(kpi.value, innerW, 'Helvetica-Bold', 11, 1);
      const hintH = kpi.hint ? this.measureText(kpi.hint, innerW, 'Helvetica', 7, 0) : 0;
      const boxH = 10 + labelH + 6 + valueH + (hintH ? 4 + hintH : 0) + 10;
      return { kpi, labelH, valueH, hintH, boxH };
    });

    const boxH = Math.max(...layouts.map(l => l.boxH));
    this.ensureSpace(boxH + 10);

    const rowY = this.y;
    layouts.forEach((layout, i) => {
      const x = this.margin + i * (boxW + gap);
      this.doc.save();
      this.doc.roundedRect(x, rowY, boxW, boxH, 6).fill(TB.bg);
      this.doc.lineWidth(0.5).strokeColor(TB.border).roundedRect(x, rowY, boxW, boxH, 6).stroke();
      this.doc.restore();

      let cy = rowY + 10;
      const innerW = boxW - 16;
      cy += this.drawBoundedText(
        layout.kpi.label.toUpperCase(),
        x + 8,
        cy,
        innerW,
        'Helvetica',
        7,
        TB.subtle,
        0
      );
      cy += 6;
      cy += this.drawBoundedText(
        layout.kpi.value,
        x + 8,
        cy,
        innerW,
        'Helvetica-Bold',
        11,
        TB.primary,
        1
      );
      if (layout.kpi.hint) {
        cy += 4;
        this.drawBoundedText(layout.kpi.hint, x + 8, cy, innerW, 'Helvetica', 7, TB.muted, 0);
      }
    });

    this.y = rowY + boxH + 12;
  }

  drawTable(columns: PdfTableColumn[], rows: string[][]): void {
    if (rows.length === 0) {
      this.drawParagraph('Sin registros para mostrar en este apartado.');
      return;
    }

    const headerH = 22;
    const rowPad = 6;
    const totalW = columns.reduce((s, c) => s + c.width, 0);
    const scale = this.contentWidth / totalW;
    const scaledCols = columns.map(c => ({
      ...c,
      width: Math.floor(c.width * scale),
    }));

    const measureRow = (row: string[]) => {
      let h = rowPad * 2;
      row.forEach((cell, ci) => {
        const ch = this.measureText(cell, scaledCols[ci].width - 12, 'Helvetica', 9);
        h = Math.max(h, ch + rowPad * 2);
      });
      return h;
    };

    const drawHeader = () => {
      this.ensureSpace(headerH + 4);
      const hy = this.y;
      this.doc.save();
      this.doc.rect(this.margin, hy, this.contentWidth, headerH).fill(TB.primary);
      this.doc.restore();
      let x = this.margin;
      scaledCols.forEach(col => {
        this.drawBoundedText(
          col.header,
          x + 6,
          hy + 7,
          col.width - 12,
          'Helvetica-Bold',
          8,
          '#ffffff',
          0
        );
        x += col.width;
      });
      this.y = hy + headerH;
    };

    drawHeader();

    rows.forEach((row, idx) => {
      const rowH = measureRow(row);
      if (this.y + rowH > this.bottomLimit()) {
        this.doc.addPage();
        this.y = this.margin + STRIP_HEIGHT;
        this.drawPageStrip();
        this.syncCursor();
        drawHeader();
      }

      const ry = this.y;
      if (idx % 2 === 0) {
        this.doc.save();
        this.doc.rect(this.margin, ry, this.contentWidth, rowH).fill(TB.bg);
        this.doc.restore();
      }

      let x = this.margin;
      row.forEach((cell, ci) => {
        const col = scaledCols[ci];
        this.drawBoundedText(
          cell,
          x + 6,
          ry + rowPad,
          col.width - 12,
          'Helvetica',
          9,
          TB.dark,
          1
        );
        x += col.width;
      });
      this.y = ry + rowH;
    });
    this.y += 8;
  }

  drawRatingBars(
    items: { label: string; score: number | null; max?: number }[]
  ): void {
    const maxScore = 5;
    for (const item of items) {
      this.ensureSpace(24);
      const rowY = this.y;
      const labelW = 150;
      const barW = this.contentWidth - labelW - 52;

      this.drawBoundedText(item.label, this.margin, rowY, labelW, 'Helvetica', 9, TB.muted);

      const score = item.score ?? 0;
      const pct = Math.min(1, score / (item.max ?? maxScore));
      const barX = this.margin + labelW;
      const barY = rowY + 5;
      this.doc.save();
      this.doc.roundedRect(barX, barY, barW, 8, 4).fill(TB.border);
      if (pct > 0) {
        this.doc.roundedRect(barX, barY, Math.max(4, barW * pct), 8, 4).fill(TB.accent);
      }
      this.doc.restore();

      const scoreText =
        item.score != null ? `${item.score.toFixed(1)} / ${item.max ?? maxScore}` : '—';
      this.drawBoundedText(
        scoreText,
        barX + barW + 8,
        rowY,
        48,
        'Helvetica-Bold',
        9,
        TB.primary,
        0
      );
      this.y = rowY + 22;
    }
    this.y += 4;
  }

  drawBulletList(items: string[]): void {
    for (const item of items) {
      const text = `•  ${item}`;
      const h = this.measureText(text, this.contentWidth - 12, 'Helvetica', 9, 2);
      this.ensureSpace(h + 6);
      const bh = this.drawBoundedText(
        text,
        this.margin + 4,
        this.y,
        this.contentWidth - 12,
        'Helvetica',
        9,
        TB.muted,
        2
      );
      this.y += bh + 6;
    }
    this.y += 2;
  }

  drawHighlightBox(
    title: string,
    body: string,
    variant: 'info' | 'success' | 'warning' = 'info'
  ): void {
    const colors = {
      info: { bg: '#e8f0fa', border: TB.primary },
      success: { bg: '#e6faf0', border: TB.accent },
      warning: { bg: '#fff8e6', border: TB.warning },
    };
    const c = colors[variant];
    const innerW = this.contentWidth - 24;
    const titleH = this.measureText(title, innerW, 'Helvetica-Bold', 10);
    const bodyH = this.measureText(body, innerW, 'Helvetica', 9, 3);
    const boxH = 12 + titleH + 8 + bodyH + 12;

    this.ensureSpace(boxH + 8);
    const boxY = this.y;

    this.doc.save();
    this.doc.roundedRect(this.margin, boxY, this.contentWidth, boxH, 6).fill(c.bg);
    this.doc.lineWidth(1).strokeColor(c.border).roundedRect(this.margin, boxY, this.contentWidth, boxH, 6).stroke();
    this.doc.restore();

    let ty = boxY + 12;
    ty += this.drawBoundedText(title, this.margin + 12, ty, innerW, 'Helvetica-Bold', 10, c.border);
    ty += 8;
    this.drawBoundedText(body, this.margin + 12, ty, innerW, 'Helvetica', 9, TB.muted, 3);
    this.y = boxY + boxH + 10;
  }

  drawTrendBars(
    items: { label: string; value: number }[],
    accentColor: string = TB.accent
  ): void {
    if (items.length === 0) {
      this.drawParagraph('Sin datos en el periodo analizado.');
      return;
    }

    const max = Math.max(...items.map(i => i.value), 1);
    const barAreaH = 64;
    const labelAreaH = 22;
    const totalH = barAreaH + labelAreaH + 8;
    this.ensureSpace(totalH);

    const chartY = this.y;
    const baseY = chartY + barAreaH;
    const slotW = this.contentWidth / items.length;

    items.forEach((item, i) => {
      const h = Math.max(3, (item.value / max) * (barAreaH - 12));
      const x = this.margin + i * slotW + slotW * 0.12;
      const bw = slotW * 0.76;
      const barTop = baseY - h;

      this.doc.save();
      this.doc.rect(x, barTop, bw, h).fill(accentColor);
      this.doc.restore();

      if (item.value > 0) {
        this.drawBoundedText(
          String(item.value),
          x,
          barTop - 11,
          bw,
          'Helvetica-Bold',
          7,
          TB.muted,
          0
        );
      }
      this.drawBoundedText(item.label, x, baseY + 4, bw, 'Helvetica', 6, TB.subtle, 0);
    });

    this.y = chartY + totalH;
  }

  finalize(): void {
    const range = this.doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      this.doc.switchToPage(i);
      const footerY = PAGE.height - this.margin + 4;
      this.drawBoundedText(
        'TalentBridge · Plataforma de talento universitario · Documento informativo',
        this.margin,
        footerY,
        this.contentWidth - 70,
        'Helvetica',
        7,
        TB.subtle,
        0
      );
      this.drawBoundedText(
        `Pág. ${i - range.start + 1} de ${range.count}`,
        this.margin,
        footerY,
        this.contentWidth,
        'Helvetica',
        7,
        TB.subtle,
        0
      );
    }
  }
}
