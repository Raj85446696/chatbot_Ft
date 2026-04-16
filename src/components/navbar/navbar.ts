import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  @Input() isSidebarCollapsed: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private router: Router) {}

  userProfile = { name: '', email: '', role: '', avatar: '' };

  notifications = [
    { id: 1, title: 'New user registered', time: '5 min ago', read: false },
    { id: 2, title: 'System update completed', time: '1 hour ago', read: true }
  ];

  showNotifications = false;
  showProfileMenu = false;
  unreadNotificationsCount = this.notifications.filter(n => !n.read).length;

  ngOnInit(): void { this.loadUserProfile(); }

  loadUserProfile(): void {
    const storedProfile = localStorage.getItem('userProfile');
    if (!storedProfile) return;
    const data = JSON.parse(storedProfile);
    this.userProfile = {
      name: data.Fullname,
      email: data.Email,
      role: data.Role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.Fullname)}&background=1D4ED8&color=fff&size=80`
    };
  }

  onToggleSidebar() { this.toggleSidebar.emit(); }

  onLogout(): void { localStorage.clear(); this.router.navigate(['/login']); }

  markNotificationAsRead(id: number) {
    const n = this.notifications.find(n => n.id === id);
    if (n && !n.read) { n.read = true; this.unreadNotificationsCount--; }
  }

  clearAllNotifications() {
    this.notifications.forEach(n => n.read = true);
    this.unreadNotificationsCount = 0;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.notif-wrapper') && !target.closest('.profile-wrapper')) {
      this.showNotifications = false;
      this.showProfileMenu = false;
    }
  }
}
