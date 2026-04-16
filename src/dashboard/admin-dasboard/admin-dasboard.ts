import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Sidenavbar } from '../../components/sidenavbar/sidenavbar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dasboard',
  standalone: true,
  imports: [Navbar, Sidenavbar, CommonModule, RouterModule],
  templateUrl: './admin-dasboard.html',
  styleUrl: './admin-dasboard.css',
})
export class AdminDasboard {
  isSidebarCollapsed = false;
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  onMenuItemSelected(menuItemId: string) {
    console.log('Selected menu item:', menuItemId);
    // You can add logic here like:
    // - Track analytics
    // - Update page title
    // - Load specific data based on selection
    // - etc.
  }
}
