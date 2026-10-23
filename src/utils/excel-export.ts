import ExcelJS from 'exceljs';
import { BOMItem } from '../types/device';
import { BOMServiceItem } from '../data/seedServices';

export interface ExportOptions {
  projectName: string;
  clientName: string;
  creatorName: string;
  quoteValidityDays?: number;
  globalDiscountRate: number;
  taxRate: number;
  items: BOMItem[];
  serviceItems?: BOMServiceItem[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function exportBOMToExcel(options: ExportOptions) {
  const {
    projectName,
    clientName,
    creatorName,
    quoteValidityDays = 30,
    globalDiscountRate,
    taxRate,
    items,
    serviceItems = [],
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NetBOM - bin0sky.tech';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('设备配置与报价清单', {
    views: [{ showGridLines: true }],
  });

  // 13 Columns matching Engineer Quotation Sheet:
  // A:序号 | B:分区/类别 | C:品牌 | D:型号/项目名称 | E:订货编码(P/N) | F:关键技术规格/计费标准 | G:数量 | H:单位 | I:税率 | J:未税单价(元) | K:含税单价(元) | L:含税合价(元) | M:备注
  worksheet.columns = [
    { key: 'index', width: 8 },        // A: 序号
    { key: 'area', width: 15 },        // B: 网络分区 / 费用类别
    { key: 'brand', width: 12 },       // C: 品牌
    { key: 'model', width: 24 },       // D: 产品型号 / 项目名称
    { key: 'partNumber', width: 18 },  // E: 订货编码 (P/N)
    { key: 'specs', width: 42 },       // F: 关键技术规格描述 / 计费标准
    { key: 'qty', width: 10 },         // G: 数量
    { key: 'unit', width: 8 },         // H: 单位
    { key: 'taxRate', width: 10 },     // I: 税率
    { key: 'priceExcl', width: 16 },   // J: 未税单价 (元)
    { key: 'priceIncl', width: 16 },   // K: 含税单价 (元)
    { key: 'totalIncl', width: 18 },   // L: 含税合价 (元)
    { key: 'notes', width: 24 },       // M: 备注
  ];

  // 1. Title Header Banner
  worksheet.mergeCells('A1:M1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${projectName} — 工程配置与综合报价清单 (BOM)`;
  titleCell.font = { name: 'Microsoft YaHei', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF18181B' },
  };
  worksheet.getRow(1).height = 38;

  // 2. Metadata Sub-header (with 报价有效期)
  worksheet.mergeCells('A2:M2');
  const subMetaCell = worksheet.getCell('A2');
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const validUntilDate = new Date(now.getTime() + quoteValidityDays * 86400000)
    .toISOString()
    .split('T')[0];
  subMetaCell.value = `客户单位: ${clientName}    |    编制: ${creatorName}    |    报价日期: ${dateStr}    |    报价有效期: ${quoteValidityDays}天 (至 ${validUntilDate})`;
  subMetaCell.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FFD4D4D8' } };
  subMetaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subMetaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF27272A' },
  };
  worksheet.getRow(2).height = 24;

  worksheet.addRow([]);
  worksheet.getRow(3).height = 8;

  let currentRowIndex = 4;

  // Pre-calculate equipment & fixed service totals for percentage-mode services
  let equipExclSubtotal = 0;
  let equipInclSubtotal = 0;

  // ============================================================================
  // SECTION 1: 一、网络设备清单
  // ============================================================================
  if (items.length > 0) {
    worksheet.mergeCells(`A${currentRowIndex}:M${currentRowIndex}`);
    const sec1Cell = worksheet.getCell(`A${currentRowIndex}`);
    sec1Cell.value = '一、网络设备清单';
    sec1Cell.font = { name: 'Microsoft YaHei', size: 10.5, bold: true, color: { argb: 'FF18181B' } };
    sec1Cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE4E4E7' },
    };
    worksheet.getRow(currentRowIndex).height = 24;
    currentRowIndex++;

    const headerRow = worksheet.getRow(currentRowIndex);
    headerRow.values = [
      '序号',
      '网络分区',
      '品牌',
      '产品型号',
      '订货编码 (P/N)',
      '关键技术规格描述',
      '数量',
      '单位',
      '税率',
      '未税单价 (元)',
      '含税单价 (元)',
      '含税合价 (元)',
      '备注',
    ];
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3F3F46' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF18181B' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });
    currentRowIndex++;

    items.forEach((item, idx) => {
      const row = worksheet.getRow(currentRowIndex);
      const effectiveDiscount = item.itemDiscountRate ?? globalDiscountRate;
      const gpl = item.device.pricing.list_price_gpl;
      const rowTax = item.itemTaxRate ?? taxRate;

      const unitPriceExcl =
        item.customUnitPrice !== null
          ? item.customUnitPrice
          : item.device.pricing.cost_estimate !== null
          ? item.device.pricing.cost_estimate
          : gpl !== null
          ? Math.round(gpl * effectiveDiscount)
          : 0;

      const unitPriceIncl = round2(unitPriceExcl * (1 + rowTax));
      const lineTotalIncl = round2(unitPriceIncl * item.quantity);

      equipExclSubtotal += round2(unitPriceExcl * item.quantity);
      equipInclSubtotal += lineTotalIncl;

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
        `${(rowTax * 100).toFixed(0)}%`,
        unitPriceExcl,
        unitPriceIncl,
        lineTotalIncl,
        item.notes || '',
      ];

      row.height = 24;
      styleDataRow(row);
      currentRowIndex++;

      // Sub-rows for accessories
      (item.selectedAccessories || []).forEach((acc, accIdx) => {
        const accRow = worksheet.getRow(currentRowIndex);
        const totalAccQty = acc.quantity * item.quantity;
        const accExcl = acc.unitPrice;
        const accIncl = round2(accExcl * (1 + rowTax));
        const accTotalIncl = round2(accIncl * totalAccQty);

        equipExclSubtotal += round2(accExcl * totalAccQty);
        equipInclSubtotal += accTotalIncl;

        accRow.values = [
          `${idx + 1}.${accIdx + 1}`,
          '配套辅件',
          '通用/原厂',
          acc.accessoryName,
          acc.partNumber,
          `每台主机配 ${acc.quantity} 个（共 ${item.quantity} 台主机）`,
          totalAccQty,
          '只',
          `${(rowTax * 100).toFixed(0)}%`,
          accExcl,
          accIncl,
          accTotalIncl,
          '',
        ];
        accRow.height = 22;
        styleDataRow(accRow, true);
        currentRowIndex++;
      });
    });
  }

  // ============================================================================
  // SECTION 2: 二、弱电材料、布线人工、作业费与项目管理费
  // ============================================================================
  let serviceExclSubtotal = 0;
  let serviceInclSubtotal = 0;

  if (serviceItems.length > 0) {
    if (items.length > 0) {
      worksheet.addRow([]);
      currentRowIndex++;
    }

    worksheet.mergeCells(`A${currentRowIndex}:M${currentRowIndex}`);
    const sec2Cell = worksheet.getCell(`A${currentRowIndex}`);
    sec2Cell.value = '二、弱电材料、布线人工、作业费与项目管理费';
    sec2Cell.font = { name: 'Microsoft YaHei', size: 10.5, bold: true, color: { argb: 'FF18181B' } };
    sec2Cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE4E4E7' },
    };
    worksheet.getRow(currentRowIndex).height = 24;
    currentRowIndex++;

    const sHeaderRow = worksheet.getRow(currentRowIndex);
    sHeaderRow.values = [
      '序号',
      '费用类别',
      '品牌/来源',
      '项目名称',
      '编码 (P/N)',
      '规格型号 / 计费标准描述',
      '数量/比例',
      '单位',
      '税率',
      '未税单价 (元)',
      '含税单价 (元)',
      '含税合价 (元)',
      '备注',
    ];
    sHeaderRow.height = 26;
    sHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3F3F46' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF18181B' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });
    currentRowIndex++;

    // Fixed service items subtotal first (used as base for percent mode)
    const fixedServiceExcl = serviceItems
      .filter((s) => s.pricingMode !== 'percent')
      .reduce((acc, s) => acc + round2(s.unitPriceExclTax * s.quantity), 0);

    const baseExclForPercent = equipExclSubtotal + fixedServiceExcl;

    serviceItems.forEach((sItem, sIdx) => {
      const row = worksheet.getRow(currentRowIndex);
      const isPercent = sItem.pricingMode === 'percent';

      const unitExcl = isPercent
        ? round2(baseExclForPercent * ((sItem.percentageRate || 0) / 100))
        : sItem.unitPriceExclTax;
      const unitIncl = isPercent
        ? round2(unitExcl * (1 + sItem.taxRate))
        : sItem.unitPriceInclTax;
      const effQty = isPercent ? 1 : sItem.quantity;
      const rowExclTotal = round2(unitExcl * effQty);
      const rowInclTotal = round2(unitIncl * effQty);

      serviceExclSubtotal += rowExclTotal;
      serviceInclSubtotal += rowInclTotal;

      row.values = [
        sIdx + 1,
        sItem.item.category,
        sItem.item.brand || '工程标准',
        sItem.item.name,
        sItem.item.part_number,
        sItem.item.specs
          ? `${sItem.item.model ? sItem.item.model + ' | ' : ''}${sItem.item.specs}`
          : sItem.item.model,
        isPercent ? `${sItem.percentageRate}%` : sItem.quantity,
        sItem.item.unit,
        `${(sItem.taxRate * 100).toFixed(0)}%`,
        unitExcl,
        unitIncl,
        rowInclTotal,
        sItem.notes || '',
      ];
      row.height = 24;
      styleDataRow(row);
      currentRowIndex++;
    });
  }

  // ============================================================================
  // SUMMARY ROWS
  // ============================================================================
  const totalExcl = round2(equipExclSubtotal + serviceExclSubtotal);
  const totalIncl = round2(equipInclSubtotal + serviceInclSubtotal);
  const totalTax = round2(totalIncl - totalExcl);

  worksheet.addRow([]);
  currentRowIndex++;

  const addSummaryLine = (label: string, amount: number, isGrand = false) => {
    const row = worksheet.getRow(currentRowIndex);
    worksheet.mergeCells(`A${currentRowIndex}:K${currentRowIndex}`);
    const labelCell = worksheet.getCell(`A${currentRowIndex}`);
    labelCell.value = label;
    labelCell.alignment = { vertical: 'middle', horizontal: 'right' };
    labelCell.font = {
      name: 'Microsoft YaHei',
      size: isGrand ? 11 : 10,
      bold: isGrand,
      color: isGrand ? { argb: 'FFFFFFFF' } : undefined,
    };

    const valCell = worksheet.getCell(`L${currentRowIndex}`);
    valCell.value = amount;
    valCell.numFmt = '¥#,##0.00';
    valCell.font = {
      name: 'Microsoft YaHei',
      size: isGrand ? 12 : 10.5,
      bold: true,
      color: isGrand ? { argb: 'FFFFFFFF' } : undefined,
    };

    if (isGrand) {
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF18181B' },
      };
      valCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF18181B' },
      };
      row.height = 28;
    } else {
      row.height = 22;
    }
    currentRowIndex++;
  };

  if (items.length > 0 && serviceItems.length > 0) {
    addSummaryLine('一、网络设备含税小计:', equipInclSubtotal);
    addSummaryLine('二、弱电材料与工程服务含税小计:', serviceInclSubtotal);
  }
  addSummaryLine('未税总价合计:', totalExcl);
  addSummaryLine('增值税额合计:', totalTax);
  addSummaryLine('含税总计:', totalIncl, true);

  // Trigger download in browser
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

function styleDataRow(row: ExcelJS.Row, isSubRow = false) {
  row.eachCell((cell, colNumber) => {
    cell.font = {
      name: 'Microsoft YaHei',
      size: isSubRow ? 9 : 9.5,
      color: isSubRow ? { argb: 'FF52525B' } : undefined,
    };
    cell.alignment = { vertical: 'middle' };
    if (isSubRow) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFAFAFA' },
      };
    }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE4E4E7' } },
      left: { style: 'thin', color: { argb: 'FFE4E4E7' } },
      bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } },
      right: { style: 'thin', color: { argb: 'FFE4E4E7' } },
    };

    if ([1, 2, 3, 5, 7, 8, 9].includes(colNumber)) {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    if ([10, 11, 12].includes(colNumber)) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = '¥#,##0.00';
    }
  });
}
