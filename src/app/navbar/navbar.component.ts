import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../service/notificacion.service';

/**
 * Componente de la barra de navegación.
 *
 * Este componente maneja la barra de navegación superior, la visibilidad del sidebar y 
 * la gestión de notificaciones, incluyendo funcionalidades específicas para roles de usuario.
 *
 * @export
 * @class NavbarComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  /** Cuenta de notificaciones pendientes. */
  pendingNotificationsCount: number = 0;
  /** Visibilidad del sidebar. */
  isSidebarVisible = true;
  /** Dropdown actualmente abierto. */
  currentOpenDropdown: string | null = null;

  /**
   * Constructor del componente NavbarComponent.
   * @param {AuthService} authService - Servicio de autenticación.
   * @param {Router} router - Servicio de enrutamiento.
   * @param {NotificationService} notificationService - Servicio de notificaciones.
   */
  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService 
  ) {}

  /**
   * Inicializa el componente y configura los suscriptores.
   * @returns {void}
   */
  ngOnInit(): void {
    this.notificationService.pendingCount$.subscribe(count => {
      this.pendingNotificationsCount = count;
    });

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  /**
   * Verifica el tamaño de la pantalla y ajusta la visibilidad del sidebar.
   * @returns {void}
   */
  checkScreenSize(): void {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      this.isSidebarVisible = false;
    } else {
      this.isSidebarVisible = true;
    }
  }

  /**
   * Alterna la visibilidad del sidebar.
   * @returns {void}
   */
  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (this.isSidebarVisible) {
        sidebar.classList.remove('show');
        this.isSidebarVisible = false;
      } else {
        sidebar.classList.add('show');
        this.isSidebarVisible = true;
      }
    }
  }

  /**
   * Redirige al usuario al dashboard correspondiente según su rol.
   * @returns {void}
   */
  goToDashboard(): void {
    const userRole = this.authService.getCurrentUserRole();
    switch (userRole) {
      case 'Admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'Área':
        this.router.navigate(['/area-dashboard']);
        break;
      case 'Bodega':
        this.router.navigate(['/bodega-dashboard']);
        break;
      case 'Auditor':
        this.router.navigate(['/auditor-dashboard']);
        break;
      default:
        this.router.navigate(['/default-dashboard']);
        break;
    }
  }

  /**
   * Cierra todos los dropdowns abiertos.
   * @returns {void}
   */
  closeAllDropdowns(): void {
    const dropdowns = document.querySelectorAll('.collapse.show');
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
    this.currentOpenDropdown = null;
  }

  /**
   * Cierra sesión y redirige al usuario a la página de inicio de sesión.
   * @returns {void}
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el rol del usuario está permitido.
   * @param {string[]} allowedRoles - Lista de roles permitidos.
   * @returns {boolean} Verdadero si el rol del usuario está permitido, falso en caso contrario.
   */
  isRoleAllowed(allowedRoles: string[]): boolean {
    return this.authService.isRoleAllowed(allowedRoles);
  }

  /**
   * Verifica si el usuario está en alguna página de dashboard.
   * @returns {boolean} Verdadero si el usuario está en una página de dashboard, falso en caso contrario.
   */
  isOnDashboard(): boolean {
    const currentUrl = this.router.url;
    return (
      currentUrl.includes('/admin-dashboard') ||
      currentUrl.includes('/area-dashboard') ||
      currentUrl.includes('/bodega-dashboard')
    );
  }

  /**
   * Navega a la página de inicio.
   * @returns {void}
   */
  navigateToHome(): void {
    this.router.navigate(['/inicio']);
  }

  /**
   * Verifica si el usuario está en la página de inicio de sesión.
   * @returns {boolean} Verdadero si el usuario está en la página de inicio de sesión, falso en caso contrario.
   */
  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  /**
   * Verifica si el usuario está en la página de inicio.
   * @returns {boolean} Verdadero si el usuario está en la página de inicio, falso en caso contrario.
   */
  isInicioPage(): boolean {
    return this.router.url === '/inicio';
  }

  /**
   * Alterna el estado de un dropdown (abierto/cerrado).
   * @param {string} dropdownId - ID del dropdown a alternar.
   * @returns {void}
   */
  toggleDropdown(dropdownId: string): void {
    if (this.currentOpenDropdown && this.currentOpenDropdown !== dropdownId) {
      const currentDropdown = document.getElementById(this.currentOpenDropdown);
      currentDropdown?.classList.remove('show');
    }
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      dropdown.classList.toggle('show');
      this.currentOpenDropdown = dropdown.classList.contains('show') ? dropdownId : null;
    }
  }
}
