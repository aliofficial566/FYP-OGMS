import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import Toast from '../components/Toast';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Reports = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Report Data States
    const [salesSummary, setSalesSummary] = useState({ total_orders: 0, total_revenue: 0, total_items_sold: 0 });
    const [salesTrend, setSalesTrend] = useState([]);
    const [orderStatus, setOrderStatus] = useState({});
    const [topProducts, setTopProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [categoryPerformance, setCategoryPerformance] = useState([]);

    // Export Modal States
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedReportType, setSelectedReportType] = useState('sales');
    const [exportDateRange, setExportDateRange] = useState('7days');
    const [isConfirming, setIsConfirming] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState('excel');

    const salesChartRef = useRef(null);
    const orderChartRef = useRef(null);
    const categoryChartRef = useRef(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || user?.role !== 'admin') {
            navigate('/');
            return;
        }
        setAdmin(user);
        
        // Only fetch if it's a preset or a complete custom range
        if (dateRange !== 'custom' || (customStartDate && customEndDate)) {
            fetchAllReports();
        }
    }, [navigate, token, dateRange, customStartDate, customEndDate]);

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const baseUrl = 'http://localhost:5000/api/reports';

            let trendUrl = `/sales-trend?range=${dateRange}`;
            if (dateRange === 'custom' && customStartDate && customEndDate) {
                trendUrl += `&start_date=${customStartDate}&end_date=${customEndDate}`;
            }

            const endpoints = [
                { key: 'summary', url: '/sales-summary', setter: setSalesSummary },
                { key: 'trend', url: trendUrl, setter: setSalesTrend },
                { key: 'status', url: '/order-status', setter: setOrderStatus },
                { key: 'top', url: '/top-products', setter: setTopProducts },
                { key: 'stock', url: '/low-stock', setter: setLowStock },
                { key: 'catPerf', url: '/category-performance', setter: setCategoryPerformance }
            ];

            await Promise.all(endpoints.map(async (ep) => {
                try {
                    const res = await axios.get(`${baseUrl}${ep.url}`, config);
                    ep.setter(res.data);
                } catch (err) {
                    console.error(`Error loading ${ep.key}:`, err);
                }
            }));

        } catch (error) {
            console.error('General reporting error:', error);
            showToast('error', 'Warning', 'Some analytical data could not be fully loaded');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, title, message) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    // Process Trend Data to fill in missing gaps for a continuous timeline
    const processedTrendData = useMemo(() => {
        if (!salesTrend) return [];
        
        const now = new Date();
        let labels = [];
        let dataMap = {};

        // Fill dataMap with existing data
        salesTrend.forEach(item => {
            dataMap[item.date] = item.total_revenue;
        });

        if (dateRange === '7days' || dateRange === '30days') {
            const days = dateRange === '7days' ? 7 : 30;
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                labels.push(dateStr);
            }
        } else if (dateRange === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            // Limit to avoid infinite loops or massive datasets
            let current = new Date(start);
            while (current <= end) {
                labels.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
                if (labels.length > 366) break; // Hard limit 1 year for performance
            }
        } else if (dateRange === 'month') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(now.getFullYear(), now.getMonth(), i);
                const dateStr = d.toISOString().split('T')[0];
                labels.push(dateStr);
            }
        } else if (dateRange === 'year') {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 0; i < 12; i++) {
                const monthStr = `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
                labels.push(monthStr); // API returns YYYY-MM
            }
        }

        return labels.map(label => ({
            date: label,
            revenue: dataMap[label] || 0
        }));
    }, [salesTrend, dateRange]);

    // Chart Configurations
    const salesTrendChartData = {
        labels: processedTrendData.map(d => d.date),
        datasets: [{
            label: 'Revenue (Rs.)',
            data: processedTrendData.map(d => d.revenue),
            fill: true,
            borderColor: '#10b981',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                return gradient;
            },
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: (ctx) => {
                // Only show points if there's data or it's a small set
                return dateRange === '7days' ? 5 : 2;
            },
            pointHoverRadius: 6,
            borderWidth: 3
        }]
    };

    const orderStatusChartData = {
        labels: Object.keys(orderStatus),
        datasets: [{
            data: Object.values(orderStatus),
            backgroundColor: [
                '#f59e0b', // Pending
                '#3b82f6', // Processing
                '#a855f7', // Shipped
                '#10b981', // Delivered
                '#ef4444'  // Cancelled
            ],
            borderWidth: 0
        }]
    };

    const categoryChartData = {
        labels: categoryPerformance.map(c => c.category_name),
        datasets: [{
            label: 'Sales by Category',
            data: categoryPerformance.map(c => c.total_sales),
            backgroundColor: '#10b981',
            borderRadius: 8
        }]
    };

    const handleFinalExport = async () => {
        setIsExporting(true);
        try {
            let filename = `${selectedReportType}_Report_${new Date().toISOString().split('T')[0]}`;
            
            if (exportFormat === 'excel') {
                let worksheetData = [];
                let sheetName = "Report";

                if (selectedReportType === 'sales') {
                    worksheetData = salesTrend.map(item => ({
                        'Date': item.date,
                        'Orders': item.total_orders,
                        'Revenue (Rs.)': item.total_revenue,
                        'Items Sold': item.total_items_sold || 0
                    }));
                    sheetName = "Sales Report";
                } 
                else if (selectedReportType === 'low_stock') {
                    worksheetData = lowStock.map(p => ({
                        'Product ID': `#PROD-${p.product_id}`,
                        'Product Name': p.name,
                        'Current Stock': p.stock_qty,
                        'Status': p.stock_qty <= 2 ? 'CRITICAL' : 'LOW STOCK'
                    }));
                    sheetName = "Low Stock Report";
                } 
                else if (selectedReportType === 'inventory') {
                    worksheetData = lowStock.map(p => ({
                        'Product ID': `#PROD-${p.product_id}`,
                        'Product Name': p.name,
                        'Current Stock': p.stock_qty,
                        'Price': p.price || 'N/A'
                    }));
                    sheetName = "Full Inventory Report";
                }

                const ws = XLSX.utils.json_to_sheet(worksheetData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
                XLSX.writeFile(wb, `${filename}.xlsx`);
            } else {
                // PDF Generation
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                
                // Add a Header Banner
                pdf.setFillColor(16, 185, 129); // Green theme
                pdf.rect(0, 0, pageWidth, 40, 'F');
                
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(22);
                pdf.setFont('helvetica', 'bold');
                pdf.text("Store Analytics Report", 15, 25);
                
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 33);
                
                // Add Content Title
                pdf.setTextColor(33, 37, 41);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${selectedReportType.toUpperCase()} Report Overview`, 15, 55);
                
                let yOffset = 65;

                // 1. Add KPI Summary (only for sales report)
                if (selectedReportType === 'sales') {
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text("Key Metrics:", 15, yOffset);
                    
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(`Total Revenue: Rs. ${Number(salesSummary.total_revenue).toLocaleString()}`, 20, yOffset + 7);
                    pdf.text(`Total Orders: ${salesSummary.total_orders}`, 20, yOffset + 14);
                    pdf.text(`Items Sold: ${salesSummary.total_items_sold || 0}`, 20, yOffset + 21);
                    
                    yOffset += 35;
                }
                
                // 2. Add Sales Trend Chart if it exists and is selected
                if (selectedReportType === 'sales' && salesChartRef.current) {
                    try {
                        const salesImg = salesChartRef.current.toBase64Image();
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text("Sales Trend Analysis", 15, yOffset);
                        pdf.addImage(salesImg, 'PNG', 15, yOffset + 5, 180, 90);
                        yOffset += 105;
                    } catch (e) {
                        console.error("Error adding sales chart to PDF:", e);
                    }
                }
                
                // 3. Add Order Distribution Chart
                if (selectedReportType === 'sales' && orderChartRef.current) {
                    try {
                        // Check if we need a new page
                        if (yOffset > 150) { pdf.addPage(); yOffset = 20; }
                        
                        const orderImg = orderChartRef.current.toBase64Image();
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text("Order Status Distribution", 15, yOffset);
                        pdf.addImage(orderImg, 'PNG', 15, yOffset + 5, 180, 90);
                        yOffset += 105;
                    } catch (e) {
                        console.error("Error adding order chart to PDF:", e);
                    }
                }

                // 4. Add Top Products Table (only for sales report)
                if (selectedReportType === 'sales' && topProducts.length > 0) {
                    if (yOffset > 200) { pdf.addPage(); yOffset = 20; }
                    
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text("Top Performing Products", 15, yOffset);
                    
                    let tableY = yOffset + 10;
                    
                    // Table Header
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(15, tableY - 5, 180, 8, 'F');
                    pdf.setFontSize(10);
                    pdf.text("Product Name", 20, tableY);
                    pdf.text("Units Sold", 150, tableY);
                    
                    tableY += 10;
                    
                    // Table Rows
                    topProducts.slice(0, 5).forEach(p => {
                        if (tableY > 280) { pdf.addPage(); tableY = 20; }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(p.product_name, 20, tableY);
                        pdf.text(`${p.total_sold} Units`, 150, tableY);
                        tableY += 10;
                    });
                    
                    yOffset = tableY + 10;
                }
                
                // 5. Add Low Stock List if it's Inventory/Low Stock
                if (selectedReportType === 'low_stock' || selectedReportType === 'inventory') {
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text("Product List", 15, yOffset);
                    
                    let textY = yOffset + 15;
                    lowStock.forEach(p => {
                        if (textY > 280) { pdf.addPage(); textY = 20; }
                        pdf.setFontSize(10);
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`#PROD-${p.product_id} - ${p.name} (Stock: ${p.stock_qty})`, 15, textY);
                        textY += 10;
                    });
                }
                
                pdf.save(`${filename}.pdf`);
            }
            
            showToast('success', 'Export Successful', 'Your report has been downloaded.');
            setShowExportModal(false);
        } catch (error) {
            console.error('Export error:', error);
            showToast('error', 'Export Failed', 'An error occurred while generating the report.');
        } finally {
            setIsExporting(false);
        }
    };

    if (loading && !salesTrend.length) {
        return (
            <div className="admin-dashboard-container">
                <AdminSidebar />
                <main className="admin-main-content">
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="spinner-border text-success" role="status"></div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
            <AdminSidebar />
            <main className="admin-main-content">
                <AdminHeader admin={admin} onLogout={handleLogout} />

                <div className="p-5">
                    {/* Header Section */}
                    <div className="d-flex justify-content-between align-items-end mb-5 animate-fade">
                        <div>
                            <h2 className="fw-semibold text-dark mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-0.05em' }}>Reports & Analytics</h2>
                            <p className="text-muted fw-semibold mb-0">Deep dive into your store performance and inventory health.</p>
                        </div>
                        <div className="d-flex gap-3">
                            <div className="position-relative">
                                <select 
                                    className="form-select border-0 shadow-sm rounded-4 px-4 fw-bold" 
                                    style={{ height: '54px', backgroundColor: '#ecfdf5', color: '#10b981', width: '200px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: 'none' }}
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                >
                                    <option value="7days">Last 7 Days</option>
                                    <option value="30days">Last 30 Days</option>
                                    <option value="month">Current Month</option>
                                    <option value="year">Current Year</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                                <span className="material-symbols-outlined position-absolute" style={{ right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', pointerEvents: 'none', fontSize: '24px' }}>expand_more</span>
                            </div>

                            {dateRange === 'custom' && (
                                <div className="d-flex gap-2 animate-fade">
                                    <input 
                                        type="date" 
                                        className="form-control border-0 shadow-sm rounded-4 px-3 fw-bold"
                                        style={{ height: '54px', width: '160px' }}
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                    />
                                    <input 
                                        type="date" 
                                        className="form-control border-0 shadow-sm rounded-4 px-3 fw-bold"
                                        style={{ height: '54px', width: '160px' }}
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                    />
                                </div>
                            )}
                            <button 
                                onClick={() => {
                                    setShowExportModal(true);
                                    setIsConfirming(false);
                                }}
                                className="btn btn-dark px-4 rounded-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                                style={{ height: '54px' }}
                            >
                                <span className="material-symbols-outlined">download</span>
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="row g-4 mb-5">
                        {[
                            { label: 'Total Revenue', value: `Rs. ${Number(salesSummary.total_revenue).toLocaleString()}`, icon: 'payments', color: '#10b981', bg: '#f0fdf4' },
                            { label: 'Total Orders', value: salesSummary.total_orders, icon: 'shopping_bag', color: '#3b82f6', bg: '#eff6ff' },
                            { label: 'Items Sold', value: salesSummary.total_items_sold || 0, icon: 'inventory_2', color: '#a855f7', bg: '#faf5ff' },
                            { label: 'Low Stock Items', value: lowStock.length, icon: 'warning', color: '#ef4444', bg: '#fef2f2' }
                        ].map((stat, i) => (
                            <div className="col-md-3 animate-fade" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="stat-card h-100">
                                    <div className="rounded-4 p-3 d-inline-flex mb-3" style={{ background: stat.bg, color: stat.color }}>
                                        <span className="material-symbols-outlined fs-4">{stat.icon}</span>
                                    </div>
                                    <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ letterSpacing: '0.05em' }}>{stat.label}</div>
                                    <div className="stat-value" style={{ fontSize: '1.75rem', marginTop: 0 }}>{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-4 mb-5">
                        {/* Sales Trend */}
                        <div className="col-lg-8">
                            <div className="stat-card p-5 h-100 animate-fade" style={{ animationDelay: '0.4s' }}>
                                <div className="d-flex justify-content-between align-items-center mb-5">
                                    <div>
                                        <h4 className="fw-semibold text-dark mb-0">Sales Trend</h4>
                                        <p className="text-muted small fw-bold mb-0">
                                            Revenue growth over the {
                                                dateRange === '7days' ? 'last 7 days' :
                                                dateRange === '30days' ? 'last 30 days' :
                                                dateRange === 'month' ? 'current month' :
                                                dateRange === 'year' ? 'current year' :
                                                dateRange === 'custom' ? `period ${customStartDate} to ${customEndDate}` : 'selected period'
                                            }
                                        </p>
                                    </div>
                                    <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-bold">Live Growth</span>
                                </div>
                                <div style={{ height: '350px' }}>
                                    <Line 
                                        ref={salesChartRef}
                                        data={salesTrendChartData} 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { 
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#1f2937',
                                                    titleFont: { size: 14, weight: 'bold' },
                                                    bodyFont: { size: 13 },
                                                    padding: 15,
                                                    displayColors: false,
                                                    callbacks: {
                                                        label: (context) => `Revenue: Rs. ${context.parsed.y.toLocaleString()}`
                                                    }
                                                }
                                            },
                                            scales: {
                                                y: { 
                                                    grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
                                                    ticks: { 
                                                        font: { weight: 'bold' },
                                                        callback: (value) => value >= 1000 ? (value / 1000) + 'k' : value
                                                    } 
                                                },
                                                x: { 
                                                    grid: { display: false }, 
                                                    ticks: { 
                                                        font: { weight: 'bold' },
                                                        maxRotation: 0,
                                                        autoSkip: true,
                                                        maxTicksLimit: dateRange === '30days' ? 10 : 7
                                                    } 
                                                }
                                            }
                                        }} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Status Pie */}
                        <div className="col-lg-4">
                            <div className="stat-card p-5 h-100 animate-fade" style={{ animationDelay: '0.5s' }}>
                                <h4 className="fw-semibold text-dark mb-5">Order Distribution</h4>
                                <div style={{ height: '300px' }} className="d-flex justify-content-center">
                                    <Pie 
                                        ref={orderChartRef}
                                        data={orderStatusChartData}
                                        options={{
                                            plugins: { 
                                                legend: { 
                                                    position: 'bottom',
                                                    labels: { font: { weight: 'bold', size: 12 }, padding: 20, usePointStyle: true } 
                                                } 
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 mb-5">
                        {/* Category Performance */}
                        <div className="col-lg-6">
                            <div className="stat-card p-5 h-100 animate-fade" style={{ animationDelay: '0.6s' }}>
                                <h4 className="fw-semibold text-dark mb-5">Sales by Category</h4>
                                <div style={{ height: '300px' }}>
                                    <Bar 
                                        ref={categoryChartRef}
                                        data={categoryChartData}
                                        options={{
                                            indexAxis: 'y',
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
                                                y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="col-lg-6">
                            <div className="stat-card p-5 h-100 animate-fade" style={{ animationDelay: '0.7s' }}>
                                <h4 className="fw-semibold text-dark mb-4">Top Performing Products</h4>
                                <div className="table-responsive">
                                    <table className="table align-middle">
                                        <thead>
                                            <tr>
                                                <th className="border-0 text-muted small fw-semibold">PRODUCT NAME</th>
                                                <th className="border-0 text-muted small fw-semibold text-end">UNITS SOLD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map((p, i) => (
                                                <tr key={i}>
                                                    <td className="border-0 py-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-3 bg-light d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: 12 }}>{i + 1}</div>
                                                            <span className="fw-bold text-dark">{p.product_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="border-0 py-3 text-end fw-semibold text-success">{p.total_sold} Units</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Table */}
                    <div className="stat-card p-0 overflow-hidden animate-fade" style={{ animationDelay: '0.8s' }}>
                        <div className="p-5 bg-light bg-opacity-50 border-bottom d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="fw-semibold text-dark mb-1">Inventory Health Alert</h4>
                                <p className="text-muted small fw-bold mb-0">Products requiring immediate restocking action</p>
                            </div>
                            <span className="material-symbols-outlined text-danger fs-1">inventory_2</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="ps-5 py-4 border-0 text-muted small fw-semibold">PRODUCT ID</th>
                                        <th className="py-4 border-0 text-muted small fw-semibold">PRODUCT NAME</th>
                                        <th className="py-4 border-0 text-muted small fw-semibold">CURRENT STOCK</th>
                                        <th className="py-4 border-0 text-muted small fw-semibold">STATUS</th>
                                        <th className="pe-5 py-4 border-0 text-muted small fw-semibold text-end">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStock.length > 0 ? lowStock.map((p) => (
                                        <tr key={p.product_id}>
                                            <td className="ps-5 py-4 fw-bold text-muted">#PROD-{p.product_id}</td>
                                            <td className="py-4 fw-semibold text-dark">{p.name}</td>
                                            <td className="py-4 fw-semibold" style={{ color: p.stock_qty <= 2 ? '#ef4444' : '#f59e0b' }}>{p.stock_qty} Items Left</td>
                                            <td className="py-4">
                                                <span className={`badge px-3 py-2 rounded-pill fw-semibold ${p.stock_qty <= 2 ? 'bg-danger' : 'bg-warning'} bg-opacity-10`} style={{ color: p.stock_qty <= 2 ? '#ef4444' : '#f59e0b', fontSize: '11px' }}>
                                                    {p.stock_qty <= 2 ? 'CRITICAL' : 'LOW STOCK'}
                                                </span>
                                            </td>
                                            <td className="pe-5 py-4 text-end">
                                                <button 
                                                    className="btn btn-sm btn-light rounded-3 fw-bold px-3"
                                                    onClick={() => navigate('/admin/products')}
                                                >
                                                    Restock
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted fw-bold">Inventory is healthy. All products are well stocked.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Export Report Modal */}
                {showExportModal && (
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        width: '100vw', 
                        height: '100vh', 
                        backgroundColor: 'rgba(0,0,0,0.75)', 
                        zIndex: 2000, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <div style={{ 
                            backgroundColor: '#ffffff', 
                            borderRadius: '20px', 
                            padding: '30px', 
                            width: '90%', 
                            maxWidth: '500px', 
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            position: 'relative'
                        }}>
                            {/* Header */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold text-dark mb-0">{isConfirming ? 'Confirm Download' : 'Export Report'}</h4>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowExportModal(false)}
                                    style={{ cursor: 'pointer' }}
                                ></button>
                            </div>

                            {/* Body */}
                            {!isConfirming ? (
                                <div>
                                    <div className="mb-4">
                                        <label className="text-muted small fw-semibold text-uppercase mb-2 d-block">Report Type</label>
                                        <select 
                                            className="form-select border-0 shadow-sm rounded-3 px-3 fw-bold" 
                                            style={{ height: '50px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                                            value={selectedReportType}
                                            onChange={(e) => setSelectedReportType(e.target.value)}
                                        >
                                            <option value="sales">Sales Report</option>
                                            <option value="inventory">Inventory Report</option>
                                            <option value="low_stock">Low Stock Report</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-muted small fw-semibold text-uppercase mb-2 d-block">Export Format</label>
                                        <select 
                                            className="form-select border-0 shadow-sm rounded-3 px-3 fw-bold" 
                                            style={{ height: '50px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                                            value={exportFormat}
                                            onChange={(e) => setExportFormat(e.target.value)}
                                        >
                                            <option value="excel">Excel Sheet (.xlsx)</option>
                                            <option value="pdf">PDF Document (.pdf)</option>
                                        </select>
                                    </div>

                                    {selectedReportType !== 'inventory' && (
                                        <div className="mb-4">
                                            <label className="text-muted small fw-semibold text-uppercase mb-2 d-block">Duration</label>
                                            <select 
                                                className="form-select border-0 shadow-sm rounded-3 px-3 fw-bold" 
                                                style={{ height: '50px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                                                value={exportDateRange}
                                                onChange={(e) => setExportDateRange(e.target.value)}
                                            >
                                                <option value="7days">Last 7 Days</option>
                                                <option value="30days">Last 30 Days</option>
                                                <option value="month">Current Month</option>
                                                <option value="year">Current Year</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <div className="rounded-circle p-3 d-inline-flex mb-3" style={{ background: '#e6f4ea', color: '#10b981' }}>
                                        <span className="material-symbols-outlined fs-1">file_download</span>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-2">Ready to Download?</h5>
                                    <p className="text-muted fw-semibold mb-4">
                                        You are about to download the <span className="text-success fw-bold">{selectedReportType.replace('_', ' ').toUpperCase()}</span> for 
                                        {selectedReportType !== 'inventory' ? ` the ${exportDateRange}` : ' the current inventory'}.
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="d-flex justify-content-end gap-2">
                                {!isConfirming ? (
                                    <>
                                        <button type="button" className="btn btn-light rounded-3 fw-bold px-4" style={{ height: '45px' }} onClick={() => setShowExportModal(false)}>Cancel</button>
                                        <button 
                                            type="button" 
                                            className="btn btn-dark rounded-3 fw-bold px-4" 
                                            style={{ height: '45px' }}
                                            onClick={() => setIsConfirming(true)}
                                        >
                                            Next
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" className="btn btn-light rounded-3 fw-bold px-4" style={{ height: '45px' }} onClick={() => setIsConfirming(false)}>Back</button>
                                        <button 
                                            type="button" 
                                            className="btn btn-success rounded-3 fw-bold px-4 text-white" 
                                            style={{ height: '45px', backgroundColor: '#10b981' }}
                                            onClick={handleFinalExport}
                                            disabled={isExporting}
                                        >
                                            {isExporting ? 'Processing...' : 'Yes, Download Now'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Reports;
