import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../service/pedido.service.js';
import { PlatoConCantidad, BebidaConCantidad, PlatoPedido, BebidaPedido } from '../../models/mesa.models.js';
import { CommonModule } from '@angular/common';
import { TarjetaService } from '../../service/tarjeta.service.js';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido-modificar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-modificar.component.html',
  styleUrls: ['./pedido-modificar.component.scss']
})
export class PedidoModificarComponent implements OnInit {
  pedidoPlatos: PlatoConCantidad[] = [];
  pedidoBebidas: BebidaConCantidad[] = [];
  tarjetasCliente: any[] = [];
  tarjetaSeleccionada: any | undefined;
  filteredTarjetas: any[] = [];
  mensaje: string | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private pedidoService: PedidoService,
    private tarjetaService: TarjetaService) {}
    
ngOnInit(): void {
  this.pedidoService.obtenerPedidoEnCurso().subscribe(
    (pedidoId) => {
      if (pedidoId) {
        this.pedidoService.obtenerPlatosBebidasPorPedido(pedidoId).subscribe(
          (response) => {
            this.pedidoPlatos = response.platos && response.platos.length > 0 ? response.platos.map(plato => ({ ...plato, cantidad: plato.cantidad || 1 })) : [];
            this.pedidoBebidas = response.bebidas && response.bebidas.length > 0 ? response.bebidas.map(bebida => ({ ...bebida, cantidad: bebida.cantidad || 1 })) : [];

            if (this.pedidoPlatos.length === 0 && this.pedidoBebidas.length === 0) {
              this.mensaje = 'No se han encontrado platos ni bebidas para el pedido en curso.';
            } else {
              this.mensaje = '';
            }
          },
          (error) => {
            console.error('Error al obtener los platos y bebidas del pedido', error);
            this.mensaje = 'Error al obtener los platos y bebidas del pedido. Intenta nuevamente.';
          }
        );
      } else {
        this.mensaje = 'No hay un pedido en curso para mostrar.';
      }
    },
    (error) => {
      console.error('Error al obtener el pedido en curso', error);
      this.mensaje = 'Error al obtener el pedido en curso. Intenta nuevamente.';
    }
  );

    this.tarjetaService.obtenerTarjetaCliente()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (tarjetaResponse) => {
          this.tarjetasCliente = tarjetaResponse.data;
          this.filteredTarjetas = tarjetaResponse.data;
          if (this.tarjetasCliente.length === 0) {
            this.mensaje = 'No se han encontrado tarjetas asociadas a este cliente.';
          }
        },
        (error) => {
          console.error('Error al obtener tarjetas del cliente', error);
          this.mensaje = 'Error al obtener las tarjetas del cliente. Intenta nuevamente.';
        }
      );
  }

  seleccionarTarjeta(tarjeta: any): void {
    this.tarjetaSeleccionada = tarjeta;
    console.log('Tarjeta seleccionada:', this.tarjetaSeleccionada);
  }

  calcularTotal(): number {
    return this.pedidoPlatos.reduce((total, plato) => total + (plato.precio * (plato.cantidad || 0)), 0) +
           this.pedidoBebidas.reduce((total, bebida) => total + (bebida.precio * (bebida.cantidad || 0)), 0);
  }

  finalizarPedido(): void {
    if (!this.tarjetaSeleccionada) {
      this.mensaje = 'Debe seleccionar una tarjeta para finalizar el pedido.';
      return;
    }
    const platos: PlatoPedido[] = this.pedidoPlatos.map(plato => ({ numPlato: plato.numPlato, cantidad: plato.cantidad || 1 }));
    const bebidas: BebidaPedido[] = this.pedidoBebidas.map(bebida => ({ codBebida: bebida.codBebida, cantidad: bebida.cantidad || 1 }));
    const totalImporte = this.calcularTotal();

    this.pedidoService.obtenerPedidoEnCurso().subscribe(
      (pedidoId) => {
        if (pedidoId) {
          this.pedidoService.finalizarPedido(pedidoId, platos, bebidas, totalImporte, this.tarjetaSeleccionada).subscribe(
            (response) => {
              console.log('Pedido finalizado exitosamente', response);
              this.mensaje = 'Pedido finalizado exitosamente';
            },
            (error) => {
              console.error('Error al finalizar el pedido', error);
              this.mensaje = 'Error al finalizar el pedido. Intenta nuevamente.';
            }
          );
        } else {
          console.log('No hay un pedido en curso para finalizar');
          this.mensaje = 'No hay un pedido en curso para finalizar.';
        }
      },
      (error) => {
        console.error('Error al obtener el pedido en curso', error);
        this.mensaje = 'Error al obtener el pedido en curso. Intenta nuevamente.';
      }
    );
  }

  cancelarPedido(): void {
    this.pedidoService.obtenerPedidoEnCurso().subscribe(
      (pedidoId) => {
        if (pedidoId) {
          this.pedidoService.cancelarPedido(pedidoId).subscribe(
            (response) => {
              console.log('Pedido cancelado exitosamente', response);
              this.mensaje = 'Pedido cancelado exitosamente.';
            },
            (error) => {
              console.error('Error al cancelar el pedido', error);
              this.mensaje = 'Error al cancelar el pedido. Intenta nuevamente.';
            }
          );
        } else {
          console.log('No hay un pedido en curso para cancelar');
          this.mensaje = 'No hay un pedido en curso para cancelar.';
        }
      },
      (error) => {
        console.error('Error al obtener el pedido en curso', error);
        this.mensaje = 'Error al obtener el pedido en curso. Intenta nuevamente.';
      }
    );
  }

  marcarPlatoComoRecibido(plato: PlatoConCantidad): void {
    this.pedidoService.obtenerPedidoEnCurso().subscribe(
      (nroPed) => {
        if (nroPed) {
          this.pedidoService.marcarPlatoComoRecibido(nroPed, plato.numPlato).subscribe(
            (response) => {
              console.log('Plato marcado como recibido exitosamente', response);
              this.mensaje = `Plato ${plato.descripcion} marcado como recibido exitosamente.`;
            },
            (error) => {
              console.error('Error al marcar el plato como recibido', error);
              this.mensaje = `Error al marcar el plato ${plato.descripcion} como recibido.`;
            }
          );
        } else {
          console.log('No hay un pedido en curso para marcar el plato como recibido');
          this.mensaje = 'No hay un pedido en curso para marcar el plato como recibido.';
        }
      },
      (error) => {
        console.error('Error al obtener el pedido en curso', error);
        this.mensaje = 'Error al obtener el pedido en curso. Intenta nuevamente.';
      }
    );
  }
eliminarPlatoDelPedido(plato: PlatoConCantidad): void {
  this.pedidoService.obtenerPedidoEnCurso().subscribe(
    (nroPed) => {
      if (nroPed) {
        this.pedidoService.eliminarPlatoDelPedido(nroPed, plato.numPlato).subscribe(
          (response) => {
            console.log('Plato eliminado del pedido exitosamente', response);
            this.mensaje = `Plato ${plato.descripcion} eliminado del pedido exitosamente.`;

            this.pedidoPlatos = this.pedidoPlatos.filter(p => p.numPlato !== plato.numPlato);
          },
          (error) => {
            console.error('Error al eliminar el plato', error);
            this.mensaje = `Error al eliminar el plato ${plato.descripcion}.`;
          }
        );
      } else {
        console.log('No hay un pedido en curso para eliminar el plato');
        this.mensaje = 'No hay un pedido en curso para eliminar el plato.';
      }
    },
    (error) => {
      console.error('Error al obtener el pedido en curso', error);
      this.mensaje = 'Error al obtener el pedido en curso. Intenta nuevamente.';
    }
  );
}


eliminarBebida(bebida: any): void {
  this.pedidoService.obtenerPedidoEnCurso().subscribe(
    (nroPed) => {
      if (nroPed) {
        const fecha = bebida.fechaSolicitud;
        const hora = bebida.horaSolicitud;

        this.pedidoService.eliminarBebidaDelPedido(nroPed, bebida.codBebida).subscribe(
          (response) => {
            console.log('Bebida eliminada del pedido exitosamente', response);
            this.mensaje = `Bebida ${bebida.descripcion} eliminada del pedido exitosamente.`;

            this.pedidoBebidas = this.pedidoBebidas.filter(b => b.codBebida !== bebida.codBebida);
          },
          (error) => {
            console.error('Error al eliminar la bebida', error);
            this.mensaje = `Error al eliminar la bebida ${bebida.descripcion}.`;
          }
        );
      } else {
        console.log('No hay un pedido en curso para eliminar la bebida');
        this.mensaje = 'No hay un pedido en curso para eliminar la bebida.';
      }
    },
    (error) => {
      console.error('Error al obtener el pedido en curso', error);
      this.mensaje = 'Error al obtener el pedido en curso. Intenta nuevamente.';
    }
  );
}

  marcarBebidaComoRecibida(bebida: BebidaConCantidad): void {
    this.pedidoService.obtenerPedidoEnCurso().subscribe(
      (nroPed) => {
        if (nroPed) {
          this.pedidoService.marcarBebidaComoRecibida(nroPed, bebida.codBebida).subscribe(
            (response) => {
              console.log('Bebida marcada como recibida exitosamente', response);
              this.mensaje = `Bebida ${bebida.descripcion} marcada como recibida exitosamente.`;
            },
            (error) => {
              console.error('Error al marcar la bebida como recibida', error);
              this.mensaje = `Error al marcar la bebida ${bebida.descripcion} como recibida.`;
            }
          );
        } else {
          console.log('No hay un pedido en curso para marcar la bebida como recibida');
          this.mensaje = 'No hay un pedido en curso para marcar la bebida como recibida.';
        }
      },
      (error) => {
        console.error('Error al obtener el pedido en curso', error);
        this.mensaje = 'Error al obtener el pedido en curso. Intenta nuevamente.';
      }
    );
  }
}

