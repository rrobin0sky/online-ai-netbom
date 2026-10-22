import ExcelJS from 'exceljs';
import { BOMItem } from '../types/device';

// Helper: Convert number to Chinese Currency Uppercase (人民币大写)
function numberToChinese(num: number): string {
  if (isNaN(num) || num === 0) return '零元整';
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];

  const head = num < 0 ? '欠' : '';
  num = Math.abs(num);

  let s = '';
  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(num * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
  }
  s = s || '整';
  num = Math.floor(num);

  for (let i = 0; i < unit[0].length && num > 0; i++) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j++) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return (
    head +
    s
      .replace(/(零.)*零元/, '元')
      .replace(/(零.)+/g, '零')
      .replace(/^整$/, '零元整')
  );
}

export interface ExportOptions {
  projectName: string;
  clientName: string;
  creatorName: string;
  globalDiscountRate: number;
  taxRate: number;
  items: BOMItem[];
}

export async function exportBOMToExcel(options: ExportOptions) {
  const { projectName, clientName, creatorName, globalDiscountRate, taxRate, items } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NetBOM - bin0sky.tech';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('设备配置与报价清单', {
    views: [{ showGridLines: true }],
  });

  // 1. Column Definitions
  worksheet.columns = [
    { key: 'index', width: 6 },        // A: 序号
    { key: 'area', width: 14 },        // B: 规划分区
    { key: 'brand', width: 10 },       // C: 品牌
    { key: 'model', width: 22 },       // D: 产品型号
    { key: 'partNumber', width: 16 },  // E: 物料订货号 P/N
    { key: 'specs', width: 44 },       // F: 硬件规格与配置说明
    { key: 'qty', width: 8 },          // G: 数量
    { key: 'unit', width: 6 },         // H: 单位
    { key: 'gpl', width: 14 },         // I: 官方指导价(GPL)
    { key: 'discount', width: 10 },    // J: 折扣率
    { key: 'unitPrice', width: 15 },   // K: 投标/对客单价
    { key: 'totalPrice', width: 16 },  // L: 合计金额
    { key: 'notes', width: 26 },       // M: 备注 / 伴生配件
  ];

  // 2. Title Header Banner
  worksheet.mergeCells('A1:M1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${projectName} — 网络设备物料清单 (BOM)`;
  titleCell.font = { name: 'Microsoft YaHei', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }, // Deep Slate 900
  };
  worksheet.getRow(1).height = 42;

  // 3. Metadata Sub-header
  worksheet.mergeCells('A2:M2');
  const subMetaCell = worksheet.getCell('A2');
  const dateStr = new Date().toISOString().split('T')[0];
  subMetaCell.value = `客户/采购方: ${clientName}    |    编制团队: ${creatorName}    |    生成日期: ${dateStr}    |    报价有效期: 30日`;
  subMetaCell.font = { name: 'Microsoft YaHei', size: 10, italic: true, color: { argb: 'FF94A3B8' } };
  subMetaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subMetaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };
  worksheet.getRow(2).height = 24;

  // Blank line
  worksheet.addRow([]);
  worksheet.getRow(3).height = 8;

  // 4. Table Header Row (Row 4)
  const headerRow = worksheet.addRow([
    '序号',
    '规划分区',
    '品牌',
    '产品型号',
    '订货号 (P/N)',
    '详细硬件规格说明',
    '数量',
    '单位',
    '目录指导价 (GPL)',
    '执行折扣',
    '投标销售单价',
    '分项合价 (元)',
    '配件清单与技术备注',
  ]);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0284C7' }, // Sky 600
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF0369A1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // 5. Data Rows
  let currentRowIndex = 5;
  const startDataRow = currentRowIndex;

  items.forEach((item, idx) => {
    const row = worksheet.getRow(currentRowIndex);
    
    // Effective Discount
    const effectiveDiscount = item.itemDiscountRate ?? globalDiscountRate;
    
    // Effective Unit Price
    let finalUnitPrice: number;
    if (item.customUnitPrice !== null) {
      finalUnitPrice = item.customUnitPrice;
    } else if (item.device.pricing.list_price_gpl !== null) {
      finalUnitPrice = item.device.pricing.list_price_gpl * effectiveDiscount;
    } else {
      finalUnitPrice = 0;
    }

    // Accessories summary text
    let accSummary = '';
    if (item.selectedAccessories && item.selectedAccessories.length > 0) {
      accSummary = item.selectedAccessories
        .map((a) => `[${a.accessoryName} x${a.quantity}]`)
        .join(' ');
    }
    const fullNotes = [item.notes, accSummary].filter(Boolean).join(' | ');

    row.values = [
      idx + 1,
      item.areaGroup,
      item.device.brand,
      item.device.model,
      item.device.part_number,
      `${item.device.specs.ports.summary} | 背板 ${item.device.specs.switching_capacity_gbps}Gbps | ${item.device.specs.poe.supported ? 'PoE+供电' : '非PoE'}`,
      item.quantity,
      '台',
      item.device.pricing.list_price_gpl ?? 0,
      effectiveDiscount,
      finalUnitPrice,
      { formula: `G${currentRowIndex}*K${currentRowIndex}` }, // Excel Formula: Qty * UnitPrice
      fullNotes,
    ];

    // Styling
    row.height = 26;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Microsoft YaHei', size: 9.5 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Zebra striping
      if (idx % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }

      // Column-specific alignments & number formats
      if ([1, 2, 3, 5, 8].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      if (colNumber === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '#,##0';
      }
      if (colNumber === 9 || colNumber === 11 || colNumber === 12) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '¥#,##0.00';
      }
      if (colNumber === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '0.0%';
      }
    });

    currentRowIndex++;
  });

  const endDataRow = currentRowIndex - 1;

  // 6. Summary Rows
  if (items.length > 0) {
    // Blank separator
    worksheet.addRow([]);
    currentRowIndex++;

    // Subtotal Row (未税总价)
    const subtotalRow = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:K${currentRowIndex}`);
    worksheet.getCell(`A${currentRowIndex}`).value = '设备物料净价总计 (未税合计):';
    worksheet.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell(`A${currentRowIndex}`).font = { name: 'Microsoft YaHei', size: 10, bold: true };
    
    const subtotalFormulaCell = worksheet.getCell(`L${currentRowIndex}`);
    subtotalFormulaCell.value = { formula: `SUM(L${startDataRow}:L${endDataRow})` };
    subtotalFormulaCell.numFmt = '¥#,##0.00';
    subtotalFormulaCell.font = { name: 'Microsoft YaHei', size: 11, bold: true, color: { argb: 'FF0284C7' } };
    subtotalRow.height = 24;
    currentRowIndex++;

    // Tax Row (增值税额)
    const taxRow = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:K${currentRowIndex}`);
    worksheet.getCell(`A${currentRowIndex}`).value = `增值税额 (税率 ${(taxRate * 100).toFixed(0)}%):`;
    worksheet.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell(`A${currentRowIndex}`).font = { name: 'Microsoft YaHei', size: 10 };
    
    const taxFormulaCell = worksheet.getCell(`L${currentRowIndex}`);
    taxFormulaCell.value = { formula: `L${currentRowIndex - 1}*${taxRate}` };
    taxFormulaCell.numFmt = '¥#,##0.00';
    taxFormulaCell.font = { name: 'Microsoft YaHei', size: 10 };
    taxRow.height = 22;
    currentRowIndex++;

    // Grand Total Row (含税总报价)
    const grandTotalRow = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:K${currentRowIndex}`);
    worksheet.getCell(`A${currentRowIndex}`).value = '方案最终含税总报价 (人民币大写/小写):';
    worksheet.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell(`A${currentRowIndex}`).font = { name: 'Microsoft YaHei', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell(`A${currentRowIndex}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' },
    };

    const grandFormulaCell = worksheet.getCell(`L${currentRowIndex}`);
    grandFormulaCell.value = { formula: `L${currentRowIndex - 2}+L${currentRowIndex - 1}` };
    grandFormulaCell.numFmt = '¥#,##0.00';
    grandFormulaCell.font = { name: 'Microsoft YaHei', size: 13, bold: true, color: { argb: 'FFF59E0B' } };
    grandFormulaCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' },
    };
    grandTotalRow.height = 30;
  }

  // 7. Write and trigger download in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${projectName}_NetBOM报价单_${dateStr}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
