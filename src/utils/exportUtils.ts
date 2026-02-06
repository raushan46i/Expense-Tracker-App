import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import { Alert, Platform } from 'react-native';
import RNFS from 'react-native-fs'; // <--- Added for safe file handling

type Category = string | { name?: string };

const getCategoryName = (category: Category): string => {
  if (typeof category === 'object' && category !== null) {
    return category.name || 'General';
  }
  return category || 'General';
};

export const exportData = async (
  expenses: any[],
  type: 'pdf' | 'csv' = 'pdf',
  currencySymbol: string = '$'
) => {
  if (!expenses || expenses.length === 0) {
    Alert.alert('No Data', 'There are no expenses to export.');
    return;
  }

  try {
    if (type === 'pdf') {
      await exportToPDF(expenses, currencySymbol);
    } else {
      await exportToCSV(expenses);
    }
  } catch (error) {
    console.error('Export Error:', error);
    Alert.alert('Export Failed', 'Something went wrong while exporting.');
  }
};

const exportToPDF = async (expenses: any[], currencySymbol: string) => {
  try {
    const total = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const date = new Date().toLocaleDateString();

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #333; color: #fff; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .amount { color: #d32f2f; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <div class="summary">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Total Items:</strong> ${expenses.length}</p>
            <p><strong>Total Spent:</strong> ${currencySymbol} ${total.toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Title</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(e => `
                <tr>
                  <td>${e.date || '-'}</td>
                  <td>${getCategoryName(e.category)}</td>
                  <td>${e.title}</td>
                  <td class="amount">${currencySymbol} ${Number(e.amount).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    await RNPrint.print({
      html: html,
      jobName: 'Expense Report'
    });

  } catch (error) {
    console.error('PDF Error:', error);
    Alert.alert('Error', 'Could not generate PDF.');
  }
};

// --- UPDATED CSV LOGIC ---
const exportToCSV = async (expenses: any[]) => {
  try {
    // 1. Create CSV String
    const header = 'Date,Category,Title,Amount,Time\n';
    const rows = expenses.map(e => {
        // Safe string handling for titles with commas or quotes
        const safeTitle = e.title ? e.title.replace(/"/g, '""') : '';
        return `${e.date},"${getCategoryName(e.category)}","${safeTitle}",${e.amount},${e.time || ''}`;
    }).join('\n');

    const csvData = header + rows;

    // 2. Save to Temporary Cache Directory (Safe on Android 11+)
    const fileName = `ExpenseX_Report_${Date.now()}.csv`;
    const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

    await RNFS.writeFile(path, csvData, 'utf8');
    console.log('File written to:', path);

    // 3. Share File
    // Android explicitly needs 'file://' prefix
    const fileUrl = Platform.OS === 'android' ? `file://${path}` : path;

    await Share.open({
      title: 'Export Expenses',
      message: 'Here is your expense report.',
      url: fileUrl,
      type: 'text/csv',
      failOnCancel: false, 
    });

  } catch (error) {
    console.error('CSV Error:', error);
    Alert.alert('Error', 'Failed to export CSV.');
  }
};