import Sidebar from '@/components/dashboard/Sidebar';
import TopNavbar from '@/components/dashboard/TopNavbar';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import EmotionSummaryCards from '@/components/dashboard/EmotionSummaryCards';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import PlaceholderCharts from '@/components/dashboard/PlaceholderCharts';
import ProfileCard from '@/components/dashboard/ProfileCard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="md:ml-64">
        <TopNavbar title="Dashboard" />
        
        <main className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Card */}
            <WelcomeCard />

            {/* Emotion Summary Cards */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Current Emotions
              </h2>
              <EmotionSummaryCards />
            </div>

            {/* Statistics Cards */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Statistics
              </h2>
              <StatisticsCards />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Analytics
                </h2>
                <PlaceholderCharts />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Recent Activity
                </h2>
                <RecentActivity />
              </div>
            </div>

            {/* Profile Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ProfileCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
