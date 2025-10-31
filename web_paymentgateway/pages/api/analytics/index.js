import dbConnect from "@/Lib/mongodb";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === "GET") {
      // Ambil semua transaksi PAID
      const paidCheckouts = await Checkout.find({ status: "PAID" });

      // 1. TOP PRODUCTS - Hitung dari items yang dibeli
      const productStats = {};
      
      paidCheckouts.forEach(checkout => {
        if (checkout.items && checkout.items.length > 0) {
          checkout.items.forEach(item => {
            const productName = item.name;
            
            if (!productStats[productName]) {
              productStats[productName] = {
                name: productName,
                totalSold: 0,
                revenue: 0
              };
            }
            
            const qty = item.qty || item.quantity || 0;
            const price = item.price || 0;
            
            productStats[productName].totalSold += qty;
            productStats[productName].revenue += (price * qty);
          });
        }
      });

      // Sort by revenue (tertinggi dulu)
      const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // 2. DAILY REVENUE - 7 hari terakhir
      const dailyRevenue = [];
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayRevenue = paidCheckouts
          .filter(c => {
            const createdAt = new Date(c.createdAt);
            return createdAt >= date && createdAt < nextDate;
          })
          .reduce((sum, c) => sum + (c.amount || 0), 0);
        
        dailyRevenue.push({
          day: days[date.getDay()],
          amount: dayRevenue
        });
      }

      const weeklyTotal = dailyRevenue.reduce((sum, d) => sum + d.amount, 0);

      // 3. MONTHLY REVENUE - 10 bulan terakhir
      const monthlyRevenue = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 9; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const monthRevenue = paidCheckouts
          .filter(c => {
            const createdAt = new Date(c.createdAt);
            return createdAt.getMonth() === month && createdAt.getFullYear() === year;
          })
          .reduce((sum, c) => sum + (c.amount || 0), 0);
        
        monthlyRevenue.push({
          month: monthNames[month],
          amount: monthRevenue
        });
      }

      const yearlyTotal = monthlyRevenue.reduce((sum, m) => sum + m.amount, 0);

      // 4. CANCELLED/EXPIRED COUNT
      const allCheckouts = await Checkout.find({});
      const cancelledCount = allCheckouts.filter(c => 
        c.status === "CANCELLED" || c.status === "EXPIRED"
      ).length;

      // 5. NEW CUSTOMERS (unique emails bulan ini)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const uniqueEmails = new Set();
      allCheckouts
        .filter(c => {
          const createdAt = new Date(c.createdAt);
          return createdAt.getMonth() === currentMonth && 
                 createdAt.getFullYear() === currentYear;
        })
        .forEach(c => {
          const email = c.customer_info?.email || c.userEmail;
          if (email && email !== "customer@example.com") {
            uniqueEmails.add(email);
          }
        });

      const newCustomers = uniqueEmails.size;

      // 6. CONVERSION RATE
      const totalOrders = allCheckouts.length;
      const paidOrders = paidCheckouts.length;
      const conversionRate = totalOrders > 0 
        ? Math.round((paidOrders / totalOrders) * 100) 
        : 0;

      console.log("✅ Analytics API - Top Products:", topProducts);
      console.log("✅ Analytics API - Weekly Total:", weeklyTotal);

      return res.status(200).json({
        success: true,
        data: {
          topProducts,
          dailyRevenue,
          weeklyTotal,
          monthlyRevenue,
          yearlyTotal,
          cancelledCount,
          newCustomers,
          conversionRate,
          avgOrderTrend: "+12%"
        }
      });
    }

    return res.status(405).json({ 
      success: false, 
      message: "Method not allowed" 
    });
    
  } catch (error) {
    console.error("❌ Error in /api/analytics:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      data: {
        topProducts: [],
        dailyRevenue: [],
        weeklyTotal: 0,
        monthlyRevenue: [],
        yearlyTotal: 0,
        cancelledCount: 0,
        newCustomers: 0,
        conversionRate: 0
      }
    });
  }
}