import { Component, OnInit } from '@angular/core';
import { BebidaService } from '../service/bebida.service.js';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../service/pedido.service.js';
import { Bebida,BebidaConCantidad } from '../models/mesa.models.js';

@Component({
  selector: 'app-carta-bebida',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './carta.bebida.component.html',
  styleUrls: ['./carta.bebida.component.scss']
})
export class CartaBebidaComponent implements OnInit {
  
  bebidas: any[] = [];
  searchTerm: string = '';
  selectedType: string = '';

  constructor(private bebidaService: BebidaService, private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.getBebidas();
  }

  getBebidas() {
    this.bebidaService.getBebidas().subscribe((response) => {
      if (response && response.data) {
        this.bebidas = response.data;
      } else {
        console.error("Estructura de datos inesperada", response);
      }
      console.log("Datos recibidos:", this.bebidas);
    });
  }

  get filteredBebidas() {
    return this.bebidas.filter(bebida =>
      bebida.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.selectedType === '' || bebida.alcohol === this.selectedType)
    );
  }

  onSearch(): void {
    console.log('Término de búsqueda:', this.searchTerm);
  }

  filterByType(type: string): void {
    this.selectedType = type;
    console.log('Tipo de bebida seleccionado:', this.selectedType);
  }

  resetFilter(): void {
    this.selectedType = '';
    console.log('Filtro de tipo de bebida restablecido. Mostrando todas las bebidas.');
  }

  agregarAlPedido(bebida: Bebida): void {
    const bebidaPedido: BebidaConCantidad = {
      codBebida: bebida.codBebida,
      descripcion: bebida.descripcion,
      stock:bebida.stock,
      unidadMedida: bebida.unidadMedida,
      contenido:bebida.contenido,
      precio: bebida.precio,
      alcohol:bebida.alcohol,
      imagen:bebida.imagen,
      proveedor:bebida.proveedor,
      cantidad:1,
    };
    this.pedidoService.agregarBebidaAlPedido(bebidaPedido);
    console.log('Bebida agregada al pedido:', bebidaPedido);
  }
}
