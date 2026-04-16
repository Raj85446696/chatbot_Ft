import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: 'admin' | 'upload' | 'user' | 'system';
}

interface UploadStats {
  pdf: {
    total: number;
    today: number;
    lastWeek: number;
  };
  json: {
    total: number;
    today: number;
    lastWeek: number;
  };
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  today: Date = new Date();
  adminName = 'Admin';
  isRefreshing = false;

  // Admin Statistics
  adminStats = {
    total: 0,
    active: 0,
    inactive: 0,
    superAdmins: 0
  };

  // Upload Statistics
  uploadStats: UploadStats = {
    pdf: { total: 0, today: 0, lastWeek: 0 },
    json: { total: 0, today: 0, lastWeek: 0 }
  };

  // Chart Data
  uploadTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pdf: [12, 19, 8, 15, 12, 10, 18],
    json: [5, 8, 12, 6, 10, 7, 9]
  };

  // Recent Activities
  recentActivities: RecentActivity[] = [];

  // Quick Actions
  quickActions = [
    { label: 'Add Admin', icon: 'user-plus', color: 'primary', link: '/admin/manage/add' },
    { label: 'Upload Content', icon: 'upload-cloud', color: 'accent', link: '/admin/upload' },
    { label: 'View Analytics', icon: 'activity', color: 'success', link: '/admin/analytics' },
    { label: 'System Settings', icon: 'settings', color: 'warning', link: '/admin/settings' }
  ];

  ngOnInit(): void {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try { this.adminName = JSON.parse(profile).Fullname || 'Admin'; } catch {}
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Admin statistics
    this.adminStats = {
      total: 15,
      active: 12,
      inactive: 3,
      superAdmins: 2
    };

    // Upload statistics
    this.uploadStats = {
      pdf: { total: 324, today: 12, lastWeek: 87 },
      json: { total: 156, today: 8, lastWeek: 45 }
    };

    // Recent activities
    this.recentActivities = [
      { id: 1, user: 'John Doe', action: 'uploaded a PDF document', time: '10 min ago', type: 'upload' },
      { id: 2, user: 'System', action: 'created new admin account', time: '25 min ago', type: 'admin' },
      { id: 3, user: 'Jane Smith', action: 'modified user permissions', time: '1 hour ago', type: 'user' },
      { id: 4, user: 'Auto Sync', action: 'processed JSON data', time: '2 hours ago', type: 'system' }
    ];
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      admin: 'user-plus',
      upload: 'upload-cloud',
      user: 'user-cog',
      system: 'refresh-cw'
    };
    return icons[type] || 'bell';
  }

  getActionDescription(action: string): string {
    const descriptions: Record<string, string> = {
      'Add Admin': 'Create new administrator account',
      'Upload Content': 'Upload PDF, JSON or other files',
      'View Analytics': 'View detailed performance metrics',
      'System Settings': 'Configure system preferences'
    };
    return descriptions[action] || 'Perform this action';
  }

  handleQuickAction(action: any): void {
    console.log('Action:', action.label);
    if (action.link) {
      // this.router.navigate([action.link]);
    }
  }

  refreshData(): void {
    this.isRefreshing = true;
    this.today = new Date();
    this.loadDashboardData();
    setTimeout(() => this.isRefreshing = false, 800);
  }

  generateReport(): void {
    console.log('Generating report...');
  }

  getBarHeightPct(value: number): number {
    const max = 20;
    return Math.round((value / max) * 100);
  }
}
