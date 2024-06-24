import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../service/notificacion.service';

/**
 * Componente de la barra de navegación.
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
  /**
   * Número de notificaciones pendientes.
   *
   * @type {number}
   * @memberof NavbarComponent
   */
  pendingNotificationsCount: number = 0;

  /**
   * Estado del sidebar (colapsado o no).
   *
   * @type {boolean}
   * @memberof NavbarComponent
   */
  isSidebarCollapsed = false;

  /**
   * ID del dropdown actualmente abierto.
   *
   * @type {(string | null)}
   * @memberof NavbarComponent
   */
  currentOpenDropdown: string | null = null;

  /**
   * Crea una instancia de NavbarComponent.
   * 
   * @param {AuthService} authService Servicio de autenticación.
   * @param {Router} router Servicio de navegación.
   * @param {NotificationService} notificationService Servicio de notificaciones.
   * @memberof NavbarComponent
   */
  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService 
  ) {}

  /**
   * Inicializa el componente y configura las suscripciones necesarias.
   *
   * @memberof NavbarComponent
   */
  ngOnInit(): void {
    this.notificationService.pendingCount$.subscribe(count => {
      this.pendingNotificationsCount = count;
    });

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  /**
   * Verifica el tamaño de la pantalla para determinar si el sidebar debe estar colapsado.
   *
   * @memberof NavbarComponent
   */
  checkScreenSize(): void {
    const screenWidth = window.innerWidth;
    this.isSidebarCollapsed = screenWidth <= 768;
  }

  /**
   * Alterna el estado del sidebar entre colapsado y expandido.
   *
   * @memberof NavbarComponent
   */
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    const sidebar = document.getElementById('sidebar');
    if (this.isSidebarCollapsed) {
      sidebar?.classList.add('show');
    } else {
      sidebar?.classList.remove('show');
    }
  }

  /**
   * Cierra la sesión del usuario y lo redirige a la página de inicio de sesión.
   *
   * @memberof NavbarComponent
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el rol del usuario está permitido.
   *
   * @param {string[]} allowedRoles Roles permitidos.
   * @returns {boolean} True si el rol está permitido, de lo contrario false.
   * @memberof NavbarComponent
   */
  isRoleAllowed(allowedRoles: string[]): boolean {
    return this.authService.isRoleAllowed(allowedRoles);
  }

  /**
   * Verifica si la URL actual corresponde a un dashboard.
   *
   * @returns {boolean} True si la URL actual es de un dashboard, de lo contrario false.
   * @memberof NavbarComponent
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
   * Navega a la página principal según el rol del usuario.
   *
   * @memberof NavbarComponent
   */
  navigateToHome(): void {
    const role = this.authService.getCurrentUser()?.role;
    let route = '';
    switch (role) {
      case 'Admin':
        route = '/admin-dashboard';
        break;
      case 'Área':
        route = '/area-dashboard';
        break;
      case 'Auditor':
        route = '/auditor-dashboard';
        break;
      case 'Bodega':
        route = '/bodega-dashboard';
        break;
      default:
        route = '/';
        break;
    }
    this.router.navigate([route]);
  }

  /**
   * Verifica si la URL actual es la página de inicio de sesión.
   *
   * @returns {boolean} True si la URL actual es la página de inicio de sesión, de lo contrario false.
   * @memberof NavbarComponent
   */
  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  /**
   * Alterna la visibilidad de un dropdown.
   *
   * @param {string} dropdownId ID del dropdown a alternar.
   * @memberof NavbarComponent
   */
  toggleDropdown(dropdownId: string): void {
    if (this.currentOpenDropdown && this.currentOpenDropdown !== dropdownId) {
      const currentDropdown = document.getElementById(this.currentOpenDropdown);
      currentDropdown?.classList.remove('show');
    }

    const dropdown = document.getElementById(dropdownId);
    dropdown?.classList.toggle('show');
    
    this.currentOpenDropdown = dropdownId;
  }
}
