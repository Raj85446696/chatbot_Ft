import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidenavbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidenavbar.html',
  styleUrl: './sidenavbar.css',
})
export class Sidenavbar implements OnInit {
  @Input() isCollapsed: boolean = false;
  @Output() menuItemSelected = new EventEmitter<string>();

  activeMenuItem: string = 'dashboard';
  userRole: string | null = null;

  private allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard',        icon: 'layout-dashboard', route: '/dashboard' },
    { id: 'admin',     label: 'Admin Management', icon: 'users',            route: '/dashboard/listadmin', badge: 5 },
    { id: 'upload',    label: 'Upload Content',   icon: 'upload-cloud',     route: '/dashboard/upload' }
  ];

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role');
    this.setMenuByRole();
  }

  private setMenuByRole(): void {
    if (this.userRole === 'super_admin') {
      this.menuItems = [...this.allMenuItems];
    } else if (this.userRole === 'admin') {
      this.menuItems = this.allMenuItems.filter(item => item.id === 'upload');
      this.activeMenuItem = 'upload';
    } else {
      this.menuItems = [];
    }
  }

  onMenuItemClick(itemId: string): void {
    this.activeMenuItem = itemId;
    this.menuItemSelected.emit(itemId);
  }
}
