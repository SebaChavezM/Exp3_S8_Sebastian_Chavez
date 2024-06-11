import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { ProductService, Product, Movimiento } from '../service/product.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-area-dashboard',
  templateUrl: './area-dashboard.component.html',
  styleUrls: ['./area-dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AreaDashboardComponent implements OnInit {
  products: Product[] = [];
  historial: Movimiento[] = [];
  selectedProductIndexToDelete: number = -1;
  selectedProductIndexToEdit: number = -1;
  selectedProduct: Product | null = null;
  selectedProductSalida: Product | null = null;
  newProduct: Product = {
    code: '',
    name: '',
    description: '',
    model: '',
    brand: '',
    material: '',
    color: '',
    family: '',
    value: 0,
    currency: '',
    unit: '',
    location: '',
    stock: 0
  };
  ingresoItems: any[] = [];
  salidaItems: any[] = [];
  cantidadIngreso: number = 1;
  cantidadSalida: number = 1;
  tipoDocumento: string = '';
  numeroDocumento: string = '';
  motivoSalida: string = '';
  registroNumeroIngreso: number = 0;
  registroNumeroSalida: number = 0;
  today: string = '';
  selectedMovimiento: Movimiento | null = null;
  selectedProductToEdit: Product = {
    code: '',
    name: '',
    description: '',
    model: '',
    brand: '',
    material: '',
    color: '',
    family: '',
    value: 0,
    currency: '',
    unit: '',
    location: '',
    stock: 0
  };

  productToDelete: Product | null = null;
  searchProductTerm: string = '';
  filteredProducts: Product[] = [];

  constructor(private productService: ProductService, private authService: AuthService) {}

  ngOnInit(): void {
    this.productService.products$.subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
    });
    this.productService.historial$.subscribe(historial => this.historial = historial);
    this.today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    this.registroNumeroIngreso = this.productService.getNextIngresoNumber();
    this.registroNumeroSalida = this.productService.getNextSalidaNumber();
  }

  productExists(code: string): boolean {
    return this.products.some(product => product.code === code);
  }

  onSearchProduct(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm) {
      this.filteredProducts = this.products.filter(product =>
        product.code.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredProducts = this.products;
    }
  }

  onViewProductInfo(index: number) {
    this.selectedProduct = this.products[index];
    const productInfoModal = new bootstrap.Modal(document.getElementById('productInfoModal')!);
    productInfoModal.show();
  }

  onEditProduct(index: number) {
    this.selectedProductIndexToEdit = index;
    this.selectedProductToEdit = { ...this.products[index] };
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal')!);
    editProductModal.show();
  }

  onAddProduct(form: NgForm) {
    if (form.valid) {
      if (!this.productExists(this.newProduct.code)) {
        this.productService.addProduct(this.newProduct);
        // Reset form
        form.resetForm();
        this.newProduct = {
          code: '',
          name: '',
          description: '',
          model: '',
          brand: '',
          material: '',
          color: '',
          family: '',
          value: 0,
          currency: '',
          unit: '',
          location: '',
          stock: 0
        };
      }
    }
  }

  onSaveEditProduct() {
    if (this.selectedProductToEdit && this.selectedProductIndexToEdit !== -1) {
      this.products[this.selectedProductIndexToEdit] = { ...this.selectedProductToEdit };
      this.productService.updateProduct(this.selectedProductIndexToEdit, this.selectedProductToEdit);
      this.selectedProductToEdit = {
        code: '',
        name: '',
        description: '',
        model: '',
        brand: '',
        material: '',
        color: '',
        family: '',
        value: 0,
        currency: '',
        unit: '',
        location: '',
        stock: 0
      };
      this.selectedProductIndexToEdit = -1;
      const editProductModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal')!);
      editProductModal?.hide();
    }
  }

  onDeleteProduct(index: number) {
    this.selectedProductIndexToDelete = index;
    this.productToDelete = this.products[index];
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal')!);
    confirmDeleteModal.show();
  }

  onConfirmDelete() {
    if (this.selectedProductIndexToDelete !== -1) {
      this.productService.deleteProduct(this.selectedProductIndexToDelete);
      this.selectedProductIndexToDelete = -1;
      this.productToDelete = null;
      const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')!);
      confirmDeleteModal?.hide();
    }
  }

  onAddProductoToIngreso() {
    const selectedProductCode = this.selectedProduct?.code;
    if (!selectedProductCode) return;

    const existingItem = this.ingresoItems.find(item => item.product.code === selectedProductCode);
    if (existingItem) {
      alert('El producto ya se encuentra en la tabla.');
      return;
    }

    const productToAdd = this.products.find(product => product.code === selectedProductCode);
    if (productToAdd) {
      this.ingresoItems.push({
        product: productToAdd,
        cantidad: this.cantidadIngreso
      });
      this.cantidadIngreso = 1;
    }
  }

  onEliminarItem(index: number) {
    this.ingresoItems.splice(index, 1);
  }

  onConfirmarIngreso() {
    this.ingresoItems.forEach(item => {
      const product = this.products.find(p => p.code === item.product.code);
      if (product) {
        product.stock += item.cantidad;
        this.productService.updateProduct(this.products.indexOf(product), product);
        this.productService.addMovimiento({
          tipo: 'Ingreso',
          numero: this.registroNumeroIngreso,
          fecha: this.today,
          detalles: `Ingreso de ${item.cantidad} unidades de ${product.name}`,
          items: this.ingresoItems.map(i => ({
            code: i.product.code,
            name: i.product.name,
            description: i.product.description,
            cantidad: i.cantidad
          })),
          usuario: `${this.authService.getCurrentUser().firstName} ${this.authService.getCurrentUser().lastName}`
        });
      }
    });
    this.ingresoItems = [];
    this.productService.incrementNextIngresoNumber();
    this.registroNumeroIngreso = this.productService.getNextIngresoNumber();

    const ingresoBodegaModalElement = document.getElementById('ingresoBodegaModal');
    if (ingresoBodegaModalElement) {
      const ingresoBodegaModal = bootstrap.Modal.getInstance(ingresoBodegaModalElement);
      if (ingresoBodegaModal) {
        ingresoBodegaModal.hide();
        setTimeout(() => ingresoBodegaModal.dispose(), 500);
      }
    }
  }

  onAddProductoToSalida() {
    const selectedProductCode = this.selectedProductSalida?.code;
    if (!selectedProductCode) return;

    const existingItem = this.salidaItems.find(item => item.product.code === selectedProductCode);
    if (existingItem) {
      alert('El producto ya se encuentra en la tabla.');
      return;
    }

    const productToAdd = this.products.find(product => product.code === selectedProductCode);
    if (productToAdd) {
      this.salidaItems.push({
        product: productToAdd,
        cantidad: this.cantidadSalida
      });
      this.cantidadSalida = 1;
    }
  }

  onEliminarItemSalida(index: number) {
    this.salidaItems.splice(index, 1);
  }

  onConfirmarSalida() {
    this.salidaItems.forEach(item => {
      const product = this.products.find(p => p.code === item.product.code);
      if (product) {
        product.stock -= item.cantidad;
        this.productService.updateProduct(this.products.indexOf(product), product);
        this.productService.addMovimiento({
          tipo: 'Salida',
          numero: this.registroNumeroSalida,
          fecha: this.today,
          documento: `${this.tipoDocumento} ${this.numeroDocumento}`,
          detalles: this.motivoSalida,
          items: this.salidaItems.map(i => ({
            code: i.product.code,
            name: i.product.name,
            description: i.product.description,
            cantidad: i.cantidad
          })),
          usuario: `${this.authService.getCurrentUser().firstName} ${this.authService.getCurrentUser().lastName}`
        });
      }
    });
    this.salidaItems = [];
    this.productService.incrementNextSalidaNumber();
    this.registroNumeroSalida = this.productService.getNextSalidaNumber();

    const salidaBodegaModalElement = document.getElementById('salidaBodegaModal');
    if (salidaBodegaModalElement) {
      const salidaBodegaModal = bootstrap.Modal.getInstance(salidaBodegaModalElement);
      if (salidaBodegaModal) {
        salidaBodegaModal.hide();
        setTimeout(() => salidaBodegaModal.dispose(), 500);
      }
    }
  }

  onAbrirHistorial(): void {
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }

  onVerDetallesMovimiento(movimiento: Movimiento) {
    this.selectedMovimiento = movimiento;
    const detalleMovimientoModal = new bootstrap.Modal(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal.show();
    const detalleHistorialModal = bootstrap.Modal.getInstance(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal?.hide();
  }

  onVolverHistorial(): void {
    const detalleMovimientoModal = bootstrap.Modal.getInstance(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal?.hide();
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }
}