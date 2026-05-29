import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../store/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { db } from '../db';
import { users, designers, orders } from '../db/schema';
import { Users, ShoppingBag, DollarSign, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDesigners: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userResults, designerResults, orderResults] = await Promise.all([
          db.select().from(users),
          db.select().from(designers),
          db.select().from(orders)
        ]);

        const revenue = orderResults.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          totalUsers: userResults.length,
          totalDesigners: designerResults.length,
          totalOrders: orderResults.length,
          totalRevenue: revenue
        });
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter">
              Admin <span className="text-primary-600">Panel</span>
            </h1>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary-600' },
              { label: 'Designers', value: stats.totalDesigners, icon: ShoppingBag, color: 'text-green-600' },
              { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600' },
              { label: 'Revenue', value: `KES ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase italic">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest">
                  View Shop
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest">
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;