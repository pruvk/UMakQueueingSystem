import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from '@/lib/utils'

export const generateStaffReport = async () => {
  try {
    const response = await fetch('http://localhost:5272/api/users/staff', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch staff data')
    
    const staffData = await response.json()
    
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Staff Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(11)
    doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 14, 30)
    
    // Add table
    autoTable(doc, {
      head: [['ID', 'Username', 'Name', 'Role', 'Status', 'Created At']],
      body: staffData.map((staff: any) => [
        staff.userId,
        staff.username,
        `${staff.firstName} ${staff.middleName || ''} ${staff.lastName || ''}`.trim(),
        staff.role,
        staff.status,
        formatDate(staff.createdAt)
      ]),
      startY: 35,
    })
    
    // Save the PDF
    doc.save('staff-report.pdf')
  } catch (error) {
    console.error('Error generating staff report:', error)
    throw error
  }
}

export const generateInventoryReport = async () => {
  try {
    const response = await fetch('http://localhost:5272/api/products', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch inventory data')
    
    const products = await response.json()
    
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Inventory Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(11)
    doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 14, 30)
    
    // Add table
    autoTable(doc, {
      head: [['ID', 'Name', 'Type', 'Price', 'Description', 'Details']],
      body: products.map((product: any) => [
        product.id,
        product.name,
        product.type,
        `₱${product.price.toFixed(2)}`,
        product.description,
        getProductDetails(product)
      ]),
      startY: 35,
    })
    
    // Save the PDF
    doc.save('inventory-report.pdf')
  } catch (error) {
    console.error('Error generating inventory report:', error)
    throw error
  }
}

export const generateTransactionReport = async () => {
  try {
    const response = await fetch('http://localhost:5272/api/transactions', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch transaction data')
    
    const transactions = await response.json()
    
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Transaction History Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(11)
    doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 14, 30)
    
    // Add table
    autoTable(doc, {
      head: [['ID', 'Queue #', 'Customer', 'Amount', 'Status', 'Completed By', 'Date']],
      body: transactions.data.map((transaction: any) => [
        transaction.transactionId,
        transaction.queueNumber,
        transaction.order?.customerInfo.name || 'N/A',
        transaction.order ? `₱${transaction.order.total.toFixed(2)}` : 'N/A',
        transaction.status,
        transaction.completedBy,
        formatDate(transaction.completedAt)
      ]),
      startY: 35,
    })
    
    // Save the PDF
    doc.save('transaction-report.pdf')
  } catch (error) {
    console.error('Error generating transaction report:', error)
    throw error
  }
}

export const generateDailySalesReport = async () => {
  try {
    const response = await fetch('http://localhost:5272/api/reports/daily-sales', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch sales data')
    
    const salesData = await response.json()
    
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Daily Sales Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(11)
    doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 14, 30)
    
    // Add summary section
    doc.setFontSize(14)
    doc.text('Summary', 14, 45)
    doc.setFontSize(11)
    doc.text(`Total Sales: ₱${salesData.totalSales.toFixed(2)}`, 14, 55)
    doc.text(`Total Transactions: ${salesData.totalTransactions}`, 14, 62)
    doc.text(`Average Transaction Value: ₱${salesData.averageTransactionValue.toFixed(2)}`, 14, 69)
    
    // Add popular items table
    doc.setFontSize(14)
    doc.text('Popular Items', 14, 85)
    
    autoTable(doc, {
      head: [['Product', 'Quantity Sold', 'Total Revenue']],
      body: salesData.popularItems.map((item: any) => [
        item.name,
        item.quantitySold,
        `₱${item.revenue.toFixed(2)}`
      ]),
      startY: 90,
    })
    
    // Save the PDF
    doc.save('daily-sales-report.pdf')
  } catch (error) {
    console.error('Error generating daily sales report:', error)
    throw error
  }
}

// Helper function to format product details
const getProductDetails = (product: any) => {
  switch (product.type) {
    case 'books':
      return `Author: ${product.author}, Subject: ${product.subject}`
    case 'uniforms':
      return `Size: ${product.size}`
    case 'school_supplies':
      return `Type: ${product.schoolSupplyType}`
    default:
      return 'N/A'
  }
} 