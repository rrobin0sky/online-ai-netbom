import ExcelJS from 'exceljs';
import { BOMItem } from '../types/device';

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

  // 1. Exact 11 Columns matching UI Quotation Sheet (minus 操作 column)
  // 序号 | 网络分区 | 品牌 | 产品型号 | 订货编码 (P/N) | 关键技术规格描述 | 数量 | 单位 | 单价 (元) | 合价 (元) | 备注
  worksheet.columns = [
    { key: 'index', width: 8 },        // A: 序号
    { key: 'area', width: 15 },        // B: 网络分区
    { key: 'brand', width: 12 },       // C: 品牌
    { key: 'model', width: 24 },       // D: 产品型号
    { key: 'partNumber', width: 18 },  // E: 订货编码 (P/N)
    { key: 'specs', width: 46 },       // F: 关键技术规格描述
    { key: 'qty', width: 10 },         // G: 数量
    { key: 'unit', width: 8 },         // H: 单位
    { key: 'unitPrice', width: 16 },   // I: 单价 (元)
    { key: 'totalPrice', width: 18 },  // J: 合价 (元)
    { key: 'notes', width: 28 },       // K: 备注
  ];

  // 2. Title Header Banner
  worksheet.mergeCells('A1:K1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${projectName} — 工程设备配置与报价清单 (BOM)`;
  titleCell.font = { name: 'Microsoft YaHei', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF18181B' }, // Zinc 900
  };
  worksheet.getRow(1).height = 38;

  // 3. Metadata Sub-header
  worksheet.mergeCells('A2:K2');
  const subMetaCell = worksheet.getCell('A2');
  const dateStr = new Date().toISOString().split('T')[0];
  subMetaCell.value = `客户单位: ${clientName}    |    编制: ${creatorName}    |    日期: ${dateStr}`;
  subMetaCell.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FFD4D4D8' } };
  subMetaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subMetaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF27272A' }, // Zinc 800
  };
  worksheet.getRow(2).height = 24;

  // Blank line
  worksheet.addRow([]);
  worksheet.getRow(3).height = 8;

  // 4. Table Header Row (Row 4)
  const headerRow = worksheet.addRow([
    '序号',
    '网络分区',
    '品牌',
    '产品型号',
    '订货编码 (P/N)',
    '关键技术规格描述',
    '数量',
    '单位',
    '单价 (元)',
    '合价 (元)',
    '备注',
  ]);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3F3F46' }, // Zinc 700
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF18181B' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // 5. Data Rows
  let currentRowIndex = 5;
  const startDataRow = currentRowIndex;

  items.forEach((item, idx) => {
    const row = worksheet.getRow(currentRowIndex);
    const effectiveDiscount = item.itemDiscountRate ?? globalDiscountRate;
    const gpl = item.device.pricing.list_price_gpl;

    const finalUnitPrice =
      item.customUnitPrice !== null
        ? item.customUnitPrice
        : item.device.pricing.cost_estimate !== null
        ? item.device.pricing.cost_estimate
        : gpl !== null
        ? Math.round(gpl * effectiveDiscount)
        : 0;

    row.values = [
      idx + 1,
      item.areaGroup,
      item.device.brand,
      item.device.model,
      item.device.part_number,
      `${item.device.specs.ports.summary} | ${item.device.specs.switching_capacity_gbps}Gbps${
        item.device.specs.poe.supported ? ` | PoE ${item.device.specs.poe.budget_watts}W` : ''
      }`,
      item.quantity,
      '台',
      finalUnitPrice,
      { formula: `G${currentRowIndex}*I${currentRowIndex}` },
      item.notes || '',
    ];

    row.height = 25;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Microsoft YaHei', size: 9.5 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        left: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        right: { style: 'thin', color: { argb: 'FFE4E4E7' } },
      };

      if ([1, 2, 3, 5, 8].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      if (colNumber === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '#,##0';
      }
      if (colNumber === 9 || colNumber === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '¥#,##0.00';
      }
    });

    currentRowIndex++;

    // Sub-rows for accessories if any
    (item.selectedAccessories || []).forEach((acc, accIdx) => {
      const accRow = worksheet.getRow(currentRowIndex);
      const totalAccQty = acc.quantity * item.quantity;
      accRow.values = [
        `${idx + 1}.${accIdx + 1}`,
        '配套辅件',
        '通用/原厂',
        acc.accessoryName,
        acc.partNumber,
        `每台主机配 ${acc.quantity} 个（共 ${item.quantity} 台主机）`,
        totalAccQty,
        '只',
        acc.unitPrice,
        { formula: `G${currentRowIndex}*I${currentRowIndex}` },
        '',
      ];
      accRow.height = 22;
      accRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Microsoft YaHei', size: 9, color: { argb: 'FF52525B' } };
        cell.alignment = { vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFAFAFA' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE4E4E7' } },
          left: { style: 'thin', color: { argb: 'FFE4E4E7' } },
          bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } },
          right: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        };
        if ([1, 2, 3, 5, 7, 8].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
        if (colNumber === 9 || colNumber === 10) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '¥#,##0.00';
        }
      });
      currentRowIndex++;
    });
  });

  const endDataRow = currentRowIndex - 1;

  // 6. Summary Rows
  if (items.length > 0) {
    worksheet.addRow([]);
    currentRowIndex++;

    // Subtotal Row (未税总价)
    const subtotalRow = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
    worksheet.getCell(`A${currentRowIndex}`).value = '未税总价:';
    worksheet.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell(`A${currentRowIndex}`).font = { name: 'Microsoft YaHei', size: 10, bold: true };

    const subtotalFormulaCell = worksheet.getCell(`J${currentRowIndex}`);
    subtotalFormulaCell.value = { formula: `SUM(J${startDataRow}:J${endDataRow})` };
    subtotalFormulaCell.numFmt = '¥#,##0.00';
    subtotalFormulaCell.font = { name: 'Microsoft YaHei', size: 11, bold: true };
    subtotalRow.height = 24;
    currentRowIndex++;

    // Tax Row (税额)
    const taxRow = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
    worksheet.getCell(`A${currentRowIndex}`).value = `增值税额 (${(taxRate * 100).toFixed(0)}%):`;
    worksheet.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell(`A${currentRowIndex}`).font = { name: 'Microsoft YaHei', size: 10 };

    const taxFormulaCell = worksheet.getCell(`J${currentRowIndex}`);
    taxFormulaCell.value = { formula: `J${currentRowIndex - 1}*${taxRate}` };
    taxFormulaCell.numFmt = '¥#,##0.00';
    taxFormulaCell.font = { name: 'Microsoft YaHei', size: 10 };
    taxRow.height = 22;
    currentRowIndex++;

    // Grand Total Row (含税总计)
    const grandTotalRow = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
    worksheet.getCell(`A${currentRowIndex}`).value = '含税总计:';
    worksheet.getCell(`A${currentRowIndex}`).alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell(`A${currentRowIndex}`).font = { name: 'Microsoft YaHei', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell(`A${currentRowIndex}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF18181B' },
    };

    const grandFormulaCell = worksheet.getCell(`J${currentRowIndex}`);
    grandFormulaCell.value = { formula: `J${currentRowIndex - 2}+J${currentRowIndex - 1}` };
    grandFormulaCell.numFmt = '¥#,##0.00';
    grandFormulaCell.font = { name: 'Microsoft YaHei', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    grandFormulaCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF18181B' },
    };
    grandTotalRow.height = 28;
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
