import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Ingrediente, ResponseIngredientes } from '../../models/mesa.models.js';
import { Subject } from 'rxjs';
import { IngredienteService } from '../../service/ingrediente.service.js';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ingrediente-lista',
  standalone: true,
  imports: [CommonModule,HttpClientModule, FormsModule],
  templateUrl: './ingrediente-lista.component.html',
  styleUrl: './ingrediente-lista.component.scss'
})
export class IngredienteListaComponent implements OnInit, OnDestroy {
  ingredientes: Ingrediente[] = [];
  searchTerm: string = '';
  private destroy$ = new Subject<void>();

  constructor(private ingredienteService: IngredienteService) {}

  ngOnInit(): void {
    this.getProveedores();
  }

  getProveedores() {
    this.ingredienteService.getIngredientes().pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (response: ResponseIngredientes) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.ingredientes = response.data; 
        } else {
          console.error("La respuesta no contiene 'data' o no es un array", response);
        }
      },
      (error) => {
        console.error("Error al obtener los proveedores:", error);
      }
    );
  }

  get filteredIngredientes() {
    return this.ingredientes.filter(ingrediente =>
      ingrediente.descIngre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

    onSearch(): void {
    console.log('Término de búsqueda:', this.searchTerm);
  }

    toggleDetalles(ingrediente: any): void {
    ingrediente.mostrarDetalles = !ingrediente.mostrarDetalles;
  }

  ngOnDestroy(): void {
    this.destroy$.next();  
    this.destroy$.complete();  
  }
}